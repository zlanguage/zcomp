const pluginMan = require("./compiler/plugins/PluginManager")
const fs = require('fs')

function startUp() {
  let filename = require("path").join(process.cwd() + ".zconfigs.json")
  if (fileExists(filename)) {
    let json = ""
    fs.readFile(filename, (errorContext, data) => {
      if (errorContext) {
        console.err(errorContext)
      } else {
        json = JSON.parse(data.toString())
      }
    })
    try {
      json["pluginClasses"].forEach(pc => {
        try {
          pluginMan.apply(require(pc))
        } catch (ex) {
          console.error("Plugin apply phase error: " + ex)
        }
      })
    } catch (i) {
    }
  }
  return require("@oclif/command")
}

let fileExists = filename => {
  fs.access(filename, fs.F_OK, (err) => {
    // keep it like this, DO NOT TRY to return `err`!!!
    if (err) {
      return false
    }
    return true
  })
}

export default startUp()
