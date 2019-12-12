const {
    expect
} = require("chai");
const tokenize = require("../src/compiler/tokenize");
const parse = require("../src/compiler/parse");
const gen = require("../src/compiler/gen");
const evalTests = {
    "math and string manipulations": {
        "3 + 3": 6,
        "2 - 2": 0,
        "2 - 9": -7,
        "3 * 7": 21,
        "6 / 2": 3,
        "3 + 2 * 7": 17,
        "3 / 3 - 2": -1,
        "0.5 + 0.25": 0.75,
        "0.125 - 0.25 * 0.5": 0,
        "0.125 / 4 * 10": 0.3125,
        "-3.2 + -3": -6.2,
        "2 ^ 3": 8,
        "2 pow 3": 8,
        "2 ^ 3 ^ 3": 512,
        "2 pow 3 pow 3": 134217728,
        "1 pow 0": 1,
        "2 * 3 ^ 3 + 2": 56,
        "5 % 2": 1,
        "5 % 2 + 1": 2,
        "[1, 2, 3] ++ [4, 5, 6]": [1, 2, 3, 4, 5, 6],
        '"Hello" ++ " World"': "Hello World",
        '"[" ++ [1, 2, 3] ++ "]"': "[1,2,3]"
    },
    "relational and boolean logic operators": {
        "true and false": false,
        "true or false": true,
        "true and false or false": false,
        "3 = 3": true,
        "0.1 + 0.2 = 0.3": true,
        "2 = 3": false,
        '"Hello" = "Hello"': true,
        '"Hello" = "World"': false,
        'not("Hello" = "World")': true,
        "[1, 2, 3] = (1, 2, 3)": true,
        "[[1], [2], [3]] = ([1], [2], [3])": true,
        "[1, 2, 4] = {1, 2, 3}": false,
        '["x": 3, "y": 4] = ["x": 3, "y": 4]': true,
        '["x": 3, "y": 5] = ["x": 3, "y": 4]': false,
        "3 > 2": true,
        "2 > 3": false,
        "2 < 3": true,
        "3 < 2": false,
        "3 >= 3": true,
        "3 >= 2": true,
        "3 >= 4": false,
        "3 <= 3": true,
        "3 <= 4": true,
        "3 <= 2": false,
        "copy(if (true) 3 else 5)": 3,
        "copy(if (false) 3 else 5)": 5,
        "copy(if (true) 3 else if (false) 7 else 4)": 3,
        "copy(if (false) 3 else if (true) 7 else 4)": 7,
        "copy(if (false) 3 else if (false) 7 else 4)": 4
    },
    "refinements, subscripts, and invocations": {
        "copy(func(){}())": undefined,
        "copy(console.log)": console.log,
        "copy(console[\"log\"])": console.log,
        "copy(console.log.call)": console.log.call,
        "copy(console[\"log\"].call)": console.log.call,
        "copy(console..log..call)": console.log.call,
        "copy(console..foo..call)": undefined,
        "copy(\"Hello\").slice(0, -1)": "Hell",
        "copy(undefined..x..y)": undefined,
        "\"Hello\"..slice(0, -1)": "Hell"
    },
    "functions": {
        "copy(func x! + 2)(2)": 4,
        "copy(func () @@iterator)()": Symbol.iterator,
        [`copy(func (x number!, y number!) number! {
            return x + y
        })(3, 4)`]: 7,
    },
    "enums": {
        [`enum Point(x: number!, y: number!)
        Point(3, 4).x
        `]: 3,
        [`enum Point(x: number!, y: number!)
        Point(y: 3, x: 4).y
        `]: 3,
        [`importstd traits
        def { Show, Enum }: traits
        enum Color {
            Red,
            Orange,
            Yellow,
            Green,
            Blue,
            Purple
        } derives (Show, Enum)
        Red().succ().toString()`]: "Orange()"
    },
    "loop expressions": {
        "[] ++ loop(x <- 1...10) x": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        "[] ++ loop(x <- 1 to 10, if x % 2 = 0) x * 2": [4, 8, 12, 16, 20],
        "[] ++ loop(x <- 1 to 10, y: x * 2, if y % 4 = 0) x": [2, 4, 6, 8, 10],
        "[] ++ loop(x <- 1 to 3, if x % 2 = 0, y <- 1 to 3, z: x * y) z": [2, 4, 6]
    },
    "pattern matching": {
        [`match 3 {
            3 => "yes",
            _ => "no"
        }`]: "yes",
        [`match 4 {
            3 => "yes",
            _ => "no"
        }`]: "no",
        [`match [1, 2, 3] {
            (number!n, ...xs) => xs,
            _ => "no"
        }`]: [2, 3],
        [`match 3 {
            number! => "A number.",
            string! => "A string.",
            array! => "An array",
            _ => "Something else."
        }`]: "A number.",
        [`match "hola" {
            number! => "A number.",
            string! => "A string.",
            array! => "An array",
            _ => "Something else."
        }`]: "A string.",
        [`match [1, 2, 3] {
            number! => "A number.",
            string! => "A string.",
            array! => "An array",
            _ => "Something else."
        }`]: "An array",
        [`match \`a\` {
            number! => "A number.",
            string! => "A string.",
            array! => "An array",
            _ => "Something else."
        }`]: "Something else.",
        [`match ["x": 3, "y": 4] {
            { x: number!, y: number! } => "A point-like object.",
            _ => "no"
        }`]: "A point-like object."
    },
    "macros": {
        [`macro $hello () {
            return ~{
                "Hey"
            }~
        }
        copy($hello)`]: "Hey",
        [`macro $join(~l:expr, ~r:expr) {
            return ~{
                {{~l}} ++ " " ++ {{~r}}
            }~
        }
        copy($join "Hello" "World")`]: "Hello World",
        [`macro $proc(~body:block) {
            return ~{
                func () {
                    {{~body}}
                }
            }~
        }
        copy($proc {
            return 3
        })()`]: 3,
        [`macro operator ->(~param:expr, ~body:expr) {
            return ~{
                func ({{~param}}) {
                    return {{~body}}
                }
            }~
        }
        copy(x -> x * 2)(5)`]: 10,
        [`macro $do (~body:block, while, ~cond:expr) {
            return ~{
               loop {
                   {{~body}}
                   if not({{~cond}}) {
                       break
                   }
               }
           }~
       }

       macro $do (~body:block, until, ~cond:expr) {
            return ~{
               loop {
                   {{~body}}
                   if {{~cond}} {
                       break
                   }
               }
           }~
       }

       macro $do (~body:block, unless, ~cond:expr) {
            return ~{
             if not({{~cond}}) {
               {{~body}}
             }
           }~
       }`]: "use strict",
        [`macro $switch (...{case, ~body:block},) {

       }`]: "use strict"
    }
}

const transpileTests = {
    "variable declarations": {
        "let x: 0": "let x = 0;",
        "let x: 0, y: 0": "let x = 0, y = 0;",
        "def x: 0": "const x = 0;",
        "def x: 0, y: 0": "const x = 0, y = 0;",
        "hoist x: 0": "var x = 0;",
        "hoist x: 0, y: 0": "var x = 0, y = 0;"
    },
    "modules": {
        "import foo": `const foo = stone(require("foo"));`,
        'import foo: "./foo"': `const foo = stone(require("./foo"));`,
        'import ramda.src.map': `const map = stone(require("ramda/src/map"));`,
        "importstd gr": 'const gr = stone(require("@zlanguage/zstdlib/src/js/gr"));',
        "export fooey": "module.exports = stone(fooey);"
    },
    "$Z Macro": {
        "log($Z)": "log($Z);"
    },
    "include": {
        'includestd "imperative"': ""
    },
    "control flow": {
        "if foo { log(bar) }": `if (assertBool(foo)) {
            log(bar);
        }`,
        "log(bar) if foo": `if (assertBool(foo)) {
          log(bar);
      }`,
        "if foo { log(bar) } else if fooey { log(baree) } else { log(foobar) }": `if (assertBool(foo)) {
            log(bar);
          } else {
            if (assertBool(fooey)) {
              log(baree);
            } else {
              log(foobar);
            }
          }`,
        'loop { log("YAY") }': `while (true) {
            log("YAY");
          }`
    },
    "error handling": {
        [`try {
            raise "FOOEY"
          } on err {
            settle err
          }`]: `try {
            throw new Error("FOOEY");
          } catch (err) {
            err["settled"] = true;
            if (assertBool($eq(err["settled"], undefined))) {
              throw new Error("Error err not settled.")
            }
          }
          `
    },
    "goroutines": {
        [`copy(go func () {
            get fooey()
          })`]: `copy(async function () {
            await fooey()._from();
          });
          `,
        [`go {
            get fooey()
        }`]: `(async function () {
            await fooey()._from();
          })();
          `,
        "get foo": `const $main = async function () {
          await foo._from();
        };
        $main();`
    },
    "comments": {
        "# Hola": ""
    },
    "enums": {
        [`enum Foo {
            Bar(x: number!),
            Baz(y: _!, z: number!)
          } derives (Nada) where {
            foobar () {}
          } `]: `function Bar(x) {

            if($eq(Object.keys((x == null) ? { [Symbol()]: 0 } : x).sort(), ["x"].sort())) {
              ({ x } = x);
            }


            if (typeOf(x) !== "number") {
              throw new Error("Foo.Bar.x must be of type number. However, you passed " + x + " to Foo.Bar which is not of type number.");
            }

            return Nada({
              type() { return "Foo"; },
              get constructor() { return Bar; },
              get parent() { return Foo; },
              get fields() { return ["x"]; },
              get x(){ return x; },
              "="(other) {
                return other.constructor === Bar && $eq(x, other.x);
              }
            });
          }

          Bar.extract = function (val) {
            if (val.constructor === Bar) {
              return [val.x];
            }
            return undefined;
          };

          function Baz(y, z) {

            if($eq(Object.keys((y == null) ? { [Symbol()]: 0 } : y).sort(), ["y", "z"].sort())) {
              ({ y, z } = y);
            }


            if (typeOf(z) !== "number") {
              throw new Error("Foo.Baz.z must be of type number. However, you passed " + z + " to Foo.Baz which is not of type number.");
            }

            return Nada({
              type() { return "Foo"; },
              get constructor() { return Baz; },
              get parent() { return Foo; },
              get fields() { return ["y", "z"]; },
              get y(){ return y; },
                  get z(){ return z; },
              "="(other) {
                return other.constructor === Baz && $eq(y, other.y) && $eq(z, other.z);
              }
            });
          }

          Baz.extract = function (val) {
            if (val.constructor === Baz) {
              return [val.y, val.z];
            }
            return undefined;
          };

          let Foo = {
            order: [Bar, Baz],
            Bar,
              Baz
          };
          Foo.foobar = function () {
          };

          `,
        [`enum Point(x: number!, y: number!) where {
            nada () {}
          }`]: `function Point(x, y) {

            if($eq(Object.keys((x == null) ? { [Symbol()]: 0 } : x).sort(), ["x", "y"].sort())) {
              ({ x, y } = x);
            }


            if (typeOf(x) !== "number") {
              throw new Error("Point.Point.x must be of type number. However, you passed " + x + " to Point.Point which is not of type number.");
            }

            if (typeOf(y) !== "number") {
              throw new Error("Point.Point.y must be of type number. However, you passed " + y + " to Point.Point which is not of type number.");
            }

            return {
              type() { return "Point"; },
              get constructor() { return Point; },
              get parent() { return Point; },
              get fields() { return ["x", "y"]; },
              get x(){ return x; },
                  get y(){ return y; },
              "="(other) {
                return other.constructor === Point && $eq(x, other.x) && $eq(y, other.y);
              }
            };
          }

          Point.extract = function (val) {
            if (val.constructor === Point) {
              return [val.x, val.y];
            }
            return undefined;
          };

          Point.order = [Point];

          Point.nada = function () {
          };`
    },
    "advanced function & features": {
        "x number!: 3": `x = assertType("number", 3);`,
        [`func (x number!) number! {
        return x
      }`]: `function (x) {
        if (!($eq(typeOf(x), "number"))) { throw new Error("Enter failed") }
        return assertType("number", x);
      };`,
        "func () { exit { log(\"Hello World\") } }": `function (){ try {  {

      } } finally { if (!(log("Hello World"))) { throw new Error("Exit failed") } } };`,
        "Math.pow(@, @)": `curry(function ($, $$) {
        return Math["pow"]($, $$);
      });`,
        ".val": `function (obj) {
        return obj["val"];
      };`
    },
    "metadata": {
        "operator +: 1000": "/* operator $plus = 1000 */"
    }
}

function evalZ(z) {
    return eval(gen(parse(tokenize(z))));
}

function transpileZ(z) {
    return gen(parse(tokenize(z)), false)
}

Object.entries(evalTests).forEach(([testName, tests]) => {
    describe(testName, () => {
        Object.entries(tests).forEach(([expr, res]) => {
            it(`should evaluate ${expr} as ${res == null ? res : res.toString()}`, () => {
                expect(evalZ(expr)).to.eql(res);
            })
        })
    })
})

Object.entries(transpileTests).forEach(([testName, tests]) => {
    describe(testName, () => {
        Object.entries(tests).forEach(([expr, res]) => {
            it(`should transpile ${expr} to ${res == null ? res : res.toString()}`, () => {
                expect(transpileZ(expr).split("\n").map(x => x.trim()).join("")).to.eql(res.split("\n").map(x => x.trim()).join(""));
            })
        })
    })
})
