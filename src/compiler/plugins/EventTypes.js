const plugMan = require("./PluginManager")

class Event {
  constructor() {
    this.cancelled = false
    this.notifyPlugins()
  }

  cancel() {
    this.cancelled = true
  }

  isCancelled() {
    return this.cancelled
  }

  notifyPlugins() {
    plugMan.triggerEvent(this)
  }
}

class InjectableEvent extends Event {
  constructor(defaultValue) {
    this.value = defaultValue
    super()
  }

  setReturnValue(newValue) {
    this.value = newValue
  }

  getReturnValue() {
    return super.isCancelled()? this.value : null
  }
}

class CompileFileEvent extends Event {
  constructor(filename) {
    this.filename = filename
    super()
  }
}

class ReadEvalPrintLoopStartupEvent extends Event {
  // not sure what plugin authors may want with this, but here it is
}

class CompilerStartupEvent extends Event {
  // I guess this is cancellable?
}

class CompilerCodeGenerationEvent extends InjectableEvent {
  constructor(code) {
    this.value = code
    super()
  }
}

class PluginApplyEvent extends Event {
  constructor(plugin) {
    this.plugin = plugin
    super()
  }
}

module.exports = {
  Event,
  InjectableEvent,
  PluginApplyEvent,
  ReadEvalPrintLoopStartupEvent,
  CompilerCodeGenerationEvent,
  CompileFileEvent
}
