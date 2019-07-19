const { Command, flags } = require('@oclif/command');
const tokenize = require("../compiler/tokenize");
const parse = require("../compiler/parse");
const gen = require("../compiler/gen");
const fs = require("fs");
class TranspileCommand extends Command {
    async run() {
        const { args } = this.parse(TranspileCommand);
        let { path, to } = args;
        if (!path) {
            throw new Error("Transpilation expects path.");
        }
        if (!to) {
            to = path.replace(/(.+).zlang/, "$1.js");
        }
        fs.readFile(path, (err, data) => {
            if (err) {
                return console.log(err);
            }
            fs.writeFile(to, gen(parse(tokenize(data.toString()))), err => {
                if (err) {
                    console.log(err);
                }
            });
        });
    }
}

TranspileCommand.description = `Transpiles files from Z into JS
...
path: Path of file to transpile
to: Where to transpile the file
`;

TranspileCommand.args = [
    { name: "path", description: "Path of file to transpile", required: true },
    { name: "to", description: "Where to transpile the file.", required: false }
];
module.exports = TranspileCommand;