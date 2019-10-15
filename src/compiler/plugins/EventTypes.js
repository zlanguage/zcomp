export default class Event {
  constructor() {
    this.cancelled = false
  }

  cancel() {
    this.cancelled = true
  }

  isCancelled() {
    return this.cancelled
  }
}

export class CompileFileEvent extends Event {
  constructor(filename) {
    super()
    this.filename = filename
  }
}

export class CompilerStartupEvent extends Event {
  // I guess this is cancellable?
}

export class CompilerCodeGenerationEvent extends Event {
  constructor(code) {
    super()
    this.code = code
  }
}

export class PluginApplyEvent extends Event {
  constructor(plugin) {
    super()
    this.plugin = plugin
  }
}
