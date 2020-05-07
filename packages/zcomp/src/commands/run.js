const tokenize = require("../compiler/tokenize");
const parse = require("../compiler/parse");
const gen = require("../compiler/gen");
const fs = require("fs");

function main({ path }) {
  fs.readFile(path, (err, data) => {
    if (err) {
      return console.log(err);
    }
    const deps = [];
    const res = [];
    const ast = parse(tokenize(data.toString()));
    ast.forEach((statement, index) => {
      if (statement.type === "import" && statement.wunth.includes(".zlang")) {
        deps.push(statement.wunth.replace(/"/g, ""));
        const r = statement.wunth
          .replace(/([^\/]+)\.zlang/, "_tmp_$1.js")
          .replace(/"/g, "");
        res.push(r);
        ast[index].wunth = `"${r}"`;
      }
    });
    if (deps.length === 0) {
      const tmppath = path.replace(/([^\/]+)\.zlang/, "_tmp_$1.js");
      fs.writeFile(tmppath, gen(ast), (err) => {
        if (err) {
          return console.log(err);
        }
        const moduleFilename = module.filename;
        const _filename = __filename;
        const _dirname = __dirname;
        module.filename = tmppath;
        __filename = tmppath;
        __dirname = tmppath.replace(/([^\/]+)\.(.+)/, "");
        try {
          eval(gen(ast));
        } catch (err) {
          console.log(err);
        }
        module.filename = moduleFilename;
        __filename = _filename;
        __dirname = _dirname;
        fs.unlink(tmppath, (err) => {
          if (err) {
            console.log(err);
          }
        });
      });
    }
    let complete = 0;
    let errFound = false;
    deps.forEach((dep, index) => {
      if (errFound) {
        return;
      }
      const r = res[index];
      dep = dep.replace(/^(\.\/|\/)/, "");
      fs.readFile(dep, (err, data) => {
        if (err) {
          return console.log(err);
        }
        let transpiled;
        try {
          transpiled = gen(parse(tokenize(data.toString()), false));
        } catch (err) {
          console.log(`Error in file ${dep}:`);
          console.log(err.toString());
          errFound = true;
          res.forEach((r) => {
            if (fs.existsSync(r)) {
              fs.unlink(r, (err) => {
                if (err) {
                  console.log(err);
                }
              });
            }
          });
          return;
        }
        fs.writeFile(r, transpiled, (err) => {
          if (err) {
            return console.log(err);
          }
          complete += 1;
          if (complete === deps.length) {
            const tmppath = path.replace(/([^\/]+)\.zlang/, "_tmp_$1.js");
            fs.writeFile(tmppath, gen(ast), (err) => {
              if (err) {
                return console.log(err);
              }
              const moduleFilename = module.filename;
              const _filename = __filename;
              const _dirname = __dirname;
              module.filename = tmppath;
              __filename = tmppath;
              __dirname = tmppath.replace(/([^\/]+)\.(.+)/, "");
              try {
                eval(gen(ast));
              } catch (err) {
                console.log(err);
              }
              module.filename = moduleFilename;
              __filename = _filename;
              __dirname = _dirname;
              fs.unlink(tmppath, (err) => {
                if (err) {
                  console.log(err);
                }
              });
              res.forEach((r) => {
                fs.unlink(r, (err) => {
                  if (err) {
                    console.log(err);
                  }
                });
              });
            });
          }
        });
      });
    });
  });
}

module.exports = main;
