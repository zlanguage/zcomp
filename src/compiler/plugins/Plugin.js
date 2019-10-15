const types = require("./EventTypes")

class Plugin {
  constructor() {
  }

  function onApply(applicationEvent) {
    this.onEvent(applicationEvent)
  }

  function onEvent(event) {
    if(!event instanceof types.Event) {
      return
    }
  }
}
