"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TypedMapper {
    constructor(inputData, mappingConfig) {
        if (inputData) {
            this.inputData(inputData);
        }
        if (mappingConfig) {
            this.mappingConfig(mappingConfig);
        }
    }
    inputData(data) {
        this._inputData = data;
    }
    mappingConfig(config) {
        this._config = config;
    }
    map() {
        if (!this._inputData) {
            throw new Error('The input data was not set before parsing!');
        }
        if (!this._config) {
            throw new Error('The mapping configuration was not set before parsing!');
        }
        return Array.isArray(this._inputData)
            ? this._inputData.map((item) => this.convert(item))
            : this.convert(this._inputData);
    }
    convert(data) {
        const output = {};
        Object.keys(data).map(key => {
            if (this._config.pascalize &&
                this._config.pascalize.indexOf(key) !== -1) {
                output[this.pascalize(key)] = data[key];
            }
            if (this._config.camelize &&
                this._config.camelize.indexOf(key) !== -1) {
                output[this.camelize(key)] = data[key];
            }
            if (this._config.dasherize &&
                this._config.dasherize.indexOf(key) !== -1) {
                output[this.dasherize(key)] = data[key];
            }
        });
        const keys = this._config.process
            ? Object.keys(this._config.process)
            : [];
        const props = Object.assign({}, data, output);
        keys.forEach((key) => {
            const defaultValue = this._config.defaults ? this._config.defaults[key] : undefined;
            output[key] = this._config.process[key](props, defaultValue);
        });
        const passThrough = this._config.passThroughs || [];
        passThrough.forEach((key) => {
            const defaultValue = this._config.defaults ? this._config.defaults[key] : undefined;
            output[key] = data[key] || defaultValue;
        });
        return output;
    }
    dasherize(name) {
        return name
            .split(/[_\s\.]/g)
            .map(val => {
            return (val.charAt(0).toLowerCase() +
                val.substr(1).replace(/([A-Z])/gm, '-$1').toLowerCase());
        })
            .join('-');
    }
    camelize(name) {
        return name.split(/[_\s-\.]/gm).reduce((agg, val) => {
            return agg !== ''
                ? agg + val.charAt(0).toUpperCase() + val.substr(1)
                : val.charAt(0).toLowerCase() + val.substr(1);
        }, '');
    }
    pascalize(name) {
        return name.split(/[_\s-\.]/gm).reduce((agg, val) => {
            return agg + val.charAt(0).toUpperCase() + val.substr(1);
        }, '');
    }
}
exports.default = TypedMapper;
//# sourceMappingURL=index.js.map