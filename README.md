zcomp
=====

The Z transpiler

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/zcomp.svg)](https://www.npmjs.com/package/@zlanguage/zcomp)
[![Downloads/week](https://img.shields.io/npm/dw/zcomp.svg)](https://www.npmjs.com/package/@zlanguage/zcomp)
[![License](https://img.shields.io/npm/l/zcomp.svg)](https://github.com/zlanguage/zcomp/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->

```sh-session
$ npm install -g @zlanguage/zcomp
$ npm install -g @zlanguage/zstdlib
$ npm install -g globby
$ npm link zstdlib
$ zcomp COMMAND
running command...
$ zcomp (-v|--version|version)
zcomp/0.0.0 darwin-x64 node-v10.16.0
$ zcomp --help [COMMAND]
USAGE
  $ zcomp COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`zcomp help [COMMAND]`](#zcomp-help-command)
* [`zcomp transpile`](#zcomp-transpile)

## `zcomp help [COMMAND]`

display help for zcomp

```
USAGE
  $ zcomp help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.0/src/commands/help.ts)_

## `zcomp transpile`

Turns a *.zlang* file into a *.js* file which can then be run w/ node.

```
USAGE
  $ zcomp transpile

ARGS
  1. The path of the file to transpile
  2. Where the file should be transpiled to
```

_See code: [src/commands/transpile.js](https://github.com/zlanguage/zcomp/blob/v0.0.0/src/commands/transpile.js)_
<!-- commandsstop -->
