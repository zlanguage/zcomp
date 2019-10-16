const types = require("./EventTypes")

class Plugin {
  constructor() {
  }

  onApply(applicationEvent) {
    this.onEvent(applicationEvent)
  }

  onEvent(event) {
  }
}

module.exports = Plugin
