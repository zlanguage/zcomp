const { Command } = require('@oclif/command')
const readline = require("readline");
const tokenize = require("../compiler/tokenize");
const parse = require("../compiler/parse");
const gen = require("../compiler/gen");
class ReplCommand extends Command {
    async run() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "zrepl>"
        });
        const commands = [];
        rl.prompt();
        rl.on("line", code => {
            let alreadyLogged = false;
            if (/^[A-Za-z_+\-/*%&|?^=<>'!][A-Za-z_0-9+\-/*%&|?^<>='!.]*$/.test(code)) {
                alreadyLogged = true;
                code = `log(${code})`;
            }
            try {
                let res = eval(gen(parse(tokenize(commands.concat(code).join("\n")), false)));
                if (res !== "use strict" && !alreadyLogged) {
                    console.log(res);
                }
                if (code.includes(":") || code.includes("import") || code.includes("importstd") || code.includes("enum")) {
                    commands.push(code);
                }
            } catch (err) {
                this.log("Error: ", err)
            }
            rl.prompt();
        })
    }
}

ReplCommand.description = `A repl for evaluating Z code.`;


module.exports = ReplCommand;