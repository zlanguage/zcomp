const { Command, flags } = require('@oclif/command')
const tokenize = require("../compiler/tokenize");
const parse = require("../compiler/parse");
const gen = require("../compiler/gen");
const fs = require("fs");
class RunCommand extends Command {
    async run() {
        const { args } = this.parse(RunCommand);
        const { path } = args;
        if (!path) {
            throw new Error("Run command expects path.");
        }
        fs.readFile(path, (err, data) => {
            if (err) {
                return console.log(err);
            }
            eval(gen(parse(tokenize(data.toString()))));
        });
    }
}

RunCommand.description = `Runs a Z file as a script, without turning it into a JavaScript file.
...
path - The path of the file to run.'
`;

RunCommand.args = [
    { name: "path", description: 'The path of the file to run.' }
];

module.exports = RunCommand;