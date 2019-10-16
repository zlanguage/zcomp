class Event {
  constructor(downstream) {
    this.cancelled = false
    this.downstream = downstream
    this.notifyPlugins = () => {
      const plugMan = require("./PluginManager")
      plugMan.triggerEvent(this.downstream)
    }
  }

  cancel() {
    this.cancelled = true
  }

  isCancelled() {
    return this.cancelled
  }
}

class CompileFileEvent extends Event {
  constructor(filename) {
    super(this)
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
    super(this)
    this.value = code
    this.notifyPlugins()
  }

  setReturnValue(newValue) {
    this.value = newValue
  }

  getReturnValue() {
    let e = this.isCancelled()? this.value : ""
    console.log("debug " + e)
    return e
  }
}

class PluginApplyEvent extends Event {
  constructor(plugin) {
    super(this)
    this.plugin = plugin
    this.notifyEvents()
  }
}

module.exports = {
  Event,
  PluginApplyEvent,
  ReadEvalPrintLoopStartupEvent,
  CompilerCodeGenerationEvent,
  CompileFileEvent
}
