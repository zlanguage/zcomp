const { program } = require("commander");

program.version("0.6.0");
program.name("zcomp");
program.description("The Z programming language transpiler.");

program
  .command("repl")
  .description("Start a Z REPL.")
  .action(require("./repl"));

program
  .command("run <file>")
  .description("Run a Z source file.")
  .option("-p, --path", "The path to the file.")
  .action(require("./run"));

program
  .command("build <file>")
  .description("Build a Z source file into a JavaScript file.")
  .option("-o, --out-file", "The name of the file to output the code to.")
  .action(require("./build"));

program.parse(process.argv);
