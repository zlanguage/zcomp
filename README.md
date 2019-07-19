zcomp
=====

The Z transpiler/interpreter

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@zlanguage/zcomp.svg)](https://www.npmjs.com/package/@zlanguage/zcomp)
[![Downloads/week](https://img.shields.io/npm/dw/@zlanguage/zcomp.svg)](https://www.npmjs.com/package/@zlanguage/zcomp)
[![License](https://img.shields.io/npm/l/zcomp.svg)](https://github.com/zlanguage/zcomp/blob/master/package.json)

# Z

A transpiled language that can be evaluated as a script (for testing) or transpiled to human-readable JS (for production code). Z supports modules, functions, closure, error handling, and many more features you would expect from a modern language.

# ZComp

The Z Compiler (ZComp) can be installed with:

```sh
$ npm install -g @zlanguage/zcomp
```

Then, you should install the zstdlib (a mix of a runtime and standard library):

```sh
$ npm install -g @zlanguage/zstdlib
```

Next, install `globby`, which is essential to the Z Compiler:

```sh
$ npm install -g globby
```

Finally, navigate to the directory you're using Z in, and type:

```sh
$ npm link zstdlib
```

# Use The Compiler

Transpile Z Code:
```sh
$ zcomp transpile [path of Z to transpile] [path of where to output the transpiled JS]
```
Run Z Code:
```sh
$ zcomp run [path of Z to run]
```

# Docs
Coming soon!

# Z 0.0.5 is out!
New features:
- Compiler `run` command
- Error handling
- Destructuring
- Smart Imports