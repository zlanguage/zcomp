const runtime = require("@zlanguage/zstdlib");
const prims = Object.keys(runtime);
let res = `"use strict";

const $Z = require("@zlanguage/zstdlib")
const matcher = require("@zlanguage/zstdlib/src/js/matcher");

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
    if (thing.toString() === ":") {
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
  return obj && ["subscript", "refinement", "invocation", "assignment", "function", "spread", "match", "range", "dds", "loopexpr", "ifexpr"].includes(obj.type);
}

function genDestructuring(arr) {
  if (arr && arr.species && arr.species.startsWith("Destructuring")) {
    switch (arr.species.slice(13)) {
      case "[Array]":
        return `[${arr.map(genDestructuring).join(", ")}]`;
      case "[Object]":
        let r = "{";
        r += arr.map(dstruct => {
          if (dstruct.type === "assignment") {
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
function stringifyPat(pat) {
  if (typeof pat === "string" && pat.includes("$exclam")) {
    const parts = pat.split("$exclam").map(x => x);
    if (parts.length === 1) {
      return `matcher.type("${parts[0]}"")`;
    } else {
      return `matcher.type("${parts[0]}", "${parts[1]}")`;
    }
  }
  if (/^[a-z_]$/.test(pat[0])) {
    return `matcher.wildcard("${pat}")`;
  }
  if (pat.species === "Destructuring[Array]") {
    return `matcher.arr(${pat.map(stringifyPat).join(", ")})`;
  }
  if (pat.species === "Destructuring[Object]") {
    return `matcher.obj(${pat.map(patpart => {
      if (patpart.type !== "assignment") {
        throw new Error("Object pattern matching expression requires value.");
      }
      return `matcher.prop("${patpart.zeroth}", ${stringifyPat(patpart.wunth)})`;
    }).join(", ")})`
  }
  if (pat.type === "spread") {
    return `matcher.rest("${pat.wunth}")`;
  }
  if (pat.type === "range") {
    return `matcher.range(${pat.zeroth}, ${pat.wunth})`
  }
  return zStringify(pat);
}

function genLoopStatements(loopexpr) {
  const loops = [];
  const finalRes = function() {
    let anchor = curr;
    curr = loopexpr.wunth;
    let r = genExpr();
    curr = anchor;
    return r;
  }();
  loopexpr.zeroth.forEach(expr => {
    if (expr.type === "invocation" && expr.zeroth === "$lt$minus") {
      loops.push({
        type: "of",
        zeroth: expr.wunth[0],
        wunth: expr.wunth[1],
        twoth: [],
        predicates: []
      });
    } else if (expr.type === "assignment") {
      loops[loops.length - 1].twoth.push(expr);
    } else if (expr.type === "predicate") {
      loops[loops.length - 1].predicates.push(expr);
    }
  });
  let r = "";
  loops.forEach(loop => {
    const iteree = function() {
      let anchor = curr;
      curr = loop.zeroth;
      let res = genExpr();
      curr = anchor;
      return res;
    }();
    const iterable = function() {
      let anchor = curr;
      curr = loop.wunth;
      let res = genExpr();
      curr = anchor;
      return res;
    }();
    r += `for (const ${iteree} of ${iterable}) {\n`;
    indent();
    let anchor = curr;
    loop.twoth.forEach(assignment => {
      let anchor = curr;
      curr = {
        type: "def",
        zeroth: [assignment]
      };
      r += genStatement() + "\n";
      curr = anchor;
    });
    let conds = loop.predicates.map(predicate => {
      let anchor = curr;
      curr = predicate.zeroth;
      let r = genExpr();
      curr = anchor;
      return r;
    }).join(" && ");
    if (conds === "") {
      conds = "true";
    }
    let condstr = `if (${conds}) `
    r += condstr.padStart(condstr.length + padstart);
    curr = anchor;
  });

  let inner = `res.push(${finalRes})\n`;
  r += inner;
  loops.forEach(() => {
    outdent();
    r += "\n" + "}".padStart(padstart + 1);
  });
  return r;
}
function genMatcherArr(matches) {
  let r = "";
  r += matches.map(([pat, expr]) => {
    let res = "[";
    res += stringifyPat(pat);
    res += ", "
    let anchor = curr;
    curr = expr;
    indent();
    res += genExpr();
    outdent();
    curr = anchor;
    res += "]";
    return res.padStart(res.length + padstart + 2);
  }).join(",\n");;
  return r;
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
          if (curr[curr.length - 1] && (curr[curr.length - 1].type === "exit")) {
            let anchor = curr;
            r += `{ try { ${genBlock()} }`;
            curr = curr[curr.length - 1];
            let conds = function() {
              let r = "";
              let anchor = curr;
              r += curr.zeroth.map(condition => {
                curr = condition;
                return genExpr();
              }).join(" && ");
              curr = anchor;
              return `if (!(${r})) { throw new Error("Enter failed") }`;
            }()
            r += ` finally { ${conds} } }`;
            curr = anchor;
          } else {
            r += genBlock();
          }
          curr = anchor;
        })();
        break;
      case "spread":
        r += `...${zStringify(curr.wunth)}`;
        break;
      case "match":
        r += `matcher([\n`;
        r += genMatcherArr(curr.wunth);
        r += `])(${zStringify(curr.zeroth)})`;
        break;
      case "range":
        const from = curr.zeroth;
        const to = curr.wunth;
        r += `Array(${to - from + 1}).fill().map(function (_, index) { return index + ${from} })`;
        break;
      case "dds":
        if (typeof curr.wunth === "string") {
          r += `${curr.wunth}`;
        } else if ((curr.wunth.type !== undefined) && (curr.wunth.zeroth !== undefined) && (curr.wunth.wunth !== undefined)) {
          let anchor = curr;
          curr = curr.wunth;
          r += genStatement();
          curr = anchor;
        } else {
          r += zStringify(curr.wunth);
        }
        break;
      case "loopexpr":
        r += "function(){\n  const res = [];\n"
        r += genLoopStatements(curr).split("\n").map(str => str.padStart(padstart + 2 + str.length)).join("\n");
        r += "\n  return res;\n}()"
        break;
      case "ifexpr":
        {
          let anchor = curr;
          curr = anchor.zeroth;
          r += `(${genExpr()}) ? `;
          curr = anchor.wunth;
          r += genExpr();
          curr = anchor.twoth;
          r += ` : ${genExpr()}`;
          curr = anchor;
        }
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
    `if (assertBool($eq(${anchor.wunth}["settled"], undefined))) {`,
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
generateStatement.meta = () => {
  return `/* meta ${curr.zeroth} = ${"\"" + curr.wunth + "\""} */`;
}

generateStatement.enter = () => {
  let r = "";
  let anchor = curr;
  r += curr.zeroth.map(condition => {
    curr = condition;
    return genExpr();
  }).join(" && ");
  curr = anchor;
  return `if (!(${r})) { throw new Error("Enter failed") }`
}

generateStatement.exit = () => {
  return "";
}
generateStatement.operator = () => {
  return `/* operator ${curr.zeroth} = ${curr.wunth} */`;
}
generateStatement.hoist = () => {
  let r = `var `;
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
  if (cleanup !== undefined) {
    r += cleanup.map(x => x.padStart(x.length + padstart)).join("\n");
    r += "\n";
  }
  outdent();
  r += "}".padStart(1 + padstart);
  return r;
}
function genStatement(extraAdv) {
  let res;
  if (curr.type === undefined) {
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
  index = 0;
  padstart = 0;
  return res + genStatements(ast);
});