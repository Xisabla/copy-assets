# copy-assets

Copy assets with specific extensions, prefix, suffix or thanks to a regex

## Installation

```bash
npm i -g copy-assets

# or locally
npm i --save copy-assets

# then, you might do this
npm i --save-dev copy-assets
```

## Why ?

To be honest, I was bored to use gulp to copy files from my projects sources to the build folder so as to run webpack

I decided to make a command specially for this and then keeping the architecture of the sources but only copying the files I want

Going from this :

```text
|- dist - b - file1.js
\- src
    |- a - file1.png
    |- b - file1.ts
    \- c - file2.png
```

To that :

```text
|- dist - a - file1.png
|   |---- b - file1.js
|   \---- c - file2.png
|
\- src
    |- a - file1.png
    |- b - file1.ts
    \- c - file2.png
```

In one command

## Usage

### API

Basically, running a copy goes like this:

```js
const copy = require('copy-assets').default

copy({
    src: 'path_to_source',
    dist: 'path_to_destination',
    whitelist: [], // Array of filters,
    blacklist: [], // Array of filters,
    importWebpack: true,
    webpackConfig: 'webpack.dev.config.js',
    verbose: true
})
```

If any file match one of the whitelist filters AND none of the blacklist filers, then it will be copied from the source to the destination

The copy will look recursively for the files and then create the needed folders

Every field of the config is required, otherwise, it may crash.

#### Filter

A filter is an object with some optional fields: extension, prefix, suffix, regex, match

```js
let filter = {
  extensions: '.js', // or just 'js',
  prefix: 'prefix_',
  suffix: '_suffix',
  regex: new RegExp('^_anotherOne?'),
  match: function(filename, filepath) {
    return true
  }
}
```

A file should match every fields of a filter to be copied, then you can target only js files with prefix, or suffix, or use a custom matching function

### Cli

This is the purpose of that package, here is the usage:

```text
Usage: copy-assets <source> <destination> [options]

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

    Note: Using !, * or other special selectors will not work, maybe it would one day

```

The most important thing is that you can import extensions from webpack rules automatically

## License

MIT
