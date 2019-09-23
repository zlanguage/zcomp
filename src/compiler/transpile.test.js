const { expect } = require("chai");
const tokenize = require("./tokenize");
const parse = require("./parse");
const gen = require("./gen");
const tests = {
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
    }
}

function evalZ(z) {
    return eval(gen(parse(tokenize(z))));
}

Object.entries(tests).forEach(([testName, tests]) => {
    describe(testName, () => {
        Object.entries(tests).forEach(([expr, res]) => {
            it(`should evaluate ${expr} as ${res}`, () => {
                expect(evalZ(expr)).to.eql(res);
            })
        })
    })
})
