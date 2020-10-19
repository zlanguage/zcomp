import Plugin from "@zlanguage/plugin";
import prettier from "prettier";
import loadConfig from "@zlanguage/config";

/**
 * A plugin that runs Prettier on outputted code.
 */
export default class PrettierPlugin extends Plugin {
  constructor() {
    super();
    this.name = "zcomp-plugin-prettier";

    this.listen("outputGeneratedCode", this.handleCode);
  }

  /**
   * Handles the code.
   *
   * @param {{ code: string, prettierConfig?: {} }} data The code.
   */
  handleCode(data) {
    const { code, prettierConfig } = data;
    return prettier.format(code, this.getPrettierConfig(prettierConfig));
  }

  /**
   * Load the prettier configuration.
   *
   * @param {prettier.Options?} fallback The fallback config.
   * @returns {prettier.Options} The options.
   */
  getPrettierConfig(fallback) {
    return loadConfig().prettierOptions ?? fallback;
  }
}
