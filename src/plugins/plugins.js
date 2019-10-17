const plugins = [];

function register({
    startup = () => {},
    event
}) {
    const trueEvent =
        (typeof event !== "function") ? (param) => {
            return (event[param.type] !== undefined) ?
                event[param.type](param.value) : undefined
        } : event
    startup();
    plugins.push(trueEvent);
}

function fire({ type, value }) {
    return plugins.reduce((value, plugin) => {
        const res = plugin({ type, value });
        return (res === undefined) ? value : res;
    }, value);
}

module.exports = {
    register,
    fire
}