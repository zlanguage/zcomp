import merge from "deep-extend";

export const defaultConfig = {
  plugins: [],
};

/**
 * Loads the configuration file.
 *
 * @returns {defaultConfig} The user's configuration.
 */
export default function loadConfig() {
  let loadedConfigYet = false;
  let config = {
    ...defaultConfig,
  };

  try {
    let json = require("package.json");
    let o = json.zOptions;
    if (o) {
      config = merge(config, o);
      loadedConfigYet = true;
    }
  } catch (error) {
    // ignore the error
  }

  if (!loadedConfigYet) {
    try {
      let json = require("zConfig.json");
      if (json) {
        config = merge(config, json);
        loadedConfigYet = true;
      }
    } catch (error) {
      // ignore the error
    }
  }

  return config;
}
