const { Command, flags } = require("@oclif/command")
const fs = require("fs")
const path = require("path")

class ConfigCommand extends Command {
  async run() {
    const { args } = this.parse(ConfigCommand);
    const { theJson } = args;
    if (!theJson) {
      throw new Error("CONFIG command expects the location of the JSON file to be passed.")
    }
    var content = fs.readFileSync(path.join(process.cwd(), theJson))
    var dict = JSON.parse(content)
  }
}

ConfigCommand.description = "Define a JSON configuration for the compiler."

ConfigCommand.args = [{
  name: "json",
  description: "Where the configuration JSON is located.",
  required: true
}]

module.exports = ConfigCommand
