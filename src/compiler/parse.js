"use strict";
let theError;
let prevTok;
let tok;
let nextTok;
let tokList;
let index = 0;
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
        break;
      case "(":
        // Parse destructuring
        // Parens are never part of tuple literals - Z dosen't have them
        zeroth = [];
        advance();
        // Empty destructuring? It's possible.
        if (tok.id !== ")") {
          while (true) {
            zeroth.push(expr());
            advance();
            if (tok && tok.id === ")") {
              break;
            }
            advance(",");
          }
        }
        zeroth.species = "Destructuring[Array]";
        break;
      case "{":
        // Object destructuring
        zeroth = [];
        advance();
        // Empty destructuring? It's possible.
        if (tok.id !== "}") {
          while (true) {
            zeroth.push(expr());
            advance();
            if (tok && tok.id === "}") {
              break;
            }
            advance(",");
            console.log("Something went wrong with the comma")
          }
        }
        zeroth.species = "Destructuring[Object]";
        break;
      case "[":
        // Parse Array
        zeroth = [];
        advance();
        // Detect empty array
        if (tok.id !== "]") {
          //Add an expression object for each element of the array.
          while (true) {
            zeroth.push(expr());
            advance();
            if (tok && tok.id === "]") {
              break;
            }
            advance(",");
          }
        }
        zeroth = arrayToObj(zeroth); // Support parsing of object literals.
        break;
      case "(keyword)":
        switch (tok.string) {
          case "func":
            // Figure out functions parameter list.
            advance();
            advance();
            type = "function";
            zeroth = []; // Zeroth will serve as the parameter list
            //Is there no parameter list?
            if (tok.id !== ")") {
              // Figure out the parameter list
              while (true) {
                const nextParam = expr(); // Any valid expression can be used in parameter position
                zeroth.push(nextParam);
                if (nextTok.id === ")") {
                  // The parameter list has finished
                  advance(); // Prepare for block
                  break;
                }
                if (nextTok.id === ",") {
                  //Let's skip to the next parameter
                  advance();
                  advance();
                }
              }
            }
            wunth = block();
            break;
        }
        break;
      case "(error)":
        // Return invalid tokens
        return error(`Unexpected token(s) ${tok.string}`)
      default:
        // As for alphanumerics, they just translated to their string values.
        if (tok.alphanumeric || (prevTok.id === "[" && tok.id === ":")) {
          zeroth = tok.id;
        } else {
          // Other non-alphanumeric tokens become errors
          return error(`Unexpected token ${tok.id}`);
        }
        break;
    }
  }
  // Are there more tokens left?
  if (nextTok !== undefined) {
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
        if (tok.id === ")") {
          // Is there a refinement after the end of the method call? A subscript? ANOTHER method call?
          if (isExprAhead()) {
            // If so, record it in twoth
            twoth = expr();
          }
          break;
        }
        // Figure out the parameter list
        while (true) {
          const nextParam = expr(); // Any valid expression can be used in parameter position
          wunth.push(nextParam);
          if (nextTok.id === ")") {
            // The invocation has finished
            advance(); // Put ")" in the token position to allow mixing of refinements and methods.
            break;
          }
          advance();
          advance(",");
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
    advance("(keyword)");
    ifStatement.twoth = block(extraAdv);
  }
  return ifStatement;
}

parseStatement.loop = (extraAdv) => {
  const loopStatement = {
    type: "loop"
  }
  loopStatement.zeroth = block(extraAdv);
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
const exprKeywords = Object.freeze(["func"]);
function statement(extraAdv) {
  if (tok && tok.id === "(keyword)" && !exprKeywords.includes(tok.string)) {
    return parseStatement[tok.string](extraAdv);
  } else {
    let res = expr();
    if (res !== undefined && res.id === "(error)") {
      return res;
    }
    if (typeIn(res, "assignment") || typeIn(res, "invocation")) {
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
  while (tok && tok.id !== "}") {
    statements.push(statement());
    advance();
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
    if (part.id === "(error)") {
      throw part.zeroth;
      errorFound = true;
      return false;
    } else if (part.type) {
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
  [tok, nextTok] = [tokList[0], tokList[1]];
  const statementz = statements();
  if (!findAndThrow(statementz)) {
    return statementz;
  }
  return [];
})