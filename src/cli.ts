#!/usr/bin/env node

// import copy from './index'
import copy, { CopyConfig, serializeExtension } from './index'
import path from 'path'

const pkg = require('../package.json')

if (process.argv.length > 2) {
  let config = parseInput(process.argv.slice(2))

  if (typeof config === 'boolean') {
    usage()
  } else {
    copy(config)
  }
} else {
  usage()
}

function getOptions (args: Array<string>, option: string) {

  return args.filter(arg => RegExp('^' + option + '=').test(arg))
    .map(arg => arg.replace(option + '=', ''))

}

function parseInput (args: Array<string>): CopyConfig | boolean {

  let config: CopyConfig = {

    src: path.resolve('./'),
    dist: path.resolve('./dist'),
    whitelist: [],
    blacklist: [],
    importWebpack: false,
    webpackConfig: null,
    verbose: false

  }

  // Help
  if (args.find(arg => arg === '--help')) return false

  // Source
  if (args[0] && !(/^(-|--)/.test(args[0]))) {
    config.src = path.resolve(args[0])
    args.splice(0, 1)
  } else {
    throw new Error('First argument must be the source')
  }

  // Destination
  if (args[0] && !(/^(-|--)/.test(args[0]))) {
    config.dist = path.resolve(args[0])
    args.splice(0, 1)
  } else {
    throw new Error('Second argument must be the destination')
  }

  // Simple extensions
  getOptions(args, '--ext')
    .forEach(ext => config.whitelist.push({ extension: serializeExtension(ext) }))

  // Mixed extensions
  getOptions(args,'--exts')
    .join(',')
    .split(',')
    .filter(ext => ext !== '')
    .forEach(ext => config.whitelist.push({ extension: serializeExtension(ext) }))

  // Prefixs
  getOptions(args,'--prefix')
    .forEach(prefix => config.whitelist.push({ prefix }))

  // Suffixs
  getOptions(args,'--suffix')
    .forEach(suffix => config.whitelist.push({ suffix }))

  // Allow Regex
  getOptions(args, '--allowRegex')
    .forEach(regex => config.whitelist.push({ regex: new RegExp(regex) }))

  // Ban Regex
  getOptions(args, '--banRegex')
    .forEach(regex => config.blacklist.push({ regex: new RegExp(regex) }))

  // Webpack

  if (args.find(arg => arg === '-w')) {

    let id = args.findIndex(arg => arg === '-w')

    if (id + 1 >= args.length) throw new Error('Webpack config file must be specified after -w')

    config.importWebpack = true
    config.webpackConfig = args[id + 1]

    args.splice(id, 2)

  }

  if (args.find(arg => (/^--importWebpack=/.test(arg)))) {

    let id = args.findIndex(arg => (/^--importWebpack=/.test(arg)))

    config.importWebpack = true
    config.webpackConfig = args[id].replace('--importWebpack=', '')

    args.splice(id, 1)

  }

  // Verbose
  if (args.find(arg => arg === '--verbose')) config.verbose = true

  return config

}

function usage () {

  console.log(`   ${pkg.name} v${pkg.version} - ${pkg.description}

Usage: ${pkg.name} <source> <destination> [options]

  Options:

    --help - Show this

    --ext=.js - Allow files with a specific suffix

    --exts=".js,.css,.cscc" - Same as --ext but works will multiple extensions at once, joined with a ","

    --prefix=dist_ - Allow files with a specific prefix

    --suffix=_dist - Allow files with a specific suffix

    --allowRegex="^prefix_" - Allow files matching regex

    --banRegex="^prefix_" - Ban files matching regex

    --importWebpack=webpack.config.js, -w webpack.config.js - Import extensions from webpack rules

    --verbose, v - Print out some info

    Note: Using !, * or other special selectors will not work, maybe it would one day`)

}
