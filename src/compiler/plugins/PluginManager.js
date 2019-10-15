const plug = require("./Plugin")
const types = require("./EventTypes")

/**
 * Loaded plugins
 * DO NOT MODIFY DIRECTLY, USE `apply(plugin)`
 */
let loadedPlugins = []

export function apply(plugin) {
  if(!plugin instanceof plug.Plugin) {
    console.error("Failed to apply plugin as the type was incorrect.")
  }
  loadedPlugins.append(plugin)
}

export function triggerLoads() {
  loadedPlugins.forEach(it => it.onApply(new types.PluginApplyEvent(it)))
}
