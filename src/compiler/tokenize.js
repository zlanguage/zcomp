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
const symbolRegExps = Object.keys(symbolMap).map(x => {
    const res = new RegExp(`\\${x}`, "g");
    res.str = symbolMap[x];
    return res;
});
//@ts-check
const unicodeEscapementRegExp = /\\u\{([0-9A-F]{4,6})\}/g;
const newLineRegExp = /\n|\r\n?/;
/*
Capturing Group:
[1] Whitespace
[2] Comment
[3] String
[4] Keyword
[5] Name
[6] Number
[7] Punctuator
*/
const tokenRegExp = /(\u0020+|\t+)|(#.*)|("(?:[^"\\]|\\(?:[nr"\\]|u\{[0-9A-F]{4,6}\}))*")|\b(let|loop|if|else|func|break|import|export|match|return|def|try|on|settle|raise|importstd|meta|enter|exit|operator|hoist|go|get|enum|where|derives|static)\b|([A-Za-z_+\-/*%&|?^=<>'!][A-Za-z_0-9+\-/*%&|?^<>='!]*)|((?:0[box])?-?\d[\d_]*(?:\.[\d_]+)?(?:e\-?[\d_]+)?[a-z]*)|(\.{2,3}|[@$(),.{}\[\]:])/y;
/**
 * Create a token generator for a specific source.
 * @param {string | Array<string>} source If string is provided, string is split along newlines. If array is provided, array is used as the array of lines.
 * @param {boolean} comment Should comments be tokenized and returned from the generator?
 * @returns {() => void | {id: string, lineNumber: number, columnNumber: number, string ?: string, columnTo ?: number, readonly ?: boolean, alphanumeric ?: boolean, number ?: number, source ?: string}} A function that generates the next token.
 */
function tokenize(source, comment = false) {
    // Handle multiline comments
    source = source.replace(new RegExp("/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)*/", "g"), "");
    // Configure source
    const lines = (
        Array.isArray(source) ?
        source :
        source.split(newLineRegExp)
    );
    let lineNumber = 0;
    // Refinements are not mangled
    let dotLast = false;
    let line = lines[0];
    // Keep trackc of where the token is on the line
    tokenRegExp.lastIndex = 0;
    return function tokenGenerator() {
        // Are we done yet?
        if (line === undefined) {
            return;
        }
        let columnNumber = tokenRegExp.lastIndex;
        // Do we need to go to the next line?
        if (columnNumber >= line.length) {
            tokenRegExp.lastIndex = 0;
            lineNumber += 1;
            line = lines[lineNumber];
            // Get the next token.
            return (
                line === undefined ?
                undefined :
                tokenGenerator()
            );
        }
        // Figure out the current token.
        let captives = tokenRegExp.exec(line);
        // If no tokens were matched, it's an error.
        if (!captives) {
            let res = {
                id: "(error)",
                lineNumber,
                columnNumber,
                columnTo: columnNumber,
                string: line.slice(columnNumber)
            }
            line = undefined;
            return res;
        }
        // Whitespace matched
        if (captives[1]) {
            dotLast = false;
            // Ignore whitespace - Z has flexible whitespace rules.
            return tokenGenerator();
        }
        const columnTo = tokenRegExp.lastIndex;
        // Comment matched
        if (captives[2]) {
            dotLast = false;
            // Ignore empty comments
            return (
                comment ? {
                    id: "(comment)",
                    comment: captives[2],
                    lineNumber,
                    columnNumber,
                    columnTo
                } :
                tokenGenerator()
            )
        }
        // String Matched
        if (captives[3]) {
            dotLast = false;
            return {
                id: "(string)",
                readonly: true,
                string: JSON.parse(captives[3].replace( // Handle unicode escapement.
                    unicodeEscapementRegExp,
                    function(ignore, code) {
                        //@ts-ignore
                        return String.fromCodePoint(parseInt(code, 16));
                    }
                )),
                lineNumber,
                columnNumber,
                columnTo
            };
        }
        // Keyword Matched
        if (captives[4]) {
            dotLast = false;
            return {
                id: "(keyword)",
                string: captives[4],
                lineNumber,
                columnNumber,
                columnTo
            };
        }
        // Name Matched
        if (captives[5]) {
            let res = captives[5];
            if (!dotLast) { // If a . wasn't last (the identifier isn't part of a refinement/property access)
                // Mangle it
                symbolRegExps.forEach(regexp => {
                    res = res.replace(regexp, regexp.str);
                });
            }
            // Allow negative numbers.
            if (/\$minus\d+/.test(res)) {
                res = res.replace("$minus", "-")
                return {
                    id: "(number)",
                    readonly: true,
                    number: Number(res.replace(/(?:[^\d])([^0])[a-z]+/g, "$1").replace(/[a-z]$/, "").replace(/_/g, "")),
                    string: res,
                    lineNumber,
                    columnNumber,
                    columnTo
                };
            }
            dotLast = false;
            return {
                id: res,
                source: captives[5],
                alphanumeric: true,
                lineNumber,
                columnNumber,
                columnTo
            };
        }
        // Number Matched
        if (captives[6]) {
            dotLast = false;
            return {
                id: "(number)",
                readonly: true,
                number: Number(captives[6].replace(/(?:[^\d])([^0])[a-z]+/g, "$1").replace(/[a-z]$/, "").replace(/_/g, "")), // Make the number JS-Compatable for parsing
                string: captives[6],
                lineNumber,
                columnNumber,
                columnTo
            };
        }
        // Punctuator Matched
        if (captives[7]) {
            if (captives[7] === ".") {
                dotLast = true; // This means a refinement is coming. The next alphanumeric identifier will not be mangled.
            } else {
                dotLast = false;
            }
            return {
                id: captives[7],
                lineNumber,
                columnNumber,
                columnTo
            }
        }
    }
}
module.exports = Object.freeze(tokenize);