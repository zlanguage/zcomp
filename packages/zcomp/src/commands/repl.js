import readline from "readline";
import path from "path";
import fs from "fs";
import tokenize from "../compiler/tokenize";
import parse from "../compiler/parse";
import gen from "../compiler/gen";
import process from "process";

const lineBreakers = ["(", "{", "["];

function getLines(rl, opener) {
  const symMap = {
    "(": ")",
    "{": "}",
    "[": "]",
  };
  const closer = symMap[opener];
  let open = 1;
  let res = "";
  const string = /("(?:[^"\\]|\\(?:[nr"\\]|u\{[0-9A-F]{4,6}\}))*")/g;
  return new Promise((resolve) => {
    rl.question("..", function recieve(code) {
      res += code + "\n";
      code
        .replace(string, "")
        .split("")
        .filter((char) => [opener, closer].includes(char))
        .forEach((char) => {
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

export default function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const commands = [];
  const loaded = {};

  rl.question("zrepl>", async function ask(code) {
    process.exit(0);
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
            if (Object.keys(loaded).includes(rest)) {
              const [from, to] = loaded[rest];
              commands.splice(
                from,
                to - from + 1,
                ...data.toString().split("\n")
              );
              const dif = data.toString().split("\n").length - (to - from + 1);
              if (dif > 0) {
                loaded[rest] = [from, to + dif];
              }
            } else {
              loaded[rest] = [
                commands.length,
                commands.length - 1 + data.toString().split("\n").length,
              ];
              data
                .toString()
                .split("\n")
                .forEach((ln) => {
                  commands.push(ln);
                });
            }
          });
          break;
        default:
          console.log(`Invalid REPL command: ${command}.`);
      }
    } else {
      if (lineBreakers.some((lb) => code.endsWith(lb))) {
        code += await getLines(rl, code[code.length - 1]);
      }

      let alreadyLogged = false;

      if (
        /^[A-Za-z_+\-/*%&|?^=<>'!][A-Za-z_0-9+\-/*%&|?^<>='!.]*$/.test(code) ||
        code.startsWith("[") ||
        code.startsWith('"') ||
        code.startsWith("`") ||
        code.startsWith("@") ||
        /^((?:0[box])?-?\d[\d_]*(?:\.[\d_]+)?(?:e\-?[\d_]+)?[a-z]*)$/.test(code)
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
          (code.includes(":") && !code.startsWith("log([")) ||
          code.trim().startsWith("import") ||
          code.trim().startsWith("importstd") ||
          code.trim().startsWith("enum") ||
          code.trim().startsWith("macro") ||
          code.trim().startsWith("include") ||
          code.trim().startsWith("includestd")
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
