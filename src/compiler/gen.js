const runtime = require("@zlanguage/zstdlib");
const prims = Object.keys(runtime);
let res = `"use strict";

const $Z = require("@zlanguage/zstdlib");

${prims.map(name => `const ${name} = $Z.${name};`).join("\n")}

`;
let ast;
let index = 0;
let curr;
let padstart = 0;

function indent() {
  padstart += 2;
}

function outdent() {
  padstart -= 2;
}
function zStringify(thing) {
  if (typeof thing === "string") {
    return thing;
  } else if (isExpr(thing)) {
    let anchor = curr;
    curr = thing;
    let res = genExpr();
    curr = anchor;
    return res;
  } else if (typeof thing === "number") {
    return thing.toString();
  } else if (thing.species === "Object") {
    indent()
    const anchor = curr;
    const obj = thing.map(([k, v]) => {
      return `[${(() => {
        curr = k;
        return genExpr();
      })()}]: ${(() => {
        curr = v;
        return genExpr();
      })()}`
    }).map(x => x.padStart(padstart + x.length)).join(",\n")
    curr = anchor;

    outdent();
    return "{\n" + obj + "\n" + "}".padStart(padstart + 1);
  } else if (Array.isArray(thing)) {
    if(thing.toString() === ":"){
      return "{}";
    }
    const anchor = curr;
    const arr = thing.map(expr => {
      curr = expr;
      return genExpr();
    }).join(", ");
    curr = anchor;
    return `[${arr}]`;
  } else {
    return thing;
  }
}
function genParameterList() {
  let r = curr.wunth.map(parameter => {
    curr = parameter;
    return genExpr();
  });
  return r.join(", ");
}
function genExprTwoth() {
  let r = "";
  switch (curr.type) {
    case "refinement":
      r += `["${curr.wunth}"]`;
      r += genTwoth();
      break;
    case "subscript":
      r += `[${zStringify(curr.wunth)}]`;
      r += genTwoth();
      break;
    case "invocation":
      r += "(";
      let anchor = curr;
      r += genParameterList();
      r += ")";
      curr = anchor;
      r += genTwoth();
      break;
    case "assignment":
      r += " = ";
      curr = curr.wunth;
      r += genExpr();

  }
  return r;
}

function genTwoth() {
  let r = "";
  if (curr.twoth) {
    curr = curr.twoth;
    r += genExprTwoth();
  }
  return r;
}
function isExpr(obj) {
  return obj && ["subscript", "refinement", "invocation", "assignment", "function"].includes(obj.type);
}

function genDestructuring(arr){
  if(arr && arr.species && arr.species.startsWith("Destructuring")){
    switch(arr.species.slice(13)){
      case "[Array]":
        return `[${arr.map(genDeastructuring).join(", ")}]`;
      case "[Object]":
        let r = "{";
        r += arr.map(dstruct => {
          if(dstruct.type === "assignment"){
            return `${dstruct.zeroth} : ${dstruct.wunth}`
          }
          return dstruct;
        }).join(", ");
        r += "}";
        return r;
    }
  }
  return arr;
}
function genExpr() {
  let r = "";
  if (isExpr(curr)) {
    switch (curr.type) {
      case "subscript":
        r += `${zStringify(curr.zeroth)}[${zStringify(curr.wunth)}]`;
        r += genTwoth();
        break;
      case "refinement":
        r += `${zStringify(curr.zeroth)}["${curr.wunth}"]`;
        r += genTwoth();
        break;
      case "invocation":
        r += `${curr.zeroth}(`
        let anchor = curr;
        r += genParameterList();
        r += ")";
        curr = anchor;
        r += genTwoth();
        break;
      case "assignment":
        r += `${genDestructuring(curr.zeroth)} = `;
        curr = curr.wunth;
        r += genExpr();
        break;
      case "function":
        (function() {
          r += `function (`
          let anchor = curr;
          const list = curr.zeroth.map(param => {
            curr = param;
            return genExpr();
          }).join(", ");
          r += list;
          r += ")";
          curr = anchor.wunth;
          r += genBlock();
          curr = anchor;
        })();
        break;
    }
  } else {
    r += zStringify(curr);
  }
  return r;
}

const exprKeywords = Object.freeze(["func"]);

let generateStatement = Object.create(null);

generateStatement.let = () => {
  let r = `let `;
  let assignmentArray = []
  let anchor = curr;
  curr.zeroth.forEach(assignment => {
    curr = assignment;
    assignmentArray.push(genExpr());
  });
  r += assignmentArray.join(", ");
  curr = anchor;
  return r + ";";
}

generateStatement.def = () => {
  let r = `const `;
  let assignmentArray = [];
  let anchor = curr;
  curr.zeroth.forEach(assignment => {
    curr = assignment;
    assignmentArray.push(genExpr());
  });
  r += assignmentArray.join(", ");
  curr = anchor;
  return r + ";";
}

generateStatement.import = () => {
  return `const ${curr.zeroth} = stone(require(${curr.wunth}));`
}

generateStatement.export = () => {
  let r = `module.exports = stone(`;
  let anchor = curr;
  curr = curr.zeroth;
  r += genExpr();
  curr = anchor;
  r += ");";
  return r;
}

generateStatement.if = () => {
  let r = "if (assertBool(";
  let anchor = curr;
  curr = curr.zeroth;
  r += genExpr();
  r += "))";
  curr = anchor.wunth;
  r += genBlock();
  if (anchor.twoth !== undefined) {
    r += " else";
    curr = anchor.twoth;
    r += genBlock();
  }
  curr = anchor;
  return r;
}

generateStatement.loop = () => {
  let r = "while (true)";
  let anchor = curr;
  curr = curr.zeroth;
  r += genBlock();
  curr = anchor;
  return r;
}

generateStatement.break = () => {
  return "break;";
}

generateStatement.return = () => {
  let r = "return ";
  let anchor = curr;
  curr = curr.zeroth;
  r += genExpr();
  r += ";";
  curr = anchor;
  return r;
}

generateStatement.try = () => {
  let r = "try";
  let anchor = curr;
  curr = curr.zeroth;
  r += genBlock();
  r += ` catch (${anchor.wunth})`;
  curr = anchor.twoth;
  r += genBlock([
    `if (assertBool($eq(${anchor.wunth}["settled"], false))) {`,
    `  throw new Error("Error ${anchor.wunth} not settled.")`,
    "}"
  ]);
  curr = anchor;
  return r;
}

generateStatement.raise = () => {
  return `throw new Error(${curr.zeroth});`;
}

generateStatement.settle = () => {
  return `${curr.zeroth}["settled"] = true;`;
}
function genBlock(cleanup) {
  let r = " {\n";
  indent();
  let anchor = curr;
  curr.forEach(statement => {
    curr = statement;
    r += genStatement();
    r += "\n";
  });
  curr = anchor;
  if(cleanup !== undefined) {
    r += cleanup.map(x => x.padStart(x.length + padstart)).join("\n");
    r += "\n";
  }
  outdent();
  r += "}".padStart(1 + padstart);
  return r;
}
function genStatement(extraAdv) {
  let res;
  if(curr.type === undefined){
    return "";
  }
  if (isExpr(curr)) {
    res = genExpr() + ";";
  } else {
    res = generateStatement[curr.type]();
  }
  return res.padStart(padstart + res.length);
}
function genStatements(ast) {
  let r = "";
  while (index < ast.length) {
    curr = ast[index];
    if (curr !== undefined) {
      r += genStatement();
      r += "\n";
    }
    index += 1;
  }
  return r;
}
module.exports = Object.freeze(function gen(ast) {
  return res + genStatements(ast);
});