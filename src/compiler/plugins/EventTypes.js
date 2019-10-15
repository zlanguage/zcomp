export default class Event {
  constructor() {
    this.cancelled = false
  }

  function cancel() {
    this.cancelled = true
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

export class PluginApplyEvent extends Event {
  constructor(plugin) {
    super()
    this.plugin = plugin
  }
}
