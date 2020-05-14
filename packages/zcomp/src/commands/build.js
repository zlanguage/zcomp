import tokenize from "../compiler/tokenize";
import parse from "../compiler/parse";
import gen from "../compiler/gen";
import fs from "fs";

export default function main(file, { outFile }, plugins) {
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
      plugins.forEach((p) => {
        res =
          p._eventbus_announce("outputGeneratedCode", {
            code: res,
          }) ?? res;
      });
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
