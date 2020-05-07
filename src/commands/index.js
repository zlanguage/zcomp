const { program } = require("commander");

program.version("0.6.0");

program
  .command("dirt")
  .description("Compile a directory recursively.")
  .option("-i, --in-dir", "The base directory to search.")
  .option("-o, --out-dir", "The directory to output built files to.")
  .action(() => require("./dirt").main);

program
  .command("repl")
  .description("Start a Z REPL.")
  .action(() => require("./repl").main);

program
  .command("run")
  .description("Run a Z source file.")
  .option("-p, --path", "The path to the file.")
  .action(() => require("./run").main);

program
  .command("build")
  .description("Build a Z source file into a JavaScript file.")
  .action(() => require("./transpile").main)
