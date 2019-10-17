class Event {
  constructor() {
    this.cancelled = false
    this.notifyPlugins = () => {
      require("./PluginManager").triggerEvent(this)
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
  constructor(filename, outfilename) {
    super()
    this.filename = filename
    this.outfilename = outfilename
    this.notifyPlugins()
  }
}

class ReadEvalPrintLoopStartupEvent extends Event {
}

class CompilerStartupEvent extends Event {
}

class CompilerCodeGenerationEvent extends Event {
  constructor(code) {
    super()
    this.value = code
    this.notifyPlugins()
  }

  setReturnValue(newValue) {
    this.value = newValue
  }

  getReturnValue() {
    return !this.isCancelled()? this.value : ""
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
  PluginApplyEvent,
  ReadEvalPrintLoopStartupEvent,
  CompilerCodeGenerationEvent,
  CompileFileEvent
}
