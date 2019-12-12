const { Command, flags } = require("@oclif/command")
const tokenize = require("../compiler/tokenize")
const parse = require("../compiler/parse")
const gen = require("../compiler/gen")
const fs = require("fs")
class WatchCommand extends Command {
  async run() {
    const { args } = this.parse(WatchCommand)
    let { path, to } = args
    if (!path) {
      throw new Error("Watch expects path.")
    }
    if (!to) {
      to = path.replace(/(.+).zlang/, "$1.js")
    }
    fs.watchFile(path, (curr, prev) => {
      this.log(`Transpiling ${path}...`)
      fs.readFile(path, (err, data) => {
        if (err) {
          this.log(err)
        }
        let res
        try {
          res = gen(parse(tokenize(data.toString())))
        } catch (err) {
          this.log(err)
        }
        fs.writeFile(to, res, err => {
          if (err) {
            this.log(err)
          }
        })
      })
    })
  }
}

WatchCommand.description = `Acts like transpile, but transpiles a file on changes.
...
path: Path of file to transpile
to: Where to transpile the file
`

WatchCommand.args = [
  { name: "path", description: "Path of file to transpile", required: true },
  { name: "to", description: "Where to transpile the file.", required: false }
]
module.exports = WatchCommand
