let jsons = []

export function addConfig(configDict) {
  jsons.append(configDict)
}

export function getConfigs() {
  return jsons
}

function startUp() {
  return require("@oclif/command")
}

export default startUp()
