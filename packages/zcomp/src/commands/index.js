import { program } from "commander";
import loadConfig from "@zlanguage/config";
import loadPlugins from "@zlanguage/plugin/loader";

program.version("0.6.0");
program.name("zcomp");
program.description("The Z programming language transpiler.");

const config = loadConfig();
const plugins = loadPlugins(config);

// Allow plugins to attach custom commands
plugins.forEach((plugin) => {
  plugin._eventbus_announce("cliStartup", {
    cli: program,
  });
});

program
  .command("repl")
  .description("Start a Z REPL.")
  .action(require("./repl"));

program
  .command("run <file>")
  .description("Run a Z source file.")
  .action(require("./run"));

program
  .command("build <file>")
  .description("Build a Z source file into a JavaScript file.")
  .option("-o, --out-file", "The name of the file to output the code to.")
  .action((file, opts) => require("./build")(file, opts, plugins));

program.parse(process.argv);
