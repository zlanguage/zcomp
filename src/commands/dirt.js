const fs = require("fs");
const path = require("path");
const gen = require("../compiler/gen");
const parse = require("../compiler/parse");
const tokenize = require("../compiler/tokenize");

function transpileDir(inPath, outPath) {
  fs.readdir(inPath, (err, files) => {
    if (err) {
      return this.log(err);
    }
    files.forEach((file) => {
      const filepath = path.join(inPath, file);
      const outpath = path.join(outPath, file).replace(".zlang", ".js");
      fs.lstat(filepath, (err, stats) => {
        if (err) {
          return this.log(err);
        }
        if (stats.isFile() && /\.zlang/.test(filepath)) {
          fs.readFile(filepath, (err, data) => {
            if (err) {
              return this.log(err);
            }
            let transpiledFile;
            try {
              transpiledFile = gen(parse(tokenize(data.toString()), false));
            } catch (err) {
              console.log(`In file ${filepath}, error found:`);
              console.log(err);
            }
            fs.writeFile(outpath, transpiledFile, (err) => {
              if (err) {
                return console.log(err);
              }
            });
          });
        } else if (stats.isFile()) {
          fs.readFile(filepath, (err, data) => {
            if (err) {
              return console.log(err);
            }
            fs.writeFile(outpath, data.toString(), (err) => {
              if (err) {
                return console.log(err);
              }
            });
          });
        } else if (stats.isDirectory()) {
          fs.exists(outpath, (exists) => {
            if (!exists) {
              fs.mkdir(outpath, (err) => {
                if (err) {
                  return console.log(err);
                }
              });
            }
            transpileDir(filepath, outpath);
          });
        } else {
          throw new Error(`File ${file} not supported by dirt command.`);
        }
      });
    });
  });
}

async function main({ inDir, outDir }) {
  const inPath = path.join(process.cwd(), inDir);
  const outPath = path.join(process.cwd(), outDir);
  transpileDir(inPath, outPath);
}

module.exports = main;
