import tokenize from "../tokenize";
import parse from "../parse";
import gen from "../gen";
const testStr = "let x: 0";
const testTok = tokenize(testStr)();
const testAst = parse(tokenize(testStr));
const testGened = gen(parse(tokenize(testStr)));

describe("Tokenization", () => {
  it("should take one (non-optional) parameter", () => {
    expect(tokenize.length).toBe(1);
  });

  it("should return a function", () => {
    expect(tokenize(testStr)).toBeInstanceOf(Function);
  });

  it("should have returned a function that returns an object", () => {
    expect(testTok).toBeInstanceOf(Object);
  });

  it("should have returned a function that returns a proper token", () => {
    expect(
      Object.prototype.hasOwnProperty.call(testTok, "id") ||
        Object.prototype.hasOwnProperty.call(testTok, "lineNumber") ||
        Object.prototype.hasOwnProperty.call(testTok, "columnNumber") ||
        Object.prototype.hasOwnProperty.call(testTok, "columnWidth")
    ).toBe(true);
  });

  it("should produce error AST", () => {
    expect(tokenize("✔️")()).toEqual({
      id: "(error)",
      lineNumber: 0,
      columnNumber: 0,
      columnTo: 0,
      string: "",
      string: "✔️",
    });
  });
});

describe("Parsing", () => {
  it("should take one parameter: the token generator", () => {
    expect(parse.length).toBe(1);
  });

  it("should return an array of objects", () => {
    testAst.forEach((ast) => expect(ast).toBeInstanceOf(Object));
  });
});

describe("Code generation", () => {
  it("should take one formal, non optional parameter: the AST", () => {
    expect(gen.length).toBe(1);
  });

  it("should return a string", () => {
    expect(typeof testGened === "string").toBe(true);
  });

  it("should return a string that imports the Z Standard Library", () => {
    expect(testGened).toContain('var $Z = require("@zlanguage/zstdlib")');
  });

  it("should return a string that sets strict mode to true", () => {
    expect(testGened.startsWith(`"use strict"`)).toBe(true);
  });
});
