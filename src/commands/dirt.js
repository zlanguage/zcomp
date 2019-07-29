const { Command, flags } = require('@oclif/command');
const fs = require("fs");
const path = require("path");
const gen = require("../compiler/gen");
const parse = require("../compiler/parse");
const tokenize = require("../compiler/tokenize");
class DirtCommand extends Command {
    async run() {
        const { args } = this.parse(DirtCommand)
        const { indir, outdir } = args;
        if (!indir) {
            throw new Error("DIRT command expects indir.");
        }
        if (!outdir) {
            throw new Error("DIRT commands expects outdir.");
        }
        const inPath = path.join(process.cwd(), indir);
        const outPath = path.join(process.cwd(), outdir);
        this.transpileDir(inPath, outPath);
    }
    transpileDir(inPath, outPath) {
        fs.readdir(inPath, (err, files) => {
            if (err) {
                return console.log(err)
            }
            files.forEach(file => {
                const filepath = path.join(inPath, file);
                const outpath = path.join(outPath, file).replace(".zlang", ".js");
                fs.lstat(filepath, (err, stats) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (stats.isFile() && /\.zlang/.test(filepath)) {
                        fs.readFile(filepath, (err, data) => {
                            if (err) {
                                return console.log(err);
                            }
                            const transpiledFile = gen(parse(tokenize(data.toString())));
                            fs.writeFile(outpath, transpiledFile, err => {
                                if (err) {
                                    return console.log(err)
                                }
                            });
                        })
                    } else if (stats.isFile()) {
                        fs.readFile(filepath, (err, data) => {
                            if (err) {
                                return console.log(err);
                            }
                            fs.writeFile(outpath, data.toString(), err => {
                                if (err) {
                                    return console.log(err);
                                }
                            })
                        })
                    } else if (stats.isDirectory()) {
                        fs.exists(outpath, exists => {
                            if (!exists) {
                                fs.mkdir(outpath, err => {
                                    if (err) {
                                        return console.log(err);
                                    }
                                });
                            }
                            this.transpileDir(filepath, outpath);
                        })
                    } else {
                        throw new Error(`File ${file} not supported by DIRT command.`);
                    }
                });
            });
        });
    }
}

DirtCommand.description = `Recursive directory compiling.`;

DirtCommand.args = [
    { name: "indir", description: "Path of the directory to transpile", required: true },
    { name: "outdir", description: "Path of the directory to transpile to.", required: true }
];

module.exports = DirtCommand;