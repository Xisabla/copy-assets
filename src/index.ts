import fs from 'fs'
import path from 'path'
import { Configuration, RuleSetRule } from 'webpack'

export interface CopyConfig {

  src: string,
  dist: string,
  whitelist: Array<FileFilter>,
  blacklist: Array<FileFilter>,
  importWebpack: boolean,
  webpackConfig: string | null,
  verbose: boolean

}

export interface FileFilter {

  extension?: string,
  prefix?: string,
  suffix?: string,
  regex?: RegExp,

  match?: (filename: string, filepath: string) => boolean
}

export function getFiles (directory: string): Array<string> {

  const dir = path.resolve(directory)

  let files: Array<string> = []
  let elements = fs.readdirSync(dir)

  elements.forEach(element => {
    const elementPath = path.join(directory, element)

    if (fs.statSync(elementPath).isDirectory()) {
      files = files.concat(getFiles(elementPath))
    } else {
      files.push(elementPath)
    }
  })

  return files

}

export function serializeExtension (extension: string): string {

  return extension.charAt(0) === '.' ? extension : '.' + extension

}

export function fileMatchFilter (filepath: string, filter: FileFilter): boolean {

  let pass = true
  const filename = path.basename(filepath)

  if (filter.extension && path.extname(filepath) !== serializeExtension(filter.extension)) pass = false
  if (filter.prefix && !RegExp('^' + filter.prefix).test(filename)) pass = false
  if (filter.suffix && !RegExp('^.+\.' + filter.suffix + '$').test(filename)) pass = false
  if (filter.match && !filter.match(filename, filepath)) pass = false
  if (filter.regex && !filter.regex.test(filename)) pass = false

  return pass

}

export function fileMatchFilters (filepath: string, filters: Array<FileFilter>): boolean {

  let pass = true

  filters.forEach(filter => {

    if (!fileMatchFilter(filepath, filter)) pass = false

  })

  return pass

}

export function fileMatchOne (filepath: string, filters: Array<FileFilter>): boolean {

  let pass = false

  filters.forEach(filter => {

    if (fileMatchFilter(filepath, filter)) pass = true

  })

  return pass

}

export function filterFiles (files: Array<string>, whitelist: Array<FileFilter>, blacklist: Array<FileFilter> = []): Array<string> {

  return files.filter(file => fileMatchOne(file, whitelist) && (blacklist.length === 0 || !fileMatchFilters(file, blacklist)))

}

export function webpackRulesExtensions (rules: RuleSetRule[]): Array<string> {

  let extensions: Array<string> = []

  rules.forEach(rule => {
    if (rule.test) {
      rule.test.toString()
        .replace('/\\.', '')
        .replace('$/', '')
        .replace('(','')
        .replace(')', '')
        .split('|')
        .forEach(extension => {
          extensions.push(serializeExtension(extension))
        })
    }
  })

  return extensions

}

export function webpackFilters (webpackPath: string, verbose: boolean): Array<FileFilter> {

  try {

    const webpack: Configuration = require(path.resolve(webpackPath))
    let extensions = webpackRulesExtensions(webpack.module ? webpack.module.rules : [])

    console.log('Imported extensions from webpack: ', extensions, '\n')

    return extensions.map(extension => { return { extension } })

  } catch (e) {

    console.error('Could not find webpack config file; Skipped.\n')

    return []

  }

}

export default function copy (config: CopyConfig): void {

  let { src, dist, whitelist, blacklist, importWebpack, webpackConfig, verbose } = config

  const srcPath = path.resolve(src)
  const distPath = path.resolve(dist)

  if (importWebpack) {
    whitelist = whitelist.concat(webpackFilters(webpackConfig || 'webpack.config.js', verbose))
  }

  const files = getFiles(src)
  const filteredFiles = filterFiles(files, whitelist, blacklist)

  filteredFiles.forEach(file => {
    let distFile = path.join(distPath, file.slice(srcPath.length))

    if (!fs.existsSync(path.dirname(distFile))) {
      if (verbose) console.log('Create: ' + path.dirname(distFile))

      fs.mkdirSync(path.dirname(distFile), { recursive: true })
    }

    if (verbose) console.log('Copy: ' + file + ' ---> ' + distFile)
    fs.copyFileSync(file, distFile)
  })

  if (verbose) console.log('\nDone.\n')

}
