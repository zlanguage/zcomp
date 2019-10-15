const pluginMan = require("./compiler/plugins/PluginManager")

let jsons = []

export function addConfig(configDict) {
  jsons.append(configDict)
}

function startUp() {
  jsons["pluginClasses"].forEach(pc => {
    pluginMan.apply(require(pc))
  })
  return require("@oclif/command")
}

export default startUp()
