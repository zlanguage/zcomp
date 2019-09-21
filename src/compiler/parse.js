"use strict";
// List of all warnings: [string]
let warnings = [];
// An API for registering error objects will later be displayed.
const errors = function() {
    let index = 0;
    let errors = [];
    return {
        empty() {
            errors = [];
        },
        push(val) {
            if (errors[index] === undefined) {
                errors[index] = val;
            }
        },
        next() {
            index += 1;
        },
        restart() {
            index = 0;
        },
        get length() {
            return errors.reduce(t => t + 1, 0);
        },
        forEach(cb) {
            errors.forEach(cb);
        },
        first() {
            return errors.find(x => x);
        }
    }
}();
let prevTok;
let tok;
let nextTok;
let tokList;
// THe current token.
let index = 0;
// Metadata collected via `meta` statements
let metadata = {
    ddsdir: process.cwd() // Default place where the dollar directives are coming from.
};
// Valid left-associative operator names (all built-in)
// To is reserved for future use.
const validNameOps = ["and", "or", "to", "til", "by"];
// Unary operations involving keywords.
// get(arg) - JavaScript: `await (arg).from()`
// static(arg) - Derives a trait on the enum itself
const unOps = ["get", "static", "sym", "bsym"];

// Operators that can be broken over newlines, ex: |>
const validStartLineOps = ["$or$gt"];
// All of Z's operators
const ops = {
        and: -333,
        or: -333,
        $eq: -222,
        $lt: -111,
        $gt: -111,
        $gt$eq: -111,
        $lt$eq: -111,
        $plus$plus: 111,
        $plus: 111,
        $minus: 111,
        $star: 222,
        $slash: 222,
        $percent: 222,
        $carot: 333,
        by: 444,
        to: 555,
        til: 555
    }
    // Reference to how Z mangles identifiers for debugging.
const symbolMap = {
    "+": "$plus",
    "-": "$minus",
    "*": "$star",
    "/": "$slash",
    "^": "$carot",
    "?": "$question",
    "=": "$eq",
    "<": "$lt",
    ">": "$gt",
    "\\": "$backslash",
    "&": "$and",
    "|": "$or",
    "%": "$percent",
    "'": "$quote",
    "!": "$exclam"
};
// Reverse of the above (also for debugging).
const reverseSymMap = {
    "$plus": "+",
    "$minus": "-",
    "$star": "*",
    "$slash": "/",
    "$carot": "^",
    "$question": "?",
    "$eq": "=",
    "$lt": "<",
    "$gt": ">",
    "$backslash": "\\",
    "$and": "&",
    "$or": "|",
    "$percent": "%",
    "$quote": "'",
    "$exclam": "!"
};
// Checks if identifier is valid JS name
const isValidName = /^[A-Za-z_$][A-za-z_$0-9]*$/;
// Checks if an identifier consists only of symbols. (ie. +, -, ?!?) but not +x
const validOpName = RegExp(`^(${Object.keys(reverseSymMap).filter(key => key.startsWith("$")).map(key => key.replace(/\$/g, "\\$")).join("|")})+$`);

// Makes an error (which is an object)
function error(message) {
    return {
        id: "(error)",
        zeroth: `Error: "${message}" at ${formatCurrLine()}.`
    };
}

// Records a warning (which is a string)
function warn(message) {
    warnings.push(`Warning: "${message}" at ${formatCurrLine()}.`)
}
// Makes an error without the quotes.
function nqerror(message) {
    return {
        id: "(error)",
        zeroth: `Error: ${message} at ${formatCurrLine()}.`
    };
}

// Formats the current token position: "{lineNumber}:{columnNumber}:{columnTo}"
function formatCurrLine() {
    let lastTok;
    // Find the last available token.
    if (tok) {
        lastTok = tok;
    } else {
        for (let idx = index; lastTok === undefined; idx -= 1) {
            lastTok = tokList[idx];
        }
    }
    return `${lastTok.lineNumber + 1}:${lastTok.columnNumber}:${lastTok.columnTo}`
}

// Move ahead one token, while checking the current token (not the incoming one) has a certain id.
function advance(id) {
    isTok(id)
    index += 1;
    prevTok = tok;
    tok = nextTok;
    nextTok = tokList[index + 1];
}

// Fall back one token
function fallback() {
    index -= 1;
    nextTok = tok;
    tok = prevTok;
    prevTok = tokList[index - 1];
}
// Check that the token has a certain id.
function isTok(id) {
    if (tok && id !== undefined && id !== tok.id) {
        errors.push(error(`Expected "${id}" but got "${tok.id}".`));
    }
    if (tok === undefined && id !== undefined) {
        errors.push(error(`Expected "${id}" but got nothing.`));
    }
}

// See if a specific type of expression (type) is a subexpression of (thing)
function typeIn(thing, type) {
    if (thing === undefined) {
        return false;
    }
    return thing.type === type || typeIn(thing.zeroth, type) || typeIn(thing.wunth, type) || typeIn(thing.twoth, type);
}

// Converts an array of assignments into an object.
function arrayToObj(arr) {
    if (!Array.isArray(arr)) {
        return arr;
    }
    if (!arr.some(field => field && field.type === "assignment")) {
        return arr;
    }
    // Prepare the object
    const obj = arr.map(field => { // Allow for [name] -> ["name": name] syntax
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

// Is there an expression ahead of the current token?
function isExprAhead() {
    return nextTok !== undefined && ["(", "[", ".", "..", ":"].includes(nextTok.id) && ((["(", "["].includes(nextTok.id)) ? tok.lineNumber === nextTok.lineNumber : true); // Invocations and subscripts must be on the same line.
}
// Implicit parameter check.
function isImplicit(str) {
    return typeof str === "string" && str.endsWith("$exclam");
}

function isExpr(obj) {
    return obj && ["subscript", "refinement", "invocation", "assignment", "function"].includes(obj.type);
}
// Searches an expression for implicit parameters and returns the ones it finds.
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

// Finds the wildcards in a pattern.
function findWildcards(pat) {
    const wildcards = [];
    switch (typeof pat) {
        case "string":
            if (pat.includes("$exclam")) {
                const [_, wildcard] = pat.split("$exclam");
                if (wildcard) {
                    wildcards.push(wildcard);
                }
            } else if (/^[a-z_]$/.test(pat[0]) && !pat.includes("$question")) {
                wildcards.push(pat)
            }
        case "object":
            if (pat.type === "spread") {
                wildcards.push(pat.wunth);
            } else if (pat.species === "Destructuring[Array]") {
                pat.forEach(patpart => {
                    wildcards.push(...findWildcards(patpart));
                })
            } else if (pat.type === "invocation") {
                pat.wunth.species = "Destructuring[Array]";
                wildcards.push(...findWildcards(pat.wunth));
            } else if (pat.species === "Destructuring[Object]") {
                const pats = arrayToObj([...pat]).map(([k, v]) => v);
                pats.forEach(patpart => {
                    wildcards.push(...findWildcards(patpart))
                })
            }
    }
    return Array.from(new Set(wildcards));
}
// Adds return-type assertions to a return statement.
function convertReturns(returnType, statement) {
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
// And return-type assertions to a whole function.
function wrapReturn(returnType, block) {
    if (!block) { return block }
    if (!returnType.startsWith(`"`)) {
        // Stringify return type for use with assertType function.
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
// Configures an expression in a near identical manner to expr()
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

// Determines the precedence of an operator
function opPred(op) {
    // Does the operator have valid precedence?
    if (ops[op] !== undefined) {
        // If so, return that.
        return ops[op];
    }
    // Otherwise, return a default of 1.
    return 1;
}
// Checks if an operator can be left-associative
function isValidOp(op) {
    // Is it part of a predefined list of left-associative operators?
    if (validNameOps.includes(op)) {
        return true;
    }
    // Is it all symbols?
    if (validOpName.test(op)) {
        return true;
    }
    // Otherwise, it's a right-associative operator.
    return false;
}
// Changes an expression according to the rules of operator precedence.
// Takes: +(3, -(2, 7))
// And Returns: +(-(3, 2), 7)
function swapLeftToRight(obj) {
    // Is the object not an object?
    if (!obj) {
        return obj;
    }
    // Is it already in proper oder?
    if (obj.leftToRight) {
        return obj;
    }
    // Is it not a function call?
    if (obj.type !== "invocation") {
        return obj;
    }
    // Does it fit the shape needed to switch operators?
    if (!obj.wunth) {
        return obj;
    }
    if (!obj.wunth[1]) {
        return obj;
    }
    if (obj.wunth[1].type !== "invocation") {
        return obj;
    }
    // Is the operator in question (the second one) right associative?
    if (!isValidOp(obj.wunth[1].zeroth)) {
        return obj;
    }
    // Does the operator in question have greater precednece than the current operator being evaluated second?
    if (opPred(obj.wunth[1].zeroth) > opPred(obj.zeroth)) {
        return obj;
    }
    // Otherwise, switch the order in which the operators are evaluated.
    const nested = obj.wunth[1];
    const outer = obj;
    const res = {
            type: "invocation",
            zeroth: nested.zeroth,
            wunth: [{
                    type: "invocation",
                    zeroth: outer.zeroth,
                    wunth: [outer.wunth[0], nested.wunth[0]]
                },
                nested.wunth[1]
            ]
        }
        /* console.log("In: ", JSON.stringify(obj, undefined, 4));
        console.log("Out: ", JSON.stringify(res, undefined, 4)); */
        // Mark the changed expression as in correct order, so it is not flipped back by a subsequent call.
    Object.defineProperty(res, "leftToRight", {
        value: true,
        enumerable: false
    });
    // Return the modified expression.
    return res;
}
// Orders an expression left-to-right using the above function.
function leftToRight(obj) {
    if (!obj || typeof obj !== "object") {
        return obj;
    }
    if (obj.type === "invocation") {
        obj = swapLeftToRight(obj);
    }
    if (obj.zeroth && obj.zeroth.type === "invocation") {
        obj.zeroth = leftToRight(obj.zeroth);
    }
    if (obj.wunth && obj.wunth.type === "invocation") {
        obj.wunth = leftToRight(obj.wunth);
    }
    if (Array.isArray(obj.wunth)) {
        obj.wunth = obj.wunth.map(leftToRight);
    }
    if (obj.twoth && obj.twoth.type === "invocation") {
        obj.twoth = leftToRight(obj.twoth);
    }
    return obj;
}
// Parses a collection literal.
function parseCol(start, end, sep = ",") {
    let res = [];
    advance(start);
    if (tok && tok.id !== end) {
        while (true) {
            const toPush = expr();
            // Check for errors in the expression about to be added to the up-and-coming collection.
            if (!findAndThrow(toPush)) {
                res.push(toPush)
            }
            advance();
            if (tok && tok.id === sep) {
                advance(sep);
            } else {
                break;
            }
        }
        isTok(end);
    }
    return res;
}

// Checks if a statement has a `get` expresison in it.
function hasGet(statement) {
    if (statement == null || typeof statement !== "object") {
        return false;
    }
    if (statement.type === "function") {
        return false;
    }
    if (statement.type === "go") {
        return false;
    }
    if (statement.type === "get") {
        return true;
    }
    for (const part of[statement.zeroth, statement.wunth, statement.twoth]) {
        if (hasGet(part)) {
            return true;
        }
        if (Array.isArray(part)) {
            return isGoroutine(part);
        }
    }
    return false;
}
// Used for seeing if a function can be treated as a goroutine
function isGoroutine(ast) {
    return ast.some(statement => hasGet(statement) ? true : false)
}

// Regexes for demangling identifiers for debugging
const demanglers = Object.keys(reverseSymMap).map(x => {
    const res = new RegExp(`\\${x}`, "g");
    res.str = reverseSymMap[x];
    return res;
});
// Reverses the mangling performed in tokenization.
function demangle(str) {
    demanglers.forEach(demangler => {
        str = str.replace(demangler, demangler.str);
    });
    return str;
}
// Detects if an alphanumeric identifier could have been intended as an operator.
function warnBadOp(str) {
    if (str.id.endsWith("$eq") || str.id.endsWith("$exclam")) {
        return;
    }
    if (isValidOp(str.id)) {
        return;
    }
    const syms = Object.keys(ops).filter(op => op.startsWith("$"));
    syms.forEach(sym => {
        if (str.id.includes(sym)) {
            warn(`You may have intended to use ${demangle(sym)} as an operator in this context. To do so, separate the operator and it's operands. ${str.source} is interpreted as an alphanumeric identifier without spaces.`);
        }
    })
}
// Allows for expressions with more than two parts to use operators.
function mkChain(type, zeroth, wunth, twoth) {
    // Detect normal operator
    if (
        (
            (
                type === "refinement" || type === "condrefinement"
            ) && twoth.type === "invocation" && twoth.zeroth !== wunth) ||
        (type === "subscript" && twoth.type === "invocation" && twoth.zeroth !== "]") ||
        (type === "invocation" && twoth.type === "invocation" && twoth.zeroth !== ")")) {
        // console.log("In: ", JSON.stringify(configureExpr(type, zeroth, wunth, twoth), undefined, 4))
        // Detect partial application
        if (twoth.zeroth === "curry") {
            const oldType = type;
            const oldZeroth = zeroth;
            const oldWunth = wunth;
            type = "invocation";
            zeroth = "curry";
            wunth = twoth.wunth;
            wunth[0].wunth[0].zeroth = {
                type: oldType,
                zeroth: oldZeroth,
                wunth: oldWunth,
                twoth: wunth[0].wunth[0].zeroth
            }
            twoth = undefined;
        } else { // Otherwise, fix it like normal
            const operator = twoth.zeroth;
            const realTwoth = twoth.wunth[0];
            const rightHand = twoth.wunth[1];
            const resolution = mkChain(type, zeroth, wunth, realTwoth)
            type = "invocation";
            zeroth = operator;
            wunth = [resolution, rightHand];
            twoth = undefined;
        }
        // console.log("Out: ", JSON.stringify(configureExpr(type, zeroth, wunth, twoth), undefined, 4))
    }
    return configureExpr(type, zeroth, wunth, twoth);
}

function expr({ infix = true } = {}) {
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
            case "(regexp)":
                zeroth = RegExp(tok.string, tok.flags);
                break;
            case "(":
                // Parse destructuring
                // Parens are never part of tuple literals - Z dosen't have them
                zeroth = parseCol("(", ")");
                zeroth.species = "Destructuring[Array]";
                // Allow for () {} syntax. () {} = (func (){})
                if (nextTok && nextTok.id === "{") {
                    zeroth.push({
                        type: "function",
                        zeroth: [],
                        wunth: block()
                    });
                }
                break;
            case "{":
                // Object destructuring
                zeroth = parseCol("{", "}")
                zeroth.species = "Destructuring[Object]";
                break;
            case "[":
                // Parse Array
                zeroth = parseCol("[", "]")
                zeroth = arrayToObj(zeroth); // Support parsing of object literals.
                break;
            case "$":
                // Parse dollar directive
                advance("$");
                type = "dds";
                // $"path" and $path are both valid dollar directives.
                if (tok.alphanumeric) {
                    zeroth = tok.id;
                } else {
                    zeroth = tok.string;
                }
                // Find the dollar directive
                const transformer = require(metadata.ddsdir + zeroth);
                advance();
                // Apply it.
                wunth = transformer(expr(), {...metadata });
                break;
                // Expressions starting with refinements are functions in disguise. .x = func x!.x
            case ".":
                // Put "." in nextTok for refinement
                fallback();
                tok = { alphanumeric: true, id: "(throwaway)" }
                const chain = expr({ infix: false });
                // Configure the function.
                type = "function"
                zeroth = ["obj"]
                wunth = [{
                    type: "return",
                    zeroth: {
                        type: "refinement",
                        zeroth: "obj",
                        wunth: chain.wunth,
                        twoth: chain.twoth
                    }
                }]
                break;
            case "(keyword)":
                switch (tok.string) {
                    // For statically deriving traits
                    case "static":
                        type = "static";
                        advance("(keyword)");
                        zeroth = tok.id;
                        break;
                        // Denotes a goroutine
                    case "go":
                        advance("(keyword)")
                        type = "goroutine"
                            // Function parsing
                    case "func":
                        if (type !== "goroutine") {
                            type = "function";
                        }
                        // Keep track of parameter types.
                        const typeChecks = [];
                        zeroth = []; // Zeroth will serve as the parameter list
                        // Figure out functions parameter list.
                        // Look for implicit parameters
                        // If it's a normal function:
                        if (nextTok && nextTok.id === "(") {
                            advance();
                            advance();
                            // Detect empty parameter list
                            if (tok && tok.id !== ")") {
                                // Figure out the parameter list
                                let i = 0;
                                while (i < 100) {
                                    if (tok && tok.id === "(keyword)") {
                                        errors.push(error("Unexpected keyword in parameter list."));
                                    }
                                    const nextParam = expr(); // Any valid expression can be used in parameter position
                                    if (!findAndThrow(nextParam)) {
                                        zeroth.push(nextParam);
                                    }
                                    // Check for runtime type checks
                                    if (nextTok && nextTok.alphanumeric) {
                                        if (isValidName.test(nextParam)) {
                                            typeChecks.push([nextParam, nextTok.id]);
                                        }
                                        advance();
                                    }
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
                                    i += 1;
                                }
                                // Maximum 100 parameters.
                                if (i === 100) {
                                    return error("Unclosed function parameter list.");
                                }
                            }
                            // Turn the type-checks into an enter statement. (If there are any)
                            if (nextTok && nextTok.id === "{") {
                                wunth = [...typeChecks.map(([param, type]) => ({
                                    type: "enter",
                                    zeroth: [{
                                        type: "invocation",
                                        zeroth: "$eq",
                                        wunth: [{
                                                type: "invocation",
                                                zeroth: type.includes("$gt") ? "typeGeneric" : "typeOf",
                                                wunth: [param]
                                            }, // Handle generics types.
                                            `"${type.replace(/\$exclam$/, "").replace(/\$gt/g, ">").replace(/\$lt/g, "<")}"`
                                        ]
                                    }]
                                })), ...block()];
                            } else if (tok && tok.id === ")" && nextTok && nextTok.alphanumeric && nextTok.id.endsWith("$exclam")) { // Or handle a return type
                                advance(")");
                                const returnType = tok.id.replace(/\$exclam$/, "");
                                wunth = [...typeChecks.map(([param, type]) => ({
                                    type: "enter",
                                    zeroth: [{
                                        type: "invocation",
                                        zeroth: "$eq",
                                        wunth: [{
                                                type: "invocation",
                                                zeroth: type.includes("$gt") ? "typeGeneric" : "typeOf",
                                                wunth: [param]
                                            },
                                            `"${type.replace(/\$exclam$/, "").replace(/\$gt/g, ">").replace(/\$lt/g, "<")}"`
                                        ]
                                    }]
                                })), ...wrapReturn(returnType, block())]; // Wrap the function body's return statements with type assertions.
                            } else {
                                // Single-expression function: func (params) expr
                                advance(")");
                                wunth = [{
                                    type: "return",
                                    zeroth: expr()
                                }];
                            }
                        } else {
                            // Find implicit parameters in a function and add them to the parameter list
                            advance("(keyword)");
                            const implicitExpr = expr();
                            zeroth = findImplicits(implicitExpr);
                            wunth = [{
                                type: "return",
                                zeroth: implicitExpr
                            }];
                        }
                        // Support for goroutine inference
                        if (isGoroutine(wunth)) {
                            type = "goroutine";
                        }
                        if (isExprAhead()) {
                            twoth = expr();
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
                            // Find wildcards in the match expression. A wildcard is a lowercase alphanumeric identifier
                            const wildcards = findWildcards(pat);
                            advance();
                            let res;
                            if (nextTok && nextTok.id !== "{") {
                                advance("$eq$gt");
                                // Single expression result: pat => expr
                                res = {
                                    type: "function",
                                    zeroth: wildcards,
                                    wunth: [{
                                        type: "return",
                                        zeroth: expr()
                                    }]
                                };
                            } else {
                                isTok("$eq$gt");
                                // Block result: pat => block
                                res = {
                                    type: "function",
                                    zeroth: wildcards,
                                    wunth: block()
                                }
                            }
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
                        break;
                    case "loop":
                        // Parse loop
                        type = "loopexpr";
                        advance("(keyword)");
                        advance("(");
                        zeroth = [];
                        while (tok && tok.id !== ")") {
                            // Allow for predicates inside loop expression
                            if (tok.id === "(keyword)" && tok.string === "if") {
                                advance("(keyword)")
                                zeroth.push({
                                    type: "predicate",
                                    zeroth: expr()
                                })
                            } else {
                                // Otherwise, just add a normal expresison. Invalid expressions are ignored.
                                zeroth.push(expr());
                            }
                            advance();
                            if (tok && tok.id === ",") {
                                advance(",")
                            } else {
                                break;
                            }
                        }
                        advance(")");
                        // Body of loop expression: loop(gens, predicates, assignments) body
                        wunth = expr();
                        break;
                    case "if":
                        // Parse ternary operator.
                        advance("(keyword)");
                        type = "ifexpr";
                        advance("(");
                        zeroth = expr();
                        advance();
                        advance(")");
                        wunth = expr();
                        advance();
                        if (tok && tok.string !== "else") {
                            return error("Ternary operator requires else clause.");
                        }
                        advance("(keyword)");
                        twoth = expr();
                        break;
                    case "get":
                        // Get is a unary operation.
                        advance("(keyword)");
                        type = "get";
                        zeroth = expr();
                        if (nextTok && nextTok.id === "(keyword)" && nextTok.string === "else") {
                            advance();
                            const oldZeroth = zeroth;
                            type = "invocation";
                            zeroth = "handleErr";
                            wunth = [{
                                    type: "get",
                                    zeroth: oldZeroth
                                },
                                {
                                    type: "function",
                                    zeroth: ["err"],
                                    wunth: block()
                                }
                            ]
                        }
                        break;
                    default:
                        zeroth = tok.string;
                }
                break;
            case "...":
                // Parse spread / splat
                type = "spread";
                advance();
                zeroth = "...";
                wunth = expr();
                break;
            case "@":
                if (nextTok.alphanumeric === true) {
                    advance();
                    zeroth = "@" + tok.source;
                } else if (nextTok.id === "@") {
                    advance();
                    advance();
                    zeroth = "@@" + tok.source;
                } else {
                    zeroth = "@";
                }
                break;
            case "(error)":
                // Return invalid tokens
                return error(`Unexpected token(s) ${tok.string}`);
            default:
                // As for alphanumerics, they just translated to their string values.
                if (tok.alphanumeric || (prevTok.id === "[" && tok.id === ":") || tok.id === ")" || tok.id === "]" || tok.id === "@" || tok.id === "}") {
                    // Check if the identifier was intended as an operator.
                    warnBadOp(tok);
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
                // Negative numbers with decimals support
                if (tok.number !== undefined && typeof zeroth === "number") {
                    zeroth = Number(`${zeroth}.${tok.number}`);
                    if (isExprAhead()) {
                        const temp = expr();
                        console.log(JSON.stringify(temp, undefined, 4));
                        wunth = temp.wunth;
                        twoth = temp.twoth;
                        ({ type, zeroth, wunth, twoth } = mkChain(type, zeroth, wunth, twoth));
                    }
                } else {
                    if (!tok.alphanumeric && tok.id !== "(keyword)") {
                        return error(`Refinement expects valid identifier but instead got ${tok.id}.`)
                    }
                    wunth = tok.id === "(keyword)" ? tok.string : tok.id; // And the property being accessed
                    //Update twoth with next part of expression.
                    if (isExprAhead()) {
                        twoth = expr();
                        ({ type, zeroth, wunth, twoth } = mkChain(type, zeroth, wunth, twoth)); // Support operators with refinments.
                    }
                }
                break;
            case "..":
                // Optional chaining.
                advance();
                advance();
                type = "condrefinement";
                if (!tok) {
                    return error(`Infix operation refinement requires right-hand side for property access. Only left-hand provided.`);
                }
                if (!tok.alphanumeric && tok.id !== "(keyword)") {
                    return error(`Refinement expects valid identifier but instead got ${tok.id}.`)
                }
                wunth = tok.id === "(keyword)" ? tok.string : tok.id;
                if (isExprAhead()) {
                    twoth = expr();
                    ({ type, zeroth, wunth, twoth } = mkChain(type, zeroth, wunth, twoth)); // Support operators for optional chaining.
                }
                break;
            case "...":
                // Parse range
                // Currently, range only can have a one-token prefix.
                type = "range";
                advance();
                advance();
                wunth = expr();
                break;
            case "(":
                // It's an invocation
                advance();
                type = "invocation";
                wunth = parseCol("(", ")");
                if (wunth.length !== 0 && wunth.every(param => param && param.type === "assignment")) {
                    wunth = [wunth.map(({ zeroth, wunth }) => [`"` + zeroth + `"`, wunth])];
                    wunth[0].species = "Object";
                }
                // Allow for partial application
                if (wunth.includes("@")) {
                    // Record the function being partially applied.
                    const wrappedFunc = zeroth;
                    type = "function";
                    zeroth = [];
                    wunth.filter(param => param === "@").forEach((_, index) => {
                        zeroth[index] = "$".repeat(index + 1)
                    })
                    let currParamDollarAmt = 1;
                    wunth = [{
                        type: "return",
                        zeroth: {
                            type: "invocation",
                            zeroth: wrappedFunc,
                            wunth: wunth.map((param, index) => {
                                if (param === "@") {
                                    const res = "$".repeat(currParamDollarAmt);
                                    currParamDollarAmt += 1;
                                    return res;
                                }
                                return param
                            })
                        }
                    }]
                    const result = configureExpr(type, zeroth, wunth, twoth);
                    type = "invocation";
                    zeroth = "curry";
                    wunth = [result];
                }
                // Is there a refinement after the end of the method call? A subscript? ANOTHER method call?
                if (isExprAhead()) {
                    // If so, record it in twoth
                    twoth = expr();
                    ({ type, zeroth, wunth, twoth } = mkChain(type, zeroth, wunth, twoth)); // Support operators with invocations.
                }
                break;
            case "[":
                // Parse subscript
                advance();
                advance();
                type = "subscript";
                wunth = expr(); // Unlike refinements, subscripts allow ANY expression for property access
                // Handle slicing (this will be changed at some point in the future, do not use in Z projects).
                if (typeIn(wunth, "assignment") || wunth === ":") {
                    // Begining slice [start:]
                    if (wunth.type === "assignment" && wunth.wunth === "]") {
                        type = "refinement";
                        const start = wunth.zeroth;
                        wunth = "slice";
                        twoth = {
                            type: "invocation",
                            zeroth: "slice",
                            wunth: [start]
                        }
                    } else if (wunth.type === "assignment") { // Handle dual slice [start:end]
                        type = "refinement";
                        const start = wunth.zeroth;
                        const end = wunth.wunth;
                        wunth = "slice";
                        twoth = {
                            type: "invocation",
                            zeroth: "slice",
                            wunth: [start, end]
                        }
                        advance();
                        isTok("]");
                    }
                    if (wunth === ":") {
                        // Full slice [:]
                        if (nextTok.id === "]") {
                            advance(":");
                            type = "refinement";
                            wunth = "slice";
                            twoth = {
                                type: "invocation",
                                zeroth: "slice",
                                wunth: []
                            }
                        } else {
                            // End slice [:end]
                            advance(":");
                            type = "refinement";
                            if (tok.number === undefined) {
                                return error("For now, end slices (slices in the format [:_]) can only accept raw numeric literals.");
                            }
                            const end = tok.number;
                            wunth = "slice";
                            twoth = {
                                type: "invocation",
                                zeroth: "slice",
                                wunth: [0, end]
                            }
                            advance("(number)");
                            isTok("]");
                        }
                    }
                    // Continue to the next part of the expression
                    if (isExprAhead()) {
                        twoth.twoth = expr();
                    }
                } else {
                    advance();
                    isTok("]");
                    // Continue to the next part of the expression
                    if (isExprAhead()) {
                        twoth = expr();
                        ({ type, zeroth, wunth, twoth } = mkChain(type, zeroth, wunth, twoth));
                    }
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
    // Handle operator
    if (nextTok && nextTok.alphanumeric && (validStartLineOps.includes(nextTok.id) ? true : nextTok.lineNumber === tok.lineNumber) && !nextTok.id.endsWith("$exclam") && nextTok.id !== "$eq$gt" && infix) {
        // Check if operator may be invalid or be intended to mean something else. For example, the operator +2 probably was meant to mean + 2
        warnBadOp(nextTok);
        advance();
        advance();
        let res = {
                type: "invocation",
                zeroth: prevTok.id,
                wunth: [configureExpr(type, zeroth, wunth, twoth), expr()].filter(param => param !== undefined)
            }
            /*Object.defineProperty(res, "infix", {
              value: true,
              enumerable: false
            });*/
        return leftToRight(res);
    }
    // Typed assignment: variable type!: expr
    if (nextTok && nextTok.alphanumeric && nextTok.id.endsWith("$exclam") && tokList[index + 2] && tokList[index + 2].id !== "," && tokList[index + 2].id !== ")") {
        type = "assignment";
        const typeToAssert = nextTok.id.replace(/\$exclam$/, "");
        advance();
        advance();
        advance(":");
        wunth = {
            type: "invocation",
            zeroth: "assertType",
            wunth: ["\"" + typeToAssert + "\"", expr()]
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
    // Some unary operations capture zeroth only
    if (unOps.includes(type)) {
        return {
            type,
            zeroth
        }
    }
    // Return raw value if isn't a complete token
    return zeroth;
}
// Object to store functions, each which parses a statement.
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
            // Z uses : for assignment, but it's a common mistake to try and use "="
            if (assignment.type === "invocation" && assignment.zeroth === "$eq") {
                warn("The assignment operator in Z is :, but you used =.");
            }
            return error(`Let statement expects assignment.`);
        }
        letStatement.zeroth.push(assignment);
        // Parse additional assignments.
        while (nextTok && nextTok.id === ",") {
            advance();
            advance(",");
            assignment = expr();
            if (assignment.type !== "assignment") {
                if (assignment.type === "invocation" && assignment.zeroth === "$eq") {
                    return error("The assignment operator in Z is :, but you used =.");
                }
                return error(`Let statement expects assignment.`);
            }
            letStatement.zeroth.push(assignment);
        }
        return letStatement;
    }
    // Def is like const
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
    // Test for shorthand imports:
    if (isValidName.test(imported)) { // import {name} = import {name}: "{name}"
        importStatement.zeroth = imported;
        importStatement.wunth = `"${imported}"`
    } else if (typeIn(imported, "refinement")) { // import some.thing = import thing: "some/thing"
        let path = `"${imported.zeroth}/${imported.wunth}`;
        let modName = "";
        if (imported.twoth) {
            imported = imported.twoth;
            // Traverse refinements to extract import path.
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
            // Only one refinement in import path.
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
        // Simplistic import: import {name}: "{path}"
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
    if (tok.id === "(") {
        warn("If conditions in Z don't have parentheses around them. This could lead to a misinterpretation of the entire if statement. Try `if cond {` rather than `if (cond) {`.")
    }
    ifStatement.zeroth = expr();
    ifStatement.wunth = block(extraAdv);
    // "else if" is a special case, you cannot omit the braces after else (or if) otherwise.
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
    if (returnStatement.zeroth.id === "(error)") {
        warn("You may have a bare return statement in your code. These are not allowed in Z. Use `return undefined` instead.")
    }
    return returnStatement;
}

// This takes care of the "}" at the end of blocks (Here for legacy reasons).
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
    // Check for "on" clause
    if (nextTok && nextTok.id === "(keyword)" && nextTok.string === "on") {
        advance();
        advance("(keyword)");
        tryStatement.wunth = expr();
        tryStatement.twoth = block();
    } else {
        return error("Try block needs an 'on' clause.")
    }
    return tryStatement;
}

// settle statements exist to make sure you take care of errors.
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
        wunth: `"@zlanguage/zstdlib/src/js/${tok.id}"` // The npm package where the standard library lives.
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
    // Store metadata for passing to dollar directives later
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

parseStatement.operator = () => {
        advance("(keyword)");
        const op = tok.id;
        advance();
        advance(":");
        const pred = tok.number;
        // Record the operator's new precedence
        ops[op] = pred;
        return {
            type: "operator",
            zeroth: op,
            wunth: pred
        };
    }
    // hoist is like var
parseStatement.hoist = () => {
    const res = parseStatement.let();
    res.type = "hoist";
    return res;
}
parseStatement.enum = () => {
    advance("(keyword)")
    const res = {
        type: "enum",
    }
    if (nextTok.id === "(") {
        // enum Point(x: number!, y: number!)
        const name = expr();
        res.zeroth = name.zeroth;
        res.wunth = [name];
    } else {
        /* enum Maybe {
          Some(thing),
          None
        }
        enum Color {
          Red,
          Green,
          Blue
        }*/
        res.zeroth = tok.id;
        advance();
        res.wunth = parseCol("{", "}");
        // Check for invalid expressions in the enum body.
        if (!res.wunth.every(part => typeof part === "string" || part.type === "invocation")) {
            return error("Only parenless constructors and normal constructors are allowed in enum declarations.");
        }
    }
    // Detect errors in the fields of the constructors of the enum.
    if (!res.wunth.filter(part => part.type === "invocation").every(invok => invok.wunth.every(part => Array.isArray(part) || typeof part === "string"))) {
        return error(`Error in enum constructor parameter list. Enum name: ${res.zeroth}.`);
    }
    // Deal with derives and static derives.
    if (nextTok && nextTok.id === "(keyword)" && nextTok.string === "derives") {
        advance()
        advance("(keyword)")
        const derives = parseCol("(", ")");
        res.derives = derives.filter(derive => derive.type !== "static");
        res.staticDerives = derives.filter(derive => derive.type === "static").map(derive => derive.zeroth);
    }
    // The "where" block, where static methods are declared.
    if (nextTok && nextTok.id === "(keyword)" && nextTok.string === "where") {
        advance();
        advance("(keyword)");
        advance("{");
        res.twoth = {};
        if (tok.id !== "}") {
            while (true) {
                // Get the function name
                const key = tok.id;
                advance();
                // Get the function body
                const temp = expr();
                const func = {
                    type: "function",
                    zeroth: temp.slice(0, -1),
                    wunth: temp[temp.length - 1].wunth
                };
                res.twoth[key] = func;
                advance("}");
                if (!tok) {
                    break;
                }
                if (tok.id === "}") {
                    break;
                }
            }
        }
        isTok("}");
    }
    return res;
}
parseStatement.go = function() {
        return {
            type: "go",
            zeroth: block()
        }
    }
    // Dollar Directives are compile-time macros
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
    // Actually load the dollar directive.
    const transformer = require(metadata.ddsdir + dollarDir.zeroth);
    dollarDir.wunth = transformer(statement(), {...metadata });
    return dollarDir;
}
// Keywords that can be used as valid statements or expressions.
const exprKeywords = Object.freeze(["func", "match", "get"]);

function statement() {
    // For normal statement keywords
    if (tok && tok.id === "(keyword)" && !exprKeywords.includes(tok.string)) {
        const parser = parseStatement[tok.string];
        if (typeof parser !== "function") {
            return error("Invalid use of keyword.")
        }
        return parser();
    } else if (tok && tok.id === "$") {
        return parseDollarDirective();
    } else { // Otherwise, it's some kind of expressions
        let res = expr();

        if (res !== undefined && res.id === "(error)") {
            return res;
        }
        if (typeIn(res, "assignment") || typeIn(res, "invocation") || typeIn(res, "get") || typeIn(res, "match") || typeIn(res, "function") || res && res.species === "Destructuring[Array]") { // If res is a valid standalone expression, return it.
            return res;
        } else {
            if (res !== undefined) { // Otherwise, report an error.
                return error("Invalid expression, expression must be an assignment or invocation if it does not involve a keyword.");
            }
        }
    }
}

function block() {
    let statements = [];
    advance();
    const init = tok;
    advance();
    let i = 0;
    while (tok && tok.id !== "}" && i < 1e6) {
        const st = statement();
        // Check for errors.
        if (!findAndThrow(st)) {
            statements.push(st);
        }
        advance();
        i += 1;
    }
    if (tok === undefined) {
        tok = init;
        const res = nqerror("Unclosed block. Block started");
        tok = undefined;
        errors.push(res);
    }
    // Check for unclosed block.
    if (i === 1e6) {
        errors.push(error("Unclosed block."));
    }
    return statements;
}
// Gather all the statements together.
function statements() {
    const statements = [];
    let nextStatement;
    while (true) {
        nextStatement = statement();
        // Are there no statements left?
        if (nextStatement === undefined && nextTok === undefined) {
            break;
        }
        if (nextStatement === undefined) {
            break;
        }
        if (nextStatement.type === undefined && nextTok === undefined && nextStatement.id !== "(error)") {
            break;
        }
        // Handle suffix if: "something if cond"
        if (nextTok && nextTok.id === "(keyword)" && nextTok.string === "if" && nextTok.lineNumber === tok.lineNumber) {
            advance();
            advance("(keyword)");
            nextStatement = {
                type: "if",
                zeroth: expr(),
                wunth: [nextStatement]
            }
        }
        // Otherwise, continue
        statements.push(nextStatement);
        // Start a new list of errors.
        errors.next();
        advance();
    }
    // Go back to the beginning of the list of errors.
    errors.restart();
    return statements;
}

function arrayWrap(arr) {
    if (!Array.isArray(arr)) {
        return [arr];
    }
    return arr;
}

// Look for more errors and add them to the list.
// Return true if errors were found.
function findAndThrow(ast, topLevel = true) {
    let errorFound = false;
    arrayWrap(ast).forEach(part => {
        if (part && part.id === "(error)") {
            errors.push(part);
            errorFound = true;
        } else if (part && part.type) {
            if (part && part.zeroth) {
                errorFound = findAndThrow(part.zeroth, false);
            }
            if (part && part.wunth) {
                errorFound = findAndThrow(part.wunth, false);
            }
            if (part && part.twoth) {
                errorFound = findAndThrow(part.twoth), false;
            }
        }
        if (topLevel) {
            errors.next();
        }
    });
    if (errors.length > 0) {
        return true;
    }
    return errorFound;
}

// Tie everything together with one function.
module.exports = Object.freeze(function parse(tokGen, debug = true) {
    // Generate a list of tokens.
    tokList = function() {
        let res = [];
        for (let i;
            (i = tokGen()) !== undefined;) {
            res.push(i);
        }
        return res;
    }();
    // Re-init all the variables
    index = 0;
    metadata = {};
    errors.empty();
    warnings = [];
    [tok, nextTok] = [tokList[0], tokList[1]];
    // Gather statements
    const statementz = statements();
    // Display warnings
    if (warnings.length > 0 && debug) {
        console.log(`${warnings.length} warning${warnings.length === 1 ? "" : "s"} generated:`);
        warnings.forEach(warning => {
            console.log(warning);
        })
    }
    // console.log(JSON.stringify(statementz, undefined, 4));
    if (!findAndThrow(statementz)) {
        // Resolve top-level get.
        if (isGoroutine(statementz)) {
            if (statementz.some(statement => statement.type === "export")) {
                throw error("Export and top-level get do not work well together. Until top-level await is supported, another solution is needed. Try exporting a promise instead.").zeroth;
            }
            return [{
                    type: "def",
                    zeroth: [{
                        type: "assignment",
                        zeroth: "$main",
                        wunth: {
                            type: "goroutine",
                            zeroth: [],
                            wunth: statementz
                        }
                    }]
                },
                {
                    type: "invocation",
                    zeroth: "$main",
                    wunth: []
                }
            ]
        }
        return statementz;
    }
    // If debug mode is on, print out a list of errors.
    if (debug) {
        console.log(`${errors.length} error${errors.length === 1 ? "" : "s"} generated:`);
        errors.forEach(error => {
            console.log(error.zeroth);
        })
    } else { // Otherwise, just throw the first one.
        if (errors.first() != null) {
            throw errors.first().zeroth;
        }
    }
    return [];
})