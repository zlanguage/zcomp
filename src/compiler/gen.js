// Find the built-in Z Runtime
const runtime = require("@zlanguage/zstdlib");
// Get all the primitives defined by it
const prims = Object.keys(runtime);
// Generate a "prelude"
let res = `"use strict";

const $Z = require("@zlanguage/zstdlib")
const matcher = require("@zlanguage/zstdlib/src/js/matcher");

${prims.map(name => `const ${name} = $Z.${name};`).join("\n")}

`;

let index = 0;
let curr;
let padstart = 0;

function indent() {
  padstart += 2;
}

function outdent() {
  padstart -= 2;
}

// Stringifies an expression
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
  } else if (thing && thing.species === "Object") {
    indent();
    const anchor = curr;
    const obj = thing
      .map(([k, v]) => {
        return `[${(() => {
          curr = k;
          return genExpr();
        })()}]: ${(() => {
          curr = v;
          return genExpr();
        })()}`; // [computed property]: val
      })
      .map(x => x.padStart(padstart + x.length))
      .join(",\n");
    curr = anchor;
    outdent();
    return "{\n" + obj + "\n" + "}".padStart(padstart + 1);
  } else if (Array.isArray(thing)) {
    // Empty object literal: [:]
    if (thing.toString() === ":") {
      return "{}";
    }
    const anchor = curr;
    const arr = thing
      .map(expr => {
        curr = expr;
        return genExpr();
      })
      .join(", ");
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
// For conditional refinements.
let condrList = [];
// Generates a chianed expression.
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
    case "condrefinement":
      // Record the chained conditional refinement.
      condrList.push(curr.zeroth);
      const upToNow = [
        condrList[0],
        ...condrList.slice(1).map(r => `["${r}"]`)
      ].join("");
      r += ` && ${upToNow}["${curr.wunth}"]`;
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
      break;
  }
  return r;
}

// This traverses as expression, add all the different parts together.
function genTwoth() {
  let r = "";
  if (curr.twoth) {
    curr = curr.twoth;
    if (curr.type !== "condrefinement") {
      // Restart the conditional refinement list after a conditional refinement chain ends.
      condrList = [];
    }
    r += genExprTwoth();
  }
  return r;
}
function isExpr(obj) {
  return (
    obj &&
    [
      "subscript",
      "refinement",
      "invocation",
      "assignment",
      "function",
      "spread",
      "match",
      "range",
      "dds",
      "loopexpr",
      "ifexpr",
      "goroutine",
      "get",
      "condrefinement",
      "condsubscript"
    ].includes(obj.type)
  );
}

// Generates array and object destrucutring.
function genDestructuring(arr) {
  if (arr && arr.species && arr.species.startsWith("Destructuring")) {
    // Handle destrucutring
    switch (arr.species.slice(13)) {
      case "[Array]":
        return `[${arr.map(genDestructuring).join(", ")}]`;
      case "[Object]":
        let r = "{";
        r += arr
          .map(dstruct => {
            if (dstruct.type === "assignment") {
              // Handle destructured aliases { key: name }
              return `${dstruct.zeroth} : ${dstruct.wunth}`;
            }
            return dstruct;
          })
          .join(", ");
        r += "}";
        return r;
    }
  } else if (isExpr(arr)) {
    // Other left-hand assignments are left alone.
    let anchor = curr;
    curr = arr;
    let res = genExpr();
    curr = anchor;
    return res;
  }
  return arr;
}
// Transforms a pattern into calls to Z's matcher library
function stringifyPat(pat) {
  if (typeof pat === "string" && pat.includes("$exclam")) {
    // Detect type
    const parts = pat.split("$exclam").map(x => x);
    if (parts.length === 1) {
      // Detect type wildcard
      return `matcher.type("${parts[0]}"")`;
    } else {
      return `matcher.type("${parts[0]}", "${parts[1]}")`;
    }
  }
  if (typeof pat === "string" && pat.endsWith("$question")) {
    return `matcher.predicate(${pat.replace(/\$question$/, "")})`;
  }
  if (pat.species === "Destructuring[Array]") {
    return `matcher.arr(${pat.map(stringifyPat).join(", ")})`;
  }
  if (/^[a-z_]$/.test(pat[0])) {
    return `matcher.wildcard("${pat}")`;
  }
  if (pat.species === "Destructuring[Object]") {
    return `matcher.obj(${pat
      .map(patpart => {
        if (patpart.type !== "assignment") {
          throw new Error("Object pattern matching expression requires value.");
        }
        return `matcher.prop("${patpart.zeroth}", ${stringifyPat(
          patpart.wunth
        )})`;
      })
      .join(", ")})`;
  }
  if (pat.type === "spread") {
    return `matcher.rest("${pat.wunth}")`;
  }
  if (pat.type === "range") {
    return `matcher.range(${pat.zeroth}, ${pat.wunth})`;
  }
  // Detect extractor
  if (pat.type === "invocation") {
    if (pat.zeroth === "to" || pat.zeroth === "til" || pat.zeroth === "by") {
      const range = zStringify(pat);
      return `matcher.range(${range}[0], ${range}[${range}.length - 1])`;
    }
    pat.wunth.species = "Destructuring[Array]";
    return `matcher.extractor(${zStringify(pat.zeroth)}, ${stringifyPat(
      pat.wunth
    )})`;
  }
  // Otherwise, use stringification to produce a value.
  return zStringify(pat);
}

// Handle loop expressions: loop (x <- xs) x * 2
function genLoopStatements(loopexpr) {
  const loops = [];
  // Figure out the final expression.
  const finalRes = (function() {
    let anchor = curr;
    curr = loopexpr.wunth;
    let r = genExpr();
    curr = anchor;
    return r;
  })();
  // Iterate over the expressions in the parens loop(_)
  loopexpr.zeroth.forEach(expr => {
    // Detect generator
    if (expr.type === "invocation" && expr.zeroth === "$lt$minus") {
      loops.push({
        type: "of",
        zeroth: expr.wunth[0],
        wunth: expr.wunth[1],
        twoth: [],
        predicates: []
      });
    } else if (expr.type === "assignment") {
      // Generators can have assignments attached to them.
      loops[loops.length - 1].twoth.push(expr);
    } else if (expr.type === "predicate") {
      // And predicates too.
      loops[loops.length - 1].predicates.push(expr);
    }
  });
  let r = "";
  loops.forEach(loop => {
    // Figure out the two parts of the generator.
    const iteree = (function() {
      let anchor = curr;
      curr = loop.zeroth;
      let res = genExpr();
      curr = anchor;
      return res;
    })();
    const iterable = (function() {
      let anchor = curr;
      curr = loop.wunth;
      let res = genExpr();
      curr = anchor;
      return res;
    })();
    r += `for (const ${iteree} of ${iterable}) {\n`;
    indent();
    let anchor = curr;
    // Add the assignments.
    loop.twoth.forEach(assignment => {
      let anchor = curr;
      curr = {
        type: "def",
        zeroth: [assignment]
      };
      r += genStatement() + "\n";
      curr = anchor;
    });
    // Add the predicates.
    let conds = loop.predicates
      .map(predicate => {
        let anchor = curr;
        curr = predicate.zeroth;
        let r = genExpr();
        curr = anchor;
        return r;
      })
      .join(" && ");
    if (conds === "") {
      conds = "true";
    }
    let condstr = `if (${conds}) `;
    r += condstr.padStart(condstr.length + padstart);
    curr = anchor;
  });
  // Add the final result.
  let inner = `res.push(${finalRes})\n`;
  r += inner;
  // Add all the closing brackets
  loops.forEach(() => {
    outdent();
    r += "\n" + "}".padStart(padstart + 1);
  });
  return r;
}
// Produces a array of match expressions to pass to matcher
function genMatcherArr(matches) {
  let r = "";
  r += matches
    .map(([pat, expr]) => {
      let res = "[";
      res += stringifyPat(pat);
      res += ", ";
      let anchor = curr;
      curr = expr;
      indent();
      res += genExpr();
      outdent();
      curr = anchor;
      res += "]";
      return res.padStart(res.length + padstart + 2);
    })
    .join(",\n");
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
      case "condrefinement":
        r += `${zStringify(curr.zeroth)} && ${zStringify(curr.zeroth)}["${
          curr.wunth
        }"]`;
        // Remember refinement in the chain.
        condrList.push(curr.zeroth);
        r += genTwoth();
        break;
      case "invocation":
        r += `${curr.zeroth}(`;
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
      // Goroutines translate to async functions.
      case "goroutine":
        r += "async ";
      case "function":
        (function() {
          r += `function (`;
          let anchor = curr;
          const list = curr.zeroth
            .map(param => {
              curr = param;
              return genExpr();
            })
            .join(", ");
          r += list;
          r += ")";
          curr = anchor.wunth;
          // Account for exit statements.
          if (curr[curr.length - 1] && curr[curr.length - 1].type === "exit") {
            let anchor = curr;
            r += `{ try { ${genBlock()} }`;
            curr = curr[curr.length - 1];
            let conds = (function() {
              let r = "";
              let anchor = curr;
              r += curr.zeroth
                .map(condition => {
                  curr = condition;
                  return genExpr();
                })
                .join(" && ");
              curr = anchor;
              return `if (!(${r})) { throw new Error("Exit failed") }`;
            })();
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
      // Range literals translate directly to arrays.
      case "range":
        const from = curr.zeroth;
        const to = curr.wunth;
        r += `Array($plus($minus(${zStringify(to)}, ${zStringify(
          from
        )}), 1)).fill().map(function (_, index) { return $plus(index, ${zStringify(
          from
        )}) })`;
        break;
      // Handle dollar directive
      case "dds":
        if (typeof curr.wunth === "string") {
          // If the dollar directive is a string, leave it's contents untouched.
          r += `${curr.wunth}`;
        } else if (
          curr.wunth.type !== undefined &&
          curr.wunth.zeroth !== undefined &&
          curr.wunth.wunth !== undefined
        ) {
          // If it's an ast, generate it's contents.
          let anchor = curr;
          curr = curr.wunth;
          r += genStatement();
          curr = anchor;
        } else {
          // Otherwise, stringify it's contents
          r += zStringify(curr.wunth);
        }
        break;
      // List expressions become IIFEs
      case "loopexpr":
        r += "function(){\n  const res = [];\n";
        r += genLoopStatements(curr)
          .split("\n")
          .map(str => str.padStart(padstart + 2 + str.length))
          .join("\n");
        r += "\n  return res;\n}()";
        break;
      // If expressions become ternary operators.
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
      // get(arg) translates to "await (arg)._from"
      case "get":
        r += "await ";
        {
          let anchor = curr;
          curr = curr.zeroth;
          r += genExpr();
          curr = anchor;
        }
        r += "._from()";
    }
  } else {
    // Some standalone things, ie. objects and numbers do not need special handling
    r += zStringify(curr);
  }
  return r;
}

let generateStatement = Object.create(null);

generateStatement.let = () => {
  let r = `let `;
  let assignmentArray = [];
  let anchor = curr;
  curr.zeroth.forEach(assignment => {
    curr = assignment;
    assignmentArray.push(genExpr());
  });
  r += assignmentArray.join(", ");
  curr = anchor;
  return r + ";";
};

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
};

generateStatement.import = () => {
  return `const ${genDestructuring(curr.zeroth)} = stone(require(${
    curr.wunth
  }));`; // All imports are immutable
};

generateStatement.export = () => {
  let r = `module.exports = stone(`; // All expors are also immutable.
  let anchor = curr;
  curr = curr.zeroth;
  r += genExpr();
  curr = anchor;
  r += ");";
  return r;
};

generateStatement.if = () => {
  let r = "if (assertBool("; // An if condition must be a boolean
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
};

generateStatement.loop = () => {
  let r = "while (true)";
  let anchor = curr;
  curr = curr.zeroth;
  r += genBlock();
  curr = anchor;
  return r;
};

generateStatement.break = () => {
  return "break;";
};

generateStatement.return = () => {
  let r = "return ";
  let anchor = curr;
  curr = curr.zeroth;
  r += genExpr();
  r += ";";
  curr = anchor;
  return r;
};

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
    "}" // Check to make sure that the error object caught has been settled via the settle statement.
  ]);
  curr = anchor;
  return r;
};

generateStatement.raise = () => {
  return `throw new Error(${curr.zeroth});`;
};

generateStatement.settle = () => {
  return `${curr.zeroth}["settled"] = true;`;
};
generateStatement.meta = () => {
  return `/* meta ${curr.zeroth} = ${'"' + curr.wunth + '"'} */`; // Meta statements become comments just so you know that they are there.
};

generateStatement.enter = () => {
  let r = "";
  let anchor = curr;
  r += curr.zeroth
    .map(condition => {
      curr = condition;
      return genExpr();
    })
    .join(" && "); // Gather conditions
  curr = anchor;
  return `if (!(${r})) { throw new Error("Enter failed") }`;
};

generateStatement.exit = () => {
  return "";
};
generateStatement.operator = () => {
  return `/* operator ${curr.zeroth} = ${curr.wunth} */`; // Like meta, operator translates into a comment so you know it's there.
};

// Generates the immutable properties for an enum declaration
function generateGetters(fields) {
  return fields
    .map(field => `get ${field}(){ return ${field}; }`)
    .join(",\n\t\t");
}
// Generates the equals method for an enum declaration
function generateEquals(type, fields) {
  return `"="(other) {
      return other.constructor === ${type}${
    fields.length > 0 ? " && " : ""
  }${fields.map(field => `$eq(${field}, other.${field})`).join(" && ")};
    }`;
}
// Generates the static methods of an enum from a `where` block.
function generateStatics(type, static = {}) {
  let res = "";
  Object.entries(static).forEach(([key, func]) => {
    let anchor = curr;
    curr = func;
    const f = genExpr();
    curr = anchor;
    res += `
${type}.${key} = ${f};
`;
  });
  return res;
}
// Generates the overarching parent type for an enum.
function generateParent(type, parts, static = {}) {
  let res = `let ${type} = {
  order: ${zStringify(parts)},
  ${parts.join(",\n\t")}
};`;
  res += generateStatics(type, static);
  return res;
}
// Generates type checks for an enum's fields.
function generateTypeChecks(typeChecks, parent, child) {
  let r = "";
  typeChecks
    .filter(([field, type]) => type !== "_$exclam")
    .forEach(([field, type]) => {
      type = type.replace(/\$exclam$/, "");
      r += `
  if (typeOf(${field}) !== "${type}") { 
    throw new Error("${parent}.${child}.${field} must be of type ${type}. However, you passed " + ${field} + " to ${parent}.${child} which is not of type ${type}.");
  }
`;
    });
  return r;
}
// Will wrap and expression with functions.
function wrapFuncs(funcs, str) {
  if (!Array.isArray(funcs) || funcs.length === 0) {
    return str;
  }
  const open =
    funcs
      .map(func => {
        let anchor = curr;
        curr = func;
        let res = genExpr();
        curr = anchor;
        return res;
      })
      .join("(") + "(";
  const close = ")".repeat(funcs.length);
  return open + str + close;
}
generateStatement.enum = () => {
  let r = "";
  const parentType = curr.zeroth;
  const types = [];
  curr.wunth.forEach(type => {
    let fields = [];
    const typeChecks = [];
    // Record type checks. ex: enum Point(x: number!, y: number!)
    if (type.type === "invocation") {
      fields = type.wunth;
      if (
        Array.isArray(fields[0]) &&
        fields[0].some(field => Array.isArray(field))
      ) {
        fields = fields[0].map(field => {
          if (Array.isArray(field)) {
            field[0] = field[0].replace(/"/g, "");
            typeChecks.push(field);
            return field[0];
          }
          return field;
        });
      }
      type = type.zeroth;
    }
    types.push(type);
    // Generate the enum constructor function.
    r += `function ${type}(${fields.join(", ")}) {
  ${
    fields[0] // Support keyword arguments to enums.
      ? `
  if($eq(Object.keys((${fields[0]} == null) ? { [Symbol()]: 0 } : ${
          fields[0]
        }).sort(), ${zStringify(fields.map(field => `"${field}"`))}.sort())) {
    ({ ${fields.join(", ")} } = ${fields[0]});
  }
`
      : ""
  }
  ${generateTypeChecks(typeChecks, parentType, type)}
  return ${wrapFuncs(
    curr.derives,
    `{
    type() { return "${parentType}"; },
    get constructor() { return ${type}; },
    get parent() { return ${parentType}; },
    get fields() { return ${zStringify(fields.map(field => `"${field}"`))}; },
    ${generateGetters(fields)}${fields.length > 0 ? "," : ""}
    ${generateEquals(type, fields)}
  }`
  ) + ";\n}\n"}\n`;
    r += `${type}.extract = function (val) {
  if (val.constructor === ${type}) {
    return [${fields.map(field => `val.${field}`).join(", ")}];
  }
  return undefined;
};

`;
  });
  // Support for singleton enums.
  if (curr.wunth[0] === parentType || curr.wunth[0].zeroth === parentType) {
    r += `${parentType}.order = ${zStringify(types)};\n`;
    r += generateStatics(parentType, curr.twoth);
    if (curr.staticDerives && curr.staticDerives.length > 0) {
      r += `\n${parentType} = ${wrapFuncs(curr.staticDerives, parentType)}`;
    }
  } else {
    // Normal enums
    r += generateParent(parentType, types, curr.twoth);
    if (curr.staticDerives && curr.staticDerives.length > 0) {
      r += `\n${parentType} = ${wrapFuncs(curr.staticDerives, parentType)}`;
    }
  }
  return r;
};
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
};
function genBlock(cleanup) {
  // cleanup is extra stuff that goes at the end of the block
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
    r += cleanup.map(x => x.padStart(x.length + padstart)).join("\n"); // Indent the cleanup.
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
  condrList = [];
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
module.exports = Object.freeze(function gen(ast, prelude = true) {
  index = 0;
  padstart = 0;
  return prelude ? res + genStatements(ast) : genStatements(ast); // For debugging purposes, the prelude may sometimes be removed.
});
