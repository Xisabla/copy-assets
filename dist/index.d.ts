import { RuleSetRule } from 'webpack';
export interface CopyConfig {
    src: string;
    dist: string;
    whitelist: Array<FileFilter>;
    blacklist: Array<FileFilter>;
    importWebpack: boolean;
    webpackConfig: string | null;
    verbose: boolean;
}
export interface FileFilter {
    extension?: string;
    prefix?: string;
    suffix?: string;
    regex?: RegExp;
    match?: (filename: string, filepath: string) => boolean;
}
export declare function getFiles(directory: string): Array<string>;
export declare function serializeExtension(extension: string): string;
export declare function fileMatchFilter(filepath: string, filter: FileFilter): boolean;
export declare function fileMatchFilters(filepath: string, filters: Array<FileFilter>): boolean;
export declare function fileMatchOne(filepath: string, filters: Array<FileFilter>): boolean;
export declare function filterFiles(files: Array<string>, whitelist: Array<FileFilter>, blacklist?: Array<FileFilter>): Array<string>;
export declare function webpackRulesExtensions(rules: RuleSetRule[]): Array<string>;
export declare function webpackFilters(webpackPath: string, verbose: boolean): Array<FileFilter>;
export default function copy(config: CopyConfig): void;
