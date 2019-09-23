# zcomp


The Z transpiler/interpreter

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@zlanguage/zcomp.svg)](https://www.npmjs.com/package/@zlanguage/zcomp)
[![Downloads/week](https://img.shields.io/npm/dw/@zlanguage/zcomp.svg)](https://www.npmjs.com/package/@zlanguage/zcomp)
[![License](https://img.shields.io/npm/l/zcomp.svg)](https://github.com/zlanguage/zcomp/blob/master/package.json)

# Z

A transpiled language that can be evaluated as a script (for testing) or transpiled to human-readable JS (for production code). Z supports modules, functions, closure, error handling, and many more features you would expect from a modern language. Is it ready for production code? I'd wait a few months before that.

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
$ npm link @zlanguage/zstdlib
```


However, if you are using Z for a web app (or npm package), and want to deploy it to the world, instead run the following two commands:
```sh
$ npm init
$ npm install @zlanguage/zstdlib
```
This installs the Z standard library locally in just the paackage you need it for.

# Use The Compiler

Transpile Z Code:
```sh
$ zcomp transpile [path of Z to transpile] [path of where to output the transpiled JS]
```
Run Z Code:
```sh
$ zcomp run [path of Z to run]
```
Transpile one directory to another:
```sh
$ zcomp dirt [path of directory with Z] [path of "out" directory]
```
Watch a file for changes, and transpile when the file is changed:
```sh
$ zcomp watch [path of Z to watch and transpile] [path of where to output the transpiled JS]
```
# Docs
The docs are on the offical [Z Website](https://zlanguage.github.io/).

# Z 0.3.19 is out!
New features:
- Extractors and Predicates are greatly improved
- 60%+ Code Coverage
