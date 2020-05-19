# zcomp

The Z transpiler/interpreter

[![Version](https://img.shields.io/npm/v/@zlanguage/zcomp.svg)](https://www.npmjs.com/package/@zlanguage/zcomp)
[![Downloads/week](https://img.shields.io/npm/dw/@zlanguage/zcomp.svg)](https://www.npmjs.com/package/@zlanguage/zcomp)
[![License](https://img.shields.io/npm/l/@zlanguage/zcomp.svg)](https://github.com/zlanguage/zcomp/blob/master/LICENSE)

## Z

A transpiled language that can be evaluated as a script (for testing) or transpiled to human-readable JS (for production code). Z supports modules, functions, closure, error handling, and many more features you would expect from a modern language. Is it ready for production code? I'd wait a few months before that.

## ZComp

The Z Compiler (ZComp) can be installed with:

```sh
$ npm install -g @zlanguage/zcomp
```

Then, you should install the zstdlib (a runtime library):

```sh
$ npm install -g @zlanguage/zstdlib
```

Finally, navigate to the directory you're using Z in, and type:

```sh
$ npm install @zlanguage/zstdlib
```

This installs the Z standard library locally in just the paackage you need it for.

### Use the Compiler

Transpile Z Code:

```sh
$ zcomp transpile [path of Z to transpile] [path of where to output the transpiled JS]
```

Run Z Code:

```sh
$ zcomp run [path of Z to run]
```

## Docs

The docs are on the offical [Z Website](https://zlanguage.github.io/).
