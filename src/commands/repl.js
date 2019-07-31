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
        rl.prompt();
        rl.on("line", code => {
            this.log(eval(gen(parse(tokenize(code)))));
            rl.prompt();
        })
    }
}

ReplCommand.description = `A stateless (for now) repl.
`


module.exports = ReplCommand