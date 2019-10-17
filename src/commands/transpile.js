const { Command, flags } = require("@oclif/command")
const tokenize = require("../compiler/tokenize")
const parse = require("../compiler/parse")
const gen = require("../compiler/gen")
const fs = require("fs");

class TranspileCommand extends Command {
  async run() {
    const { args } = this.parse(TranspileCommand)
    let { path, to } = args
    if (!path) {
      throw new Error("Transpilation expects path.")
    }
    if (!to) {
      to = path.replace(/(.+).zlang/, "$1.js")
    }
    fs.readFile(path, (err, data) => {
      if (err) {
        return this.log(err)
      }
      let res = ""
      const eventTypes = require("../compiler/plugins/EventTypes")
      let e = new eventTypes.CompileFileEvent(path)
      if (e.isCancelled) {
        return
      }
      try {
        res = gen(parse(tokenize(data.toString())))
      } catch (err) {
        this.log(err)
      }
      fs.writeFile(to, res, err => {
        if (err) {
          this.log(err)
        }
      });
    });
  }
}

TranspileCommand.description = `Transpiles given file from Z to JS

Options:
path: Path of file to transpile
to: Where to transpile the file
`;

TranspileCommand.args = [
  { name: "path", description: "Path of file to transpile", required: true },
  { name: "to", description: "Where to transpile the file.", required: false }
]

module.exports = TranspileCommand
