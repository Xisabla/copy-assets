#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import copy from './index'
var index_1 = __importStar(require("./index"));
var path_1 = __importDefault(require("path"));
var pkg = require('../package.json');
if (process.argv.length > 2) {
    var config = parseInput(process.argv.slice(2));
    if (typeof config === 'boolean') {
        usage();
    }
    else {
        index_1.default(config);
    }
}
else {
    usage();
}
function getOptions(args, option) {
    return args.filter(function (arg) { return RegExp('^' + option + '=').test(arg); })
        .map(function (arg) { return arg.replace(option + '=', ''); });
}
function parseInput(args) {
    var config = {
        src: path_1.default.resolve('./'),
        dist: path_1.default.resolve('./dist'),
        whitelist: [],
        blacklist: [],
        importWebpack: false,
        webpackConfig: null,
        verbose: false
    };
    // Help
    if (args.find(function (arg) { return arg === '--help'; }))
        return false;
    // Source
    if (args[0] && !(/^(-|--)/.test(args[0]))) {
        config.src = path_1.default.resolve(args[0]);
        args.splice(0, 1);
    }
    else {
        throw new Error('First argument must be the source');
    }
    // Destination
    if (args[0] && !(/^(-|--)/.test(args[0]))) {
        config.dist = path_1.default.resolve(args[0]);
        args.splice(0, 1);
    }
    else {
        throw new Error('Second argument must be the destination');
    }
    // Simple extensions
    getOptions(args, '--ext')
        .forEach(function (ext) { return config.whitelist.push({ extension: index_1.serializeExtension(ext) }); });
    // Mixed extensions
    getOptions(args, '--exts')
        .join(',')
        .split(',')
        .filter(function (ext) { return ext !== ''; })
        .forEach(function (ext) { return config.whitelist.push({ extension: index_1.serializeExtension(ext) }); });
    // Prefixs
    getOptions(args, '--prefix')
        .forEach(function (prefix) { return config.whitelist.push({ prefix: prefix }); });
    // Suffixs
    getOptions(args, '--suffix')
        .forEach(function (suffix) { return config.whitelist.push({ suffix: suffix }); });
    // Allow Regex
    getOptions(args, '--allowRegex')
        .forEach(function (regex) { return config.whitelist.push({ regex: new RegExp(regex) }); });
    // Ban Regex
    getOptions(args, '--banRegex')
        .forEach(function (regex) { return config.blacklist.push({ regex: new RegExp(regex) }); });
    // Webpack
    if (args.find(function (arg) { return arg === '-w'; })) {
        var id = args.findIndex(function (arg) { return arg === '-w'; });
        if (id + 1 >= args.length)
            throw new Error('Webpack config file must be specified after -w');
        config.importWebpack = true;
        config.webpackConfig = args[id + 1];
        args.splice(id, 2);
    }
    if (args.find(function (arg) { return (/^--importWebpack=/.test(arg)); })) {
        var id = args.findIndex(function (arg) { return (/^--importWebpack=/.test(arg)); });
        config.importWebpack = true;
        config.webpackConfig = args[id].replace('--importWebpack=', '');
        args.splice(id, 1);
    }
    // Verbose
    if (args.find(function (arg) { return arg === '--verbose'; }))
        config.verbose = true;
    return config;
}
function usage() {
    console.log("   " + pkg.name + " v" + pkg.version + " - " + pkg.description + "\n\nUsage: " + pkg.name + " <source> <destination> [options]\n\n  Options:\n\n    --help - Show this\n\n    --ext=.js - Allow files with a specific suffix\n\n    --exts=\".js,.css,.cscc\" - Same as --ext but works will multiple extensions at once, joined with a \",\"\n\n    --prefix=dist_ - Allow files with a specific prefix\n\n    --suffix=_dist - Allow files with a specific suffix\n\n    --allowRegex=\"^prefix_\" - Allow files matching regex\n\n    --banRegex=\"^prefix_\" - Ban files matching regex\n\n    --importWebpack=webpack.config.js, -w webpack.config.js - Import extensions from webpack rules\n\n    --verbose, v - Print out some info\n\n    Note: Using !, * or other special selectors will not work, maybe it would one day");
}
