const { Command } = require("@oclif/command");
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const tokenize = require("../compiler/tokenize");
const parse = require("../compiler/parse");
const gen = require("../compiler/gen");
const lineBreakers = ["(", "{", "["];
class ReplCommand extends Command {
  getLines(rl, opener) {
    const symMap = {
      "(": ")",
      "{": "}",
      "[": "]"
    };
    const closer = symMap[opener];
    let open = 1;
    let res = "";
    const string = /("(?:[^"\\]|\\(?:[nr"\\]|u\{[0-9A-F]{4,6}\}))*")/g;
    return new Promise((resolve, reject) => {
      rl.question("..", function recieve(code) {
        res += code;
        code
          .replace(string, "")
          .split("")
          .filter(char => [opener, closer].includes(char))
          .forEach(char => {
            if (char === opener) {
              open += 1;
            } else {
              open -= 1;
            }
          });
        if (open > 0) {
          rl.question("..", recieve);
        } else {
          resolve(res);
        }
      });
    });
  }
  async run() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    const commands = [];
    const self = this;
    rl.question("zrepl>", async function ask(code) {
      if (code.startsWith(":")) {
        const command = code[1];
        let rest = code.slice(2).trim();
        switch (command) {
          case "l":
            if (!rest.includes(".")) {
              rest = rest + ".zlang";
            }
            fs.readFile(path.join(process.cwd(), rest), (err, data) => {
              if (err) {
                return console.log(err);
              }
              data
                .toString()
                .split("\n")
                .forEach(ln => {
                  commands.push(ln);
                });
            });
            break;
          default:
            console.log(`Invalid REPL command: ${command}.`);
        }
      } else {
        if (lineBreakers.some(lb => code.endsWith(lb))) {
          code += await self.getLines(rl, code[code.length - 1]);
        }
        let alreadyLogged = false;
        if (
          /^[A-Za-z_+\-/*%&|?^=<>'!][A-Za-z_0-9+\-/*%&|?^<>='!.]*$/.test(
            code
          ) ||
          code.startsWith("[")
        ) {
          alreadyLogged = true;
          code = `log(${code})`;
        }
        try {
          let res = eval(
            gen(parse(tokenize(commands.concat(code).join("\n")), false))
          );
          if (res && res.then) {
            res = await res;
          }
          if (res !== "use strict" && !alreadyLogged) {
            console.log(res);
          }
          if (
            code.includes(":") ||
            code.includes("import") ||
            code.includes("importstd") ||
            code.includes("enum")
          ) {
            commands.push(code);
          }
        } catch (err) {
          console.log(
            err.message ? "Error:" : "",
            err.message ? err.message : err
          );
        }
      }
      rl.question("zrepl>", ask);
    });
  }
}

ReplCommand.description = `A repl for evaluating Z code.`;

module.exports = ReplCommand;
