/**
 * A Z plugin.
 */
export default class Plugin {
  /**
   * Set up the plugin.
   * CAUTION: you will want to call super if you override this.
   */
  constructor() {
    this.name = "Plugin";
    this.listeners = {};
  }

  /**
   * A list of valid events you can listen for.
   */
  static listenerTypes = ["cliStartup", "outputGeneratedCode"];

  /**
   * Listen for an event, and run the callback once it gets triggered.
   *
   * @param {string} event The name of the event.
   * @param {(data: any) => void} callback The function to run once the event happens.
   */
  listen(event, callback) {
    if (!Plugin.listenerTypes.includes(event)) {
      console.log(
        `[WARN] [${this.name}] - I don't know how to listen for ${event}!`
      );
    }
    if (Array.isArray(this.listeners[event])) {
      this.listeners[event].push(callback);
    } else {
      this.listeners[event] = [callback];
    }
  }

  /**
   * Internal function to dispatch events.
   * DO NOT CALL FROM YOUR PLUGIN!!
   *
   * @param {string} name The event name.
   * @param {any} data The event data.
   */
  _eventbus_announce(name, data) {
    if (Array.isArray(this.listeners[name])) {
      this.listeners[name].forEach((eventCallback) => {
        return eventCallback(data);
      });
    }
  }
}
