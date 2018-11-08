"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TypedMapper {
    constructor() {
        this._passthrough = false;
        this._exclude = false;
    }
    static map(config) {
        const obj = new TypedMapper();
        obj.map(config);
        return obj;
    }
    static passthrough(config) {
        const obj = new TypedMapper();
        obj.passthrough(config);
        return obj;
    }
    static exclude(config) {
        const obj = new TypedMapper();
        obj.exclude(config);
        return obj;
    }
    static aggregate(config) {
        const obj = new TypedMapper();
        obj.aggregate(config);
        return obj;
    }
    get mapConfig() {
        return this._map;
    }
    map(config) {
        this._map = config;
        return this;
    }
    passthrough(config) {
        if (this._exclude) {
            const e = new Error(`You can't set both passthroughs and exclusions and exclusions are already set!`);
            e.name = "TypedMapper::NotAllowed";
            throw e;
        }
        this._passthrough = config;
        return this;
    }
    exclude(config) {
        if (this._passthrough) {
            const e = new Error(`You can't set both passthroughs and exclusions and passthroughs are already set!`);
            e.name = "TypedMapper::NotAllowed";
            throw e;
        }
        this._exclude = config;
        return this;
    }
    input(data) {
        this._data = data;
        return this;
    }
    get inputData() {
        return this._data;
    }
    convert(data) {
        if (data) {
            this.input(data);
        }
        if (!this._data) {
            const e = new Error("You must first set the data before trying to convert!");
            e.name = "TypedMapper::NotReady";
            throw e;
        }
        return Array.isArray(this._data)
            ? this._convertArray(this._data)
            : this._convertObject(this._data);
    }
    convertArray(data) {
        if (!data && !Array.isArray(this._data)) {
            const e = new Error(`Using convertArray() requires that the input is also an array and it is of type ${typeof this
                ._data}`);
            e.name = "TypedMapper::InvalidFormat";
            throw e;
        }
        return this.convert(data);
    }
    convertObject(data) {
        if (!data && Array.isArray(this._data)) {
            const e = new Error(`Using convertObject() requires that the input is an object and it is of type ${typeof this
                ._data}`);
            e.name = "TypedMapper::InvalidFormat";
            throw e;
        }
        return this.convert(data);
    }
    _convertObject(data, arr = []) {
        const output = {};
        const keys = Object.keys(this._map);
        for (const key of keys) {
            const prop = this._map[key];
            output[key] = typeof prop === "function" ? prop(data, arr) : data[prop];
        }
        if (this._passthrough) {
            const pkeys = Array.isArray(this._passthrough)
                ? this._passthrough
                : Object.keys(data);
            for (const key of pkeys) {
                output[key] = data[key];
            }
        }
        if (Array.isArray(this._exclude)) {
            const exclude = new Set(this._exclude);
            const ekeys = Object.keys(data).filter(e => !exclude.has(e));
            for (const key of ekeys) {
                output[key] = data[key];
            }
        }
        return output;
    }
    _convertArray(data) {
        const output = [];
        for (const datum of data) {
            output.push(this._convertObject(datum));
        }
        return output;
    }
    aggregate(config) {
        if (this._map) {
            const e = new Error('A TypedMapper object should NOT have a "map" and "aggregate" configuration and this object already has a "map" configuration!');
            e.name = "TypedMapper::NotAllowed";
            throw e;
        }
        this._aggregate = config;
        return this;
    }
}
exports.default = TypedMapper;
//# sourceMappingURL=index.js.map