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
   * @param {{ code: string }} data The code.
   */
  handleCode({ code }) {
    return prettier.format(code, this.getPrettierConfig());
  }

  /**
   * Load the prettier configuration.
   *
   * @returns {{} | prettier.Options} The options.
   */
  getPrettierConfig() {
    return loadConfig().prettierOptions ?? {};
  }
}
