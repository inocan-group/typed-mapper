"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function dasherize(name) {
    return name
        .split(/[_\s\.]/g)
        .map(val => {
        return (val.charAt(0).toLowerCase() +
            val
                .substr(1)
                .replace(/([A-Z])/gm, "-$1")
                .toLowerCase());
    })
        .join("-");
}
exports.dasherize = dasherize;
function camelize(name) {
    return name.split(/[_\s-\.]/gm).reduce((agg, val) => {
        return agg !== ""
            ? agg + val.charAt(0).toUpperCase() + val.substr(1)
            : val.charAt(0).toLowerCase() + val.substr(1);
    }, "");
}
exports.camelize = camelize;
function pascalize(name) {
    return name.split(/[_\s-\.]/gm).reduce((agg, val) => {
        return agg + val.charAt(0).toUpperCase() + val.substr(1);
    }, "");
}
exports.pascalize = pascalize;
//# sourceMappingURL=stdNameConversions.js.map