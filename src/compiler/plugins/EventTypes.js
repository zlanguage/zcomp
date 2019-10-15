class Event {
  constructor() {
    this.cancelled = false
  }

  function cancel() {
    this.cancelled = true
  }
}

class CompileFileEvent extends Event {
  constructor(filename) {
    super()
    this.filename = filename
  }
}

class CompilerStartupEvent extends Event {
  // I guess this is cancellable?
}

class PluginApplyEvent extends Event {
  constructor(plugin) {
    super()
    this.plugin = plugin
  }
}
