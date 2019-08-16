const { expect } = require("chai");
const tokenize = require("../src/compiler/tokenize");
const parse = require("../src/compiler/parse");
const gen = require("../src/compiler/gen");
const testStr = "let x: 0";
const testTok = tokenize(testStr)();
const testAst = parse(tokenize(testStr));
const testGened = gen(parse(tokenize(testStr)));
describe("Function Typing Tests", () => {
    describe("Tokenization (tokenize.js)", () => {
        it("should take one (non-optional) parameter.", () => {
            expect(tokenize.length).to.equal(1);
        })
        it("should return a function.", () => {
            expect(tokenize(testStr)).to.be.a("function");
        })
        it("should have returned a function that returns an object.", () => {
            expect(testTok).to.be.a("object");
        })
        it("should have returned a function that returns a proper token.", () => {
            expect(testTok).to.have.any.keys(["id", "lineNumber", "columnNumber", "columnWidth"]);
        })
    })
    describe("Parsing (parse.js)", () => {
        it("should take one parameter: the token generator.", () => {
            expect(parse.length).to.equal(1);
        });
        it("should return an array of objects.", () => {
            expect(testAst).to.satisfy(ast => ast.every(node => typeof node === "object"));
        })
    })
    describe("Code Generation (gen.js)", () => {
        it("should take one formal, non optional parameter: the AST.", () => {
            expect(gen.length).to.equal(1);
        })
        it("should return a string.", () => {
            expect(testGened).to.be.a("string");
        })
        it("should return a string that imports the Z Standard Library.", () => {
            expect(testGened).to.satisfy(testGened => testGened.includes(`const $Z = require("@zlanguage/zstdlib")`));
        })
        it("should return a string that sets strict mode to true.", () => {
            expect(testGened).to.satisfy(testGened => testGened.startsWith(`"use strict"`));
        })
    })
})