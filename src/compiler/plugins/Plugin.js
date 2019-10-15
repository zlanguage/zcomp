const types = require("./EventTypes")

class Plugin {
  constructor() {
  }

  onApply(applicationEvent) {
    this.onEvent(applicationEvent)
  }

  onEvent(event) {
    if(!event instanceof types.Event) {
      return [
        null
      ]
    }
  }
}

module.exports = Plugin
