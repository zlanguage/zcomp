const plugMan = require("./PluginManager")

class Event {
  constructor() {
    this.cancelled = false
    this.notifyPlugins = () => {
      plugMan.triggerEvent(this)
    }
  }

  cancel() {
    this.cancelled = true
  }

  isCancelled() {
    return this.cancelled
  }
}

class InjectableEvent extends Event {
  constructor(defaultValue) {
    super()
    this.value = defaultValue
  }

  setReturnValue(newValue) {
    this.value = newValue
  }

  getReturnValue() {
    return this.isCancelled()? this.value : null
  }
}

class CompileFileEvent extends Event {
  constructor(filename) {
    super()
    this.filename = filename
    this.notifyPlugins()
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
    super()
    this.value = code
    this.notifyPlugins()
  }
}

class PluginApplyEvent extends Event {
  constructor(plugin) {
    super()
    this.plugin = plugin
    this.notifyEvents()
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
