const plug = require("./Plugin")
const types = require("./EventTypes")

let loadedPlugins = []

export default function apply(plugin) {
  if(!plugin instanceof plug.Plugin) {
    console.error("Failed to apply plugin as the type was incorrect.")
  } else {
    val safe = true
    loadedPlugins.forEach(pi => {
      if(pi == plugin) {
        safe = false
      }
    })
    if(!safe) {
      console.error("Duplicate plugin application detected. Proceeed with caution!")
    } else {
      loadedPlugins.append(plugin)
    }
  }
}

export function triggerLoads() {
  loadedPlugins.forEach(it => loadedPlugins.forEach(other => other.onApply(new types.PluginApplyEvent(it))))
}

export function triggerEvent(event) {
  loadedPlugins.forEach(it => it.onEvent(event))
}
