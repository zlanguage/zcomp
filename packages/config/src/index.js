import merge from "deep-extend";
import fs from "fs";

export const defaultConfig = {
  plugins: [],
};

/**
 * Loads the configuration file.
 *
 * @returns {defaultConfig} The user's configuration.
 */
export default function loadConfig() {
  let config = defaultConfig;
  let json = {};

  if (fs.existsSync("package.json")) {
    json = JSON.parse(fs.readFileSync("package.json"));
    let o = json.zOptions;
    if (!!o) {
      config = merge(config, o);
    }
  }

  if (fs.existsSync("zconfig.json")) {
    json = JSON.parse(fs.readFileSync("zconfig.json"));
    if (!!json) {
      config = merge(config, json);
    }
  }

  return config;
}
