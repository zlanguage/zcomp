const { Command, flags } = require("@oclif/command")
const fs = require("fs")
const path = require("path")
const plugMan = require("../compiler/plugins/PluginManager")
let index = require("../index")

class ConfigCommand extends Command {
  async run() {
    const { args } = this.parse(ConfigCommand);
    const { theJson } = args;
    if (!theJson) {
      throw new Error("CONFIG command expects the location of the JSON file to be passed.")
    }
    let content = fs.readFileSync(path.join(process.cwd(), theJson))
    let dict = JSON.parse(content)
    dict["plugins"].length > 0
     ? dict["plugins"].forEach(entry => index.addConfig(dict))
     : noop()
  }

  async noop() {
  }
}

ConfigCommand.description = "Define a JSON configuration for the compiler."

ConfigCommand.args = [{
  name: "json",
  description: "Where the configuration JSON is located.",
  required: true
}]

module.exports = ConfigCommand
