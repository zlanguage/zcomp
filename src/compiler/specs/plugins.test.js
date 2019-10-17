const {
    expect
} = require("chai")

const Plugin = require("../plugins/Plugin")
const EventTypes = require("../plugins/EventTypes")
const PluginManager = require("../plugins/PluginManager")

describe("Plugin class tests", () => {
    it("should allow creating a new instance of Plugin", () => {
        new Plugin()
    })
    it("should have an onEvent method that returns null when a non-event is passed to it.", () => {
        expect(
            new Plugin().onEvent("foo")
        ).to.eql(null);
    })
    it("should have an onEvent method that returns undefined when an valid parameter is passed to it.", () => {
        expect(
          new Plugin().onEvent(
            new EventTypes.CompileFileEvent()
          )
        ).to.eql(undefined);
    })
    it("should have an onApply method that is an alias to the onEvent method.", () => {
        expect(
            new Plugin().onApply(
                new EventTypes.PluginApplyEvent(new Plugin())
            )
        );
    })
})

describe("Event types tests", () => {
    it("File application should require a plugin manager", () => {
        try {
            new Plugin.onApply(new EventTypes.PluginApplyEvent());
            throw new Error("No error was thrown.")
        } catch (e) {
        }
    })
})

describe("Plugin manager tests", () => {
    it("can properly apply a basic plugin", () => {
        let testPlugin = new Plugin()
        testPlugin.onApply = () => {
            return [true]
        }
        expect(PluginManager.apply(testPlugin)).to.eql(testPlugin)
        PluginManager.triggerLoads()
    })
})
