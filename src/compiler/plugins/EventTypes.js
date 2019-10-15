const plugMan = require("./PluginManager")

export default class Event {
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

export class InjectableEvent extends Event {
  constructor(defaultValue) {
    this.value = defaultValue
    super()
  }

  setReturnValue(newValue) {
    this.value = newValue
  }

  getReturnValue() {
    return this.value
  }
}

export class CompileFileEvent extends Event {
  constructor(filename) {
    this.filename = filename
    super()
  }
}

export class CompilerStartupEvent extends Event {
  // I guess this is cancellable?
}

export class CompilerCodeGenerationEvent extends InjectableEvent {
  constructor(code) {
    this.value = code
    super()
  }
}

export class PluginApplyEvent extends Event {
  constructor(plugin) {
    this.plugin = plugin
    super()
  }
}
