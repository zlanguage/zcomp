import tokenize from "../tokenize";
import parse from "../parse";
import gen from "../gen";

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
    '"[" ++ [1, 2, 3] ++ "]"': "[1,2,3]",
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
    "copy(if (false) 3 else if (false) 7 else 4)": 4,
  },
  "refinements, subscripts, and invocations": {
    "copy(func(){}())": undefined,
    "copy(console.log)": console.log,
    'copy(console["log"])': console.log,
    "copy(console.log.call)": console.log.call,
    'copy(console["log"].call)': console.log.call,
    "copy(console..log..call)": console.log.call,
    "copy(console..foo..call)": undefined,
    'copy("Hello").slice(0, -1)': "Hell",
    "copy(undefined..x..y)": undefined,
    '"Hello"..slice(0, -1)': "Hell",
  },
  functions: {
    "copy(func x! + 2)(2)": 4,
    "copy(func () @@iterator)()": Symbol.iterator,
    [`copy(func (x number!, y number!) number! {
            return x + y
        })(3, 4)`]: 7,
  },
  enums: {
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
        Red().succ().toString()`]: "Orange()",
  },
  "loop expressions": {
    "[] ++ loop(x <- 1...10) x": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "[] ++ loop(x <- 1 to 10, if x % 2 = 0) x * 2": [4, 8, 12, 16, 20],
    "[] ++ loop(x <- 1 to 10, y: x * 2, if y % 4 = 0) x": [2, 4, 6, 8, 10],
    "[] ++ loop(x <- 1 to 3, if x % 2 = 0, y <- 1 to 3, z: x * y) z": [2, 4, 6],
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
        }`]: "A point-like object.",
  },
  macros: {
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

       }`]: "use strict",
  },
};

const transpileTests = {
  "variable declarations": [
    "let x: 0",
    "let x: 0, y: 0",
    "def x: 0",
    "def x: 0, y: 0",
    "hoist x: 0",
    "hoist x: 0, y: 0",
  ],
  modules: [
    "import foo",
    'import foo: "./foo"',
    "import ramda.src.map",
    "importstd gr",
    "export fooey",
  ],
  "$Z Macro": ["log($Z)"],
  include: ['includestd "imperative"'],
  "control flow": [
    "if foo { log(bar) }",
    "log(bar) if foo",
    "if foo { log(bar) } else if fooey { log(baree) } else { log(foobar) }",
    'loop { log("YAY") }',
  ],
  "error handling": [
    `try {
            raise "FOOEY"
          } on err {
            settle err
          }`,
  ],
  goroutines: [
    `copy(go func () {
            get fooey()
          })`,
    `go {
            get fooey()
        }`,
    "get foo",
  ],
  comments: ["# Hola"],
  enums: [
    `enum Foo {
            Bar(x: number!),
            Baz(y: _!, z: number!)
          } derives (Nada) where {
            foobar () {}
          } `,
    `enum Point(x: number!, y: number!) where {
            nada () {}
          }`,
  ],
  "advanced function & features": [
    "x number!: 3",
    `func (x number!) number! {
        return x
      }`,
    'func () { exit { log("Hello World") } }',
    "Math.pow(@, @)",
    ".val",
  ],
  metadata: ["operator +: 1000"],
};

function evalZ(z) {
  return eval(gen(parse(tokenize(z))));
}

function transpileZ(z) {
  return gen(parse(tokenize(z)), false);
}

describe("Evaluation tests", () => {
  Object.entries(evalTests).forEach(([testName, tests]) => {
    describe(testName, () => {
      Object.entries(tests).forEach(([expr, res]) => {
        it(`should evaluate ${expr} as ${
          res == null ? res : res.toString()
        }`, () => {
          expect(evalZ(expr)).toStrictEqual(res);
        });
      });
    });
  });
});

describe("Transpiling snapshot tests", () => {
  Object.entries(transpileTests).forEach(([testName, tests]) => {
    describe(`(${testName})`, () => {
      tests.forEach((test) => {
        it(`should transpile ${test} to the snapshot`, () => {
          expect(
            transpileZ(test)
              .split("\n")
              .map((x) => x.trim())
              .join("")
          ).toMatchSnapshot();
        });
      });
    });
  });
});
