const { Command, flags } = require("@oclif/command")
const fs = require("fs")
const path = require("path")
const gen = require("../compiler/gen")
const parse = require("../compiler/parse")
const tokenize = require("../compiler/tokenize")

class DirtCommand extends Command {
  async run() {
    const { args } = this.parse(DirtCommand)
    const { indir, outdir } = args
    if (!indir) {
      throw new Error("DIRT command expects indir.")
    }
    if (!outdir) {
      throw new Error("DIRT command expects outdir.")
    }
    const inPath = path.join(process.cwd(), indir)
    const outPath = path.join(process.cwd(), outdir)
    this.transpileDir(inPath, outPath)
  }
  transpileDir(inPath, outPath) {
    const eventTypes = require("../compiler/plugins/EventTypes")
    fs.readdir(inPath, (err, files) => {
      if (err) {
        return this.log(err)
      }
      files.forEach(file => {
        const filepath = path.join(inPath, file)
        const outpath = path.join(outPath, file).replace(".zlang", ".js")
        fs.lstat(filepath, (err, stats) => {
          if (err) {
            return this.log(err)
          }
          if (stats.isFile() && /\.zlang/.test(filepath)) {
            fs.readFile(filepath, (err, data) => {
              if (err) {
                return this.log(err)
              }
              let e = new eventTypes.CompileFileEvent(filepath, outpath)
              if (e.isCancelled()) {
                return
              }
              let transpiledFile = ""
              try {
                transpiledFile = gen(parse(tokenize(data.toString()), false))
              } catch (err) {
                this.log(`In file ${filepath}, error found:`)
                this.log(err)
              }
              fs.writeFile(outpath, transpiledFile, err => {
                if (err) {
                  return this.log(err)
                }
              });
            });
          } else if (stats.isFile()) {
            fs.readFile(filepath, (err, data) => {
              if (err) {
                return this.log(err)
              }
              fs.writeFile(outpath, data.toString(), err => {
                if (err) {
                  return this.log(err)
                }
              });
            });
          } else if (stats.isDirectory()) {
            fs.exists(outpath, exists => {
              if (!exists) {
                fs.mkdir(outpath, err => {
                  if (err) {
                    return this.log(err)
                  }
                });
              }
              this.transpileDir(filepath, outpath)
            });
          } else {
            throw new Error(`File ${file} not supported by DIRT command.`)
          }
        })
      })
    })
  }
}

DirtCommand.description = `Recursive directory transpiling.`;

DirtCommand.args = [
  {
    name: "indir",
    description: "Path of the directory to transpile",
    required: true
  },
  {
    name: "outdir",
    description: "Path of the directory to transpile to.",
    required: true
  }
];

module.exports = DirtCommand;
