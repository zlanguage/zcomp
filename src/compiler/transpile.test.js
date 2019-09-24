const { expect } = require("chai");
const tokenize = require("./tokenize");
const parse = require("./parse");
const gen = require("./gen");
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
        "2 ^ 3": 8,
        "2 pow 3": 8,
        "2 ^ 3 ^ 3": 512,
        "2 pow 3 pow 3": 134217728,
        "0 pow 0": "undefined",
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
        "[] ++ loop(x <- 1 to 10) x": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
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
                expect(transpileZ(expr).replace(/\n$/, "")).to.eql(res.replace(/\n$/, ""));
            })
        })
    })
})
