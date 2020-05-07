const tokenize = require("../compiler/tokenize");
const parse = require("../compiler/parse");
const gen = require("../compiler/gen");
const fs = require("fs");

function main(file, { outFile }) {
  if (!outFile) {
    outFile = file.replace(/(.+).zlang/, "$1.js");
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      return console.log(err);
    }
    let res;
    try {
      res = gen(parse(tokenize(data.toString())));
    } catch (err) {
      console.log(err);
    }
    fs.writeFile(outFile, res, (err) => {
      if (err) {
        console.log(err);
      }
    });
  });
}

module.exports = main;
