import { IDictionary } from 'common-types';

export type MapCallback = (props: IDictionary, defaultValue: any) => any;

export interface IMapConfig {
  /** an array of properties which need to be camelized for output data structure */
  camelize?: string[];
  /** an array of properties which need to be dasherized for output data structure */
  dasherize?: string[];
  /** an array of properties which need to be pascalized for output data structure */
  pascalize?: string[];
  /** a hash of properties which use a callback to shape the output */
  process?: IDictionary<MapCallback>;
  /** a hash of properties which have a default value if nothing is provided in input data structure */
  defaults?: IDictionary;
  /** specify a list of properties to block mapping to output */
  blacklist?: string[];
  /** specify a list of properties to always map to output; if used then non-explicitly referenced properties will be not be moved over to output structure */
  whitelist?: string[];
}

export default class TypedMapper<T = any> {
  private _inputData: IDictionary | IDictionary[];
  private _config: IMapConfig;

  constructor(inputData?: IDictionary, mappingConfig?: IMapConfig) {
    if (inputData) {
      this.inputData(inputData);
    }
    if (mappingConfig) {
      this.mappingConfig(mappingConfig);
    }
  }

  public inputData(data: IDictionary) {
    this._inputData = data;
  }

  public mappingConfig(config: IMapConfig) {
    this._config = config;
  }

  public map(): T | T[] {
    if (!this._inputData) {
      throw new Error('The input data was not set before parsing!');
    }
    if (!this._config) {
      throw new Error('The mapping configuration was not set before parsing!');
    }

    return Array.isArray(this._inputData)
      ? this._inputData.map((item: T) => this.convert(item))
      : this.convert(this._inputData);
  }

  private convert(data: IDictionary): T {
    const output: Partial<T> | T = {};
    Object.keys(data).map(key => {
      // PascalCase
      if (
        this._config.pascalize &&
        this._config.pascalize.indexOf(key) !== -1
      ) {
        output[this.pascalize(key) as keyof T] = data[key];
      }
      // camelCase
      if (
        this._config.camelize && 
        this._config.camelize.indexOf(key) !== -1
      ) {
        output[this.camelize(key) as keyof T] = data[key];
      }
      // dash-erize
      if (
        this._config.dasherize &&
        this._config.dasherize.indexOf(key) !== -1
      ) {
        output[this.dasherize(key) as keyof T] = data[key];
      }      
    });

    // Process Callbacks
    const keys = this._config.process
      ? Object.keys(this._config.process)
      : [];
    const props = { ...data, ...output as IDictionary };
    keys.forEach((key: keyof T) => {
      const defaultValue = this._config.defaults ? this._config.defaults[key] : undefined;
      output[key] = this._config.process[key](props, defaultValue);
    });

    return output as T;
  }

  private dasherize(name: string): string {
    return name
      .split(/[_\s\.]/g)
      .map(val => {
        return (
          val.charAt(0).toLowerCase() +
          val.substr(1).replace(/([A-Z])/gm, '-$1').toLowerCase()
        );
      })
      .join('-');
  }

  private camelize(name: string): string {
    return name.split(/[_\s-\.]/gm).reduce((agg, val) => {
      return agg !== ''
        ? agg + val.charAt(0).toUpperCase() + val.substr(1)
        : val.charAt(0).toLowerCase() + val.substr(1);
    }, '');
  }

  private pascalize(name: string): string {
    return name.split(/[_\s-\.]/gm).reduce((agg, val) => {
      return agg + val.charAt(0).toUpperCase() + val.substr(1);
    }, '');
  }
}
