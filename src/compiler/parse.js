"use strict";
const path = require("path");
let theError;
let prevTok;
let tok;
let nextTok;
let tokList;
let index = 0;
let metadata = {
    ddsdir: ""
};
const isValidName = /^[A-Za-z_$][A-za-z_$0-9]*$/;
const blockStatements = Object.freeze(["if", "else", "loop"]);

function error(message) {
    return {
        id: "(error)",
        zeroth: `Error: "${message}"${(prevTok || tok) ? ` at ${tok ? tok.lineNumber : prevTok.lineNumber}:${tok ? tok.columnNumber : prevTok.columnNumber}:${tok ? tok.columnTo : prevTok.columnTo}` : ""}.`
  };
}

function advance(id) {
  if (tok && id !== undefined && id !== tok.id) {
    throw error(`Expected "${id}" but got "${tok.id}".`).zeroth;
  }
  index += 1;
  prevTok = tok;
  tok = nextTok;
  nextTok = tokList[index + 1];

}
function skip(id) {
  advance(id);
  advance();
  advance();
}

function isLineBreak() {
  return tok.lineNumber !== prevToken.lineNumber;
}

function sameLine() {
  if (isLineBreak()) {
    return error(`Unexpected line break.`);
  }
}

function typeIn(thing, type) {
  if (thing === undefined) {
    return false;
  }
  return thing.type === type || typeIn(thing.zeroth, type) || typeIn(thing.wunth, type) || typeIn(thing.twoth, type);
}

function arrayToObj(arr) {
  if (!Array.isArray(arr)) {
    return arr;
  }
  if (!arr.some(field => field && field.type === "assignment")) {
    return arr;
  }
  const obj = arr.map(field => {
    if (typeof field === "string" || typeof field === "number") {
      return {
        type: "assignment",
        zeroth: `"` + field + `"`,
        wunth: field
      }
    }
    return field;
  }).map(({
    zeroth,
    wunth
  }) => [zeroth, wunth]).map(([zeroth, wunth]) => [arrayToObj(zeroth), arrayToObj(wunth)]);
  obj.species = "Object";
  return obj;
}


function isExprAhead() {
  return nextTok !== undefined && ["(", "[", ".", ":"].includes(nextTok.id);
}
function isImplicit(str) {
  return typeof str === "string" && str.endsWith("$exclam")
}
function isExpr(obj) {
  return obj && ["subscript", "refinement", "invocation", "assignment", "function"].includes(obj.type);
}
function findImplicits(ast) {
  if ((typeof ast !== "object" && typeof ast !== "string") || ast === null || ast.type === "match") {
    return [];
  }
  const implicits = [];
  if (isImplicit(ast)) {
    implicits.push(ast);
  }
  if (isImplicit(ast.zeroth)) {
    implicits.push(ast.zeroth);
  }
  if (isImplicit(ast.wunth)) {
    implicits.push(ast.wunth);
  }
  if (isImplicit(ast.twoth)) {
    implicits.push(ast.twoth);
  }
  if (Array.isArray(ast)) {
    ast.forEach(part => {
      implicits.push(...findImplicits(part));
    })
  }
  switch (ast.type) {
    case "invocation":
      ast.wunth.forEach(param => {
        if (isImplicit(param)) {
          implicits.push(param);
        } else if (isExpr(param)) {
          implicits.push(...findImplicits(param))
        }
      });
      break;
  }
  if (isExpr(ast.zeroth) || Array.isArray(ast.zeroth)) {
    implicits.push(...findImplicits(ast.zeroth));
  }
  if (isExpr(ast.wunth) || Array.isArray(ast.wunth)) {
    implicits.push(...findImplicits(ast.wunth));
  }
  if (isExpr(ast.twoth) || Array.isArray(ast.twoth)) {
    implicits.push(...findImplicits(ast.twoth));
  }
  return Array.from(new Set(implicits));
}

function findWildcards(pat) {
  const wildcards = [];
  switch (typeof pat) {
    case "string":
      if (pat.includes("$exclam")) {
        const [_, wildcard] = pat.split("$exclam");
        if (wildcard) {
          wildcards.push(wildcard);
        }
      } else if (/^[a-z_]$/.test(pat[0])) {
        wildcards.push(pat)
      }
    case "object":
      if (pat.type === "spread") {
        wildcards.push(pat.wunth);
      } else if (pat.species === "Destructuring[Array]") {
        pat.forEach(patpart => {
          wildcards.push(...findWildcards(patpart));
        })
      } else if (pat.species === "Destructuring[Object]") {
        const pats = arrayToObj([...pat]).map(([k, v]) => v);
        pats.forEach(patpart => {
          wildcards.push(...findWildcards(patpart))
        })
      }
  }
  return Array.from(new Set(wildcards));
}

function convertReturns(returnType, statement, index) {
  if (statement.type === "return") {
    return {
      type: "return",
      zeroth: {
        type: "invocation",
        zeroth: "assertType",
        wunth: [returnType, statement.zeroth]
      }
    }
  }
  return wrapReturn(returnType, statement);
}
function wrapReturn(returnType, block) {
  if (!block) { return block }
  if(!returnType.startsWith(`"`)) { 
    returnType = `"${returnType}"`
  }
  if (Array.isArray(block)) {
    block = block.map((statement, index) => convertReturns(returnType, statement, index));
  }
  if (block.zeroth) {
    if (Array.isArray(block.zeroth)) {
      block.zeroth = block.zeroth.map((statement, index) => convertReturns(returnType, statement, index));
    } else {
      block.zeroth = wrapReturn(returnType, block.zeroth);
    }
  }
  if (block.wunth) {
    if (Array.isArray(block.wunth)) {
      block.wunth = block.wunth.map((statement, index) => convertReturns(returnType, statement, index));
    } else {
      block.wunth = wrapReturn(returnType, block.wunth);
    }
  }
  if (block.twoth) {
    if (Array.isArray(block.twoth)) {
      block.twoth = block.twoth.map((statement, index) => convertReturns(returnType, statement, index));
    } else {
      block.twoth = wrapReturn(returnType, block.twoth);
    }
  }
  return block;
}
function configureExpr(type, zeroth, wunth, twoth) {
  if (twoth !== undefined) {
    return {
      type,
      zeroth,
      wunth,
      twoth
    }
  }
  if (wunth !== undefined && type !== undefined) {
    return {
      type,
      zeroth,
      wunth
    }
  }
  // Return raw value if isn't a complete token
  return zeroth;
}
function expr() {
  let zeroth, wunth, twoth, type;
  // Is the token a literal? If so, prepare to return it's value.
  if (tok !== undefined) {
    switch (tok.id) {
      case "(string)":
        // Strings are encased in quotes
        zeroth = `"${tok.string}"`;
        break;
      case "(number)":
        // Numbers are translated to raw numbers
        zeroth = tok.number;
        if (nextTok && nextTok.id === "...") {
          type = "range";
          advance("(number)");
          advance("...");
          wunth = tok.number;
        }
        break;
      case "(":
        // Parse destructuring
        // Parens are never part of tuple literals - Z dosen't have them
        zeroth = [];
        advance();
        // Empty destructuring? It's possible.
        if (tok.id !== ")") {
          let i = 0;
          while (i < 100) {
            zeroth.push(expr());
            advance();
            if (tok && tok.id === ")") {
              break;
            }
            advance(",");
            i += 1;
          }
          if (i === 100) {
            return error("Unclosed array destructuring.");
          }
        }
        zeroth.species = "Destructuring[Array]";
        if (nextTok.id === "{") {
          zeroth.push({
            type: "function",
            zeroth: [],
            wunth: block()
          });
        }
        break;
      case "{":
        // Object destructuring
        zeroth = [];
        advance();
        // Empty destructuring? It's possible.
        if (tok.id !== "}") {
          let i = 0;
          while (i < 100) {
            zeroth.push(expr());
            advance();
            if (tok && tok.id === "}") {
              break;
            }
            advance(",");
            i += 1;
          }
          if (i === 100) {
            return error("Unclosed object destructuring.")
          }
        }
        zeroth.species = "Destructuring[Object]";
        break;
      case "[":
        // Parse Array
        zeroth = [];
        advance();
        // Detect empty array
        if (tok && tok.id !== "]") {
          //Add an expression object for each element of the array.
          let i = 0;
          while (i < 1000) {
            zeroth.push(expr());
            advance();
            if (tok && tok.id === "]") {
              break;
            }
            advance(",");
            i += 1;
          }
          if (i === 1000) {
            return error("Unclosed array literal or array literal maximum of one thousand elements exceeded.");
          }
        }
        zeroth = arrayToObj(zeroth); // Support parsing of object literals.
        break;
      case "$":
        // Parse dollar directive
        advance("$");
        type = "dds";
        if (tok.alphanumeric) {
          zeroth = tok.id;
        } else {
          zeroth = tok.string;
        }
        const transformer = require(metadata.ddsdir + zeroth);
        advance();
        wunth = transformer(expr(), { ...metadata });
        break;
      case "(keyword)":
        switch (tok.string) {
          case "func":
            type = "function";
            const typeChecks = [];
            zeroth = []; // Zeroth will serve as the parameter list
            // Figure out functions parameter list.
            // Look for implicit parameters
            if (nextTok && nextTok.id === "(") {
              advance();
              advance();
              // Detect empty parameter list
              if (tok && tok.id !== ")") {
                // Figure out the parameter list
                let i = 0;
                while (i < 100) {
                  if (tok && tok.id === "(keyword)") {
                    throw error("Unexpected keyword in parameter list.").zeroth;
                  }
                  const nextParam = expr(); // Any valid expression can be used in parameter position
                  zeroth.push(nextParam);
                  if (nextTok && nextTok.id === ")") {
                    // The parameter list has finished
                    advance(); // Prepare for block
                    break;
                  }
                  if (nextTok && nextTok.id === ",") {
                    //Let's skip to the next parameter
                    advance();
                    advance();
                  }
                  // Check for runtime type checks
                  if (nextTok && nextTok.alphanumeric) {
                    if (isValidName.test(nextParam)) {
                      typeChecks.push([nextParam, nextTok.id]);
                    }
                    advance();
                    if (nextTok && nextTok.id === ")") {
                      // The parameter list has finished
                      advance(); // Prepare for block
                      break;
                    }
                    if (nextTok && nextTok.id === ",") {
                      //Let's skip to the next parameter
                      advance();
                      advance();
                    }
                  }
                  i += 1;
                }
                if (i === 100) {
                  return error("Unclosed function parameter list.");
                }
              }
              if (nextTok && nextTok.id === "{") {
                wunth = [...typeChecks.map(([param, type]) => ({
                  type: "enter",
                  zeroth: [{
                    type: "invocation",
                    zeroth: "$eq",
                    wunth: [
                      {
                        type: "invocation",
                        zeroth: "typeOf",
                        wunth: [param]
                      },
                      `"${type.replace(/\$exclam$/, "")}"`
                    ]
                  }]
                })), ...block()];
              } else if (tok && tok.id === ")" && nextTok && nextTok.alphanumeric && nextTok.id.endsWith("$exclam")) {
                advance(")");
                const returnType = tok.id.replace(/\$exclam$/, "");
                wunth = [...typeChecks.map(([param, type]) => ({
                  type: "enter",
                  zeroth: [{
                    type: "invocation",
                    zeroth: "$eq",
                    wunth: [
                      {
                        type: "invocation",
                        zeroth: "typeOf",
                        wunth: [param]
                      },
                      `"${type.replace(/\$exclam$/, "")}"`
                    ]
                  }]
                })), ...wrapReturn(returnType, block())];
              } else {
                advance(")");
                wunth = [{
                  type: "return",
                  zeroth: expr()
                }];
              }
            } else {
              advance("(keyword)");
              const implicitExpr = expr();
              zeroth = findImplicits(implicitExpr);
              wunth = [{
                type: "return",
                zeroth: implicitExpr
              }];
            }
            break;
          // Parse match
          case "match":
            type = "match";
            advance("(keyword)");
            zeroth = expr();
            advance();
            advance("{");
            wunth = [];
            let i = 0;
            while (tok && tok.id !== "}" && i < 100) {
              const pat = expr();
              const wildcards = findWildcards(pat);
              advance();
              advance("$eq$gt");
              const res = {
                type: "function",
                zeroth: wildcards,
                wunth: [{
                  type: "return",
                  zeroth: expr()
                }]
              };
              advance();
              if (tok && tok.id !== "}") {
                advance(",")
              }
              wunth.push([pat, res]);
              i += 1;
            }
            if (i === 100) {
              return error("Unclosed match expression.");
            }
        }
        break;
      case "...":
        // Parse spread / splat
        type = "spread";
        advance();
        zeroth = "...";
        wunth = expr();
        break;
      case "(error)":
        // Return invalid tokens
        return error(`Unexpected token(s) ${tok.string}`)
      default:
        // As for alphanumerics, they just translated to their string values.
        if (tok.alphanumeric || (prevTok.id === "[" && tok.id === ":") || tok.id === ")" || tok.id === "]") {
          zeroth = tok.id;
        } else {
          // Other non-alphanumeric tokens become errors
          return error(`Unexpected token ${tok.id}`);
        }
        break;
    }
  }
  // Are there more tokens left? (And is it not a spread/splat)
  if (nextTok !== undefined && type !== "spread") {
    // If so, there might be more to the expression
    switch (nextTok.id) {
      case ".":
        // Parse a refinement
        advance();
        advance();
        type = "refinement";
        if (!tok) {
          return error(`Infix operation refinement requires right-hand side for property access. Only left-hand provided.`)
        }
        if (!tok.alphanumeric) {
          return error(`Refinement expects valid identifier but instead got ${tok.id}.`)
        }
        wunth = tok.id; // And the property being accessed
        //Update twoth with next part of expression.
        if (isExprAhead()) {
          twoth = expr();
        }
        break;
      case "(":
        // It's an invocation
        advance();
        advance();
        type = "invocation";
        wunth = []; // Wunth will serve as the parameter list
        //Is there no parameter list?
        if (tok && tok.id === ")") {
          // Is there a refinement after the end of the method call? A subscript? ANOTHER method call?
          if (isExprAhead()) {
            // If so, record it in twoth
            twoth = expr();
          }
          break;
        }
        let i = 0;
        // Figure out the parameter list
        while (i < 100) {
          const nextParam = expr(); // Any valid expression can be used in parameter position
          wunth.push(nextParam);
          if (nextTok && nextTok.id === ")") {
            // The invocation has finished
            advance(); // Put ")" in the token position to allow mixing of refinements and methods.
            break;
          }
          advance();
          advance(",");
          i += 1;
        }
        if (i === 100) {
          return error("Unclosed invocation.")
        }
        // Is there a refinement after the end of the method call? A subscript? ANOTHER method call?
        if (isExprAhead()) {
          // If so, record it in twoth
          twoth = expr();
        }
        break;
      case "[":
        // Parse subscript
        advance();
        advance();
        type = "subscript";
        wunth = expr(); // Unlike refinements, subscripts allow ANY expression for property access
        advance();
        // Continue to the next part of the expression
        if (isExprAhead()) {
          twoth = expr();
        }
        break;
      case ":":
        // Parse assignment
        advance();
        advance();
        type = "assignment";
        wunth = expr(); // Parse right-hand side
        break;
    }
  }
  if (nextTok && nextTok.alphanumeric && (nextTok.lineNumber === tok.lineNumber) && !nextTok.id.endsWith("$exclam") && nextTok.id !== "$eq$gt") {
    advance();
    advance();
    const res = {
      type: "invocation",
      zeroth: prevTok.id,
      wunth: [configureExpr(type, zeroth, wunth, twoth), expr()]
    }
    return res;
  }
  if (nextTok && nextTok.alphanumeric && nextTok.id.endsWith("$exclam") && tokList[index + 2] && tokList[index + 2].id !== "," && tokList[index + 2].id !== ")") {
    type = "assignment";
    const typeToAssert = nextTok.id.replace(/\$exclam$/, "");
    advance();
    advance();
    advance(":");
    wunth = {
      type: "invocation",
      zeroth: "assertType",
      wunth: [typeToAssert, expr()]
    }
  }
  if (twoth !== undefined) {
    return {
      type,
      zeroth,
      wunth,
      twoth
    }
  }
  if (wunth !== undefined && type !== undefined) {
    return {
      type,
      zeroth,
      wunth
    }
  }
  // Return raw value if isn't a complete token
  return zeroth;
}
let parseStatement = Object.create(null);
parseStatement.let = () => {
  let letStatement = {
    type: "let",
    zeroth: []
  }
  advance("(keyword)");
  let assignment;
  assignment = expr();
  if (assignment.type !== "assignment") {
    return error(`Let statement expects assignment.`);
  }
  letStatement.zeroth.push(assignment);
  while (nextTok && nextTok.id === ",") {
    advance();
    advance(",");
    assignment = expr();
    if (assignment.type !== "assignment") {
      return error(`Let statement expects assignment.`);
    }
    letStatement.zeroth.push(assignment);
  }
  return letStatement;
}
parseStatement.def = () => {
  const res = parseStatement.let();
  res.type = "def";
  return res;
}
parseStatement.import = () => {
  const importStatement = {
    type: "import"
  }
  advance("(keyword)");
  let imported = expr();
  if (isValidName.test(imported)) {
    importStatement.zeroth = imported;
    importStatement.wunth = `"${imported}"`
  } else if (typeIn(imported, "refinement")) {
    let path = `"${imported.zeroth}/${imported.wunth}`;
    let modName = "";
    if (imported.twoth) {
      imported = imported.twoth;
      while (true) {
        path += `/${imported.wunth}`;
        if (imported.twoth === undefined) {
          modName = imported.wunth;
          path += `"`;
          break;
        }
        imported = imported.twoth;
      }
    } else {
      modName = imported.wunth;
      path += `"`;
    }
    importStatement.zeroth = modName;
    importStatement.wunth = path;
  } else {
    if (imported.type !== "assignment") {
      return error("Invalid import statement.");
    } else if (!imported.wunth.startsWith("\"")) {
      return error("Import statement expects string.");
    }
    importStatement.zeroth = imported.zeroth;
    importStatement.wunth = imported.wunth;
  }
  return importStatement;
}
parseStatement.export = () => {
  const exportStatement = {
    type: "export"
  }
  advance("(keyword)");
  const exported = expr();
  if (exported.type === "assignment") {
    return error("Cannot export an assignment.");
  }
  exportStatement.zeroth = exported;
  return exportStatement;
}

parseStatement.if = (extraAdv) => {
  const ifStatement = {
    type: "if"
  }
  advance("(keyword)");
  ifStatement.zeroth = expr();
  ifStatement.wunth = block(extraAdv);
  if (nextTok && nextTok.id === "(keyword)" && nextTok.string === "else") {
    advance("}");
    // Parse else-if
    if (nextTok && nextTok.id === "(keyword)" && nextTok.string === "if") {
      advance("(keyword)");
      ifStatement.twoth = [statement()];
    } else {
      ifStatement.twoth = block(extraAdv);
    }
  }
  return ifStatement;
}

parseStatement.loop = () => {
  const loopStatement = {
    type: "loop"
  }
  loopStatement.zeroth = block();
  return loopStatement;
}

parseStatement.return = () => {
  const returnStatement = {
    type: "return"
  }
  advance("(keyword)");
  returnStatement.zeroth = expr();
  return returnStatement;
}

parseStatement["}"] = () => {
  advance();
}
parseStatement.break = () => {
  return {
    type: "break"
  }
}

parseStatement.try = () => {
  const tryStatement = {
    type: "try"
  }
  //advance("(keyword)");
  tryStatement.zeroth = block();
  if (nextTok && nextTok.id === "(keyword)" && nextTok.string === "on") {
    advance();
    advance("(keyword)");
    tryStatement.wunth = expr();
    tryStatement.twoth = block();
  }
  return tryStatement;
}

parseStatement.settle = () => {
  const settleStatement = {
    type: "settle"
  }
  advance("(keyword)");
  settleStatement.zeroth = expr();
  return settleStatement;
}

parseStatement.raise = () => {
  const raiseStatement = {
    type: "raise"
  }
  advance("(keyword)");
  raiseStatement.zeroth = expr();
  return raiseStatement;
}

parseStatement.importstd = () => {
  advance("(keyword)");
  return {
    type: "import",
    zeroth: tok.id,
    wunth: `"@zlanguage/zstdlib/src/js/${tok.id}"`
  }
}
parseStatement.meta = () => {
  advance("(keyword)");
  const name = tok.id;
  advance();
  advance(":");
  if (tok.id !== "(string)") {
    return error("Meta requires string and value.")
  }
  const value = tok.string;
  metadata[name] = value;
  return {
    type: "meta",
    zeroth: name,
    wunth: value
  }
}

parseStatement.enter = () => {
  return {
    type: "enter",
    zeroth: block()
  }
}

parseStatement.exit = () => {
  return {
    type: "exit",
    zeroth: block()
  }
}
function parseDollarDirective() {
  let dollarDir = {
    type: "dds"
  }
  advance("$");
  if (tok.alphanumeric) {
    dollarDir.zeroth = tok.id;
  } else {
    dollarDir.zeroth = tok.string;
  }
  advance();
  const transformer = require(metadata.ddsdir + dollarDir.zeroth);
  dollarDir.wunth = transformer(statement(), { ...metadata });
  return dollarDir;
}
const exprKeywords = Object.freeze(["func", "match"]);
function statement() {
  if (tok && tok.id === "(keyword)" && !exprKeywords.includes(tok.string)) {
    const parser = parseStatement[tok.string];
    if (typeof parser !== "function") {
      return error("Invalid use of keyword.")
    }
    return parser();
  } else if (tok && tok.id === "$") {
    return parseDollarDirective();
  } else {
    let res = expr();
    if (res !== undefined && res.id === "(error)") {
      return res;
    }
    if (typeIn(res, "assignment") || typeIn(res, "invocation") || typeIn(res, "match") || res && res.species === "Destructuring[Array]") {
      return res;
    } else {
      if (res !== undefined) {
        return error("Invalid expression, expression must be an assignment or invocation if it does not involve a keyword.");
      }
    }
  }
}
function block() {
  let statements = [];
  advance();
  advance();
  let i = 0;
  while (tok && tok.id !== "}" && i < 1e6) {
    statements.push(statement());
    advance();
    i += 1;
  }
  if (i === 1e6) {
    return error("Unclosed block.")
  }
  return statements;
}

function statements() {
  const statements = [];
  let nextStatement;
  while (true) {
    nextStatement = statement();
    if (nextStatement === undefined && nextTok === undefined) {
      break;
    }
    if (nextStatement === undefined) {
      break;
    }
    if (nextStatement.type === undefined && nextTok === undefined && nextStatement.id !== "(error)") {
      break;
    }
    statements.push(nextStatement);
    if (nextStatement.id === "(error)") {
      break;
    }
    advance();
  }
  return statements;
}

function arrayWrap(arr) {
  if (!Array.isArray(arr)) {
    return [arr];
  }
  return arr;
}

function findAndThrow(ast) {
  let errorFound = false;
  arrayWrap(ast).every(part => {
    if (part && part.id === "(error)") {
      throw part.zeroth;
      errorFound = true;
      return false;
    } else if (part && part.type) {
      if (part && part.zeroth) {
        errorFound = findAndThrow(part.zeroth);
      }
      if (part && part.wunth) {
        errorFound = findAndThrow(part.wunth);
      }
      if (part && part.twoth) {
        errorFound = findAndThrow(part.twoth);
      }
    }
    return true;
  });
  return errorFound;
}
module.exports = Object.freeze(function parse(tokGen) {
  tokList = function() {
    let res = [];
    for (let i; (i = tokGen()) !== undefined;) {
      res.push(i);
    }
    return res;
  }();
  index = 0;
  metadata = {};
  [tok, nextTok] = [tokList[0], tokList[1]];
  const statementz = statements();
  if (!findAndThrow(statementz)) {
    return statementz;
  }
  return [];
})