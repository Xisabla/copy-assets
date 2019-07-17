"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
function getFiles(directory) {
    var dir = path_1.default.resolve(directory);
    var files = [];
    var elements = fs_1.default.readdirSync(dir);
    elements.forEach(function (element) {
        var elementPath = path_1.default.join(directory, element);
        if (fs_1.default.statSync(elementPath).isDirectory()) {
            files = files.concat(getFiles(elementPath));
        }
        else {
            files.push(elementPath);
        }
    });
    return files;
}
exports.getFiles = getFiles;
function serializeExtension(extension) {
    return extension.charAt(0) === '.' ? extension : '.' + extension;
}
exports.serializeExtension = serializeExtension;
function fileMatchFilter(filepath, filter) {
    var pass = true;
    var filename = path_1.default.basename(filepath);
    if (filter.extension && path_1.default.extname(filepath) !== serializeExtension(filter.extension))
        pass = false;
    if (filter.prefix && !RegExp('^' + filter.prefix).test(filename))
        pass = false;
    if (filter.suffix && !RegExp('^.+\.' + filter.suffix + '$').test(filename))
        pass = false;
    if (filter.match && !filter.match(filename, filepath))
        pass = false;
    if (filter.regex && !filter.regex.test(filename))
        pass = false;
    return pass;
}
exports.fileMatchFilter = fileMatchFilter;
function fileMatchFilters(filepath, filters) {
    var pass = true;
    filters.forEach(function (filter) {
        if (!fileMatchFilter(filepath, filter))
            pass = false;
    });
    return pass;
}
exports.fileMatchFilters = fileMatchFilters;
function fileMatchOne(filepath, filters) {
    var pass = false;
    filters.forEach(function (filter) {
        if (fileMatchFilter(filepath, filter))
            pass = true;
    });
    return pass;
}
exports.fileMatchOne = fileMatchOne;
function filterFiles(files, whitelist, blacklist) {
    if (blacklist === void 0) { blacklist = []; }
    return files.filter(function (file) { return fileMatchOne(file, whitelist) && (blacklist.length === 0 || !fileMatchFilters(file, blacklist)); });
}
exports.filterFiles = filterFiles;
function webpackRulesExtensions(rules) {
    var extensions = [];
    rules.forEach(function (rule) {
        if (rule.test) {
            rule.test.toString()
                .replace('/\\.', '')
                .replace('$/', '')
                .replace('(', '')
                .replace(')', '')
                .split('|')
                .forEach(function (extension) {
                extensions.push(serializeExtension(extension));
            });
        }
    });
    return extensions;
}
exports.webpackRulesExtensions = webpackRulesExtensions;
function webpackFilters(webpackPath, verbose) {
    try {
        var webpack = require(path_1.default.resolve(webpackPath));
        var extensions = webpackRulesExtensions(webpack.module ? webpack.module.rules : []);
        console.log('Imported extensions from webpack: ', extensions, '\n');
        return extensions.map(function (extension) { return { extension: extension }; });
    }
    catch (e) {
        console.error('Could not find webpack config file; Skipped.\n');
        return [];
    }
}
exports.webpackFilters = webpackFilters;
function copy(config) {
    var src = config.src, dist = config.dist, whitelist = config.whitelist, blacklist = config.blacklist, importWebpack = config.importWebpack, webpackConfig = config.webpackConfig, verbose = config.verbose;
    var srcPath = path_1.default.resolve(src);
    var distPath = path_1.default.resolve(dist);
    if (importWebpack) {
        whitelist = whitelist.concat(webpackFilters(webpackConfig || 'webpack.config.js', verbose));
    }
    var files = getFiles(src);
    var filteredFiles = filterFiles(files, whitelist, blacklist);
    filteredFiles.forEach(function (file) {
        var distFile = path_1.default.join(distPath, file.slice(srcPath.length));
        if (!fs_1.default.existsSync(path_1.default.dirname(distFile))) {
            if (verbose)
                console.log('Create: ' + path_1.default.dirname(distFile));
            fs_1.default.mkdirSync(path_1.default.dirname(distFile), { recursive: true });
        }
        if (verbose)
            console.log('Copy: ' + file + ' ---> ' + distFile);
        fs_1.default.copyFileSync(file, distFile);
    });
    if (verbose)
        console.log('\nDone.\n');
}
exports.default = copy;
