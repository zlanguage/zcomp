/**
 * Load the plugins requested by the configuration.
 *
 * @param {*} config The configuration.
 * @returns {import("./index").default[]} A list of plugin objects.
 */
export default function loadPlugins(config) {
  let pluginObjects = [];
  const pluginPaths = config?.plugins ?? [];
  pluginPaths.forEach((p) => {
    pluginObjects.push(new require(p));
  });
  return pluginObjects;
}
