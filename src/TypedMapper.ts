import {
  IMapperConfiguration,
  IPassthroughConfig,
  IExcludeConfig,
  IFunctionalMapping,
} from "./index";

export class TypedMapper<I = any, O = any> {
  private _map?: IMapperConfiguration<I, O>;
  private _aggregate?: IMapperConfiguration<I, O>;
  private _data?: I | I[];
  private _passthrough: IPassthroughConfig<I, O> = false;
  private _exclude: IPassthroughConfig<I, O> = false;

  public static map<I = any, O = any>(config: IMapperConfiguration<I, O>) {
    const obj = new TypedMapper<I, O>();
    obj.map(config);
    return obj;
  }

  public static passthrough<I = any, O = any>(config: IPassthroughConfig<I, O>) {
    const obj = new TypedMapper<I, O>();
    obj.passthrough(config);
    return obj;
  }

  public static exclude<I = any, O = any>(config: IExcludeConfig<I, O>) {
    const obj = new TypedMapper<I, O>();
    obj.exclude(config);
    return obj;
  }

  public static aggregate<I = any, O = any>(config: IMapperConfiguration<I, O>) {
    const obj = new TypedMapper<I, O>();
    obj.aggregate(config);
    return obj;
  }

  public get mapConfig() {
    return this._map;
  }

  public map(config: IMapperConfiguration<I, O>) {
    this._map = config;
    return this;
  }

  public passthrough(config: IPassthroughConfig<I, O>) {
    if (this._exclude) {
      const e = new Error(
        `You can't set both passthroughs and exclusions and exclusions are already set!`
      );
      e.name = "TypedMapper::NotAllowed";
      throw e;
    }
    this._passthrough = config;
    return this;
  }

  public exclude(config: IExcludeConfig<I, O>) {
    if (this._passthrough) {
      const e = new Error(
        `You can't set both passthroughs and exclusions and passthroughs are already set!`
      );
      e.name = "TypedMapper::NotAllowed";
      throw e;
    }
    this._exclude = config;
    return this;
  }

  public input(data: I | I[]) {
    this._data = data;
    return this;
  }

  public get inputData() {
    return this._data;
  }

  /**
   * Converts the input data, using the mapping configuration,
   * into the output format.
   */
  public convert(data?: I | I[]) {
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

  public convertArray(data?: I[]) {
    if (!data && !Array.isArray(this._data)) {
      const e = new Error(
        `Using convertArray() requires that the input is also an array and it is of type ${typeof this
          ._data}`
      );
      e.name = "TypedMapper::InvalidFormat";
      throw e;
    }
    return this.convert(data) as O[];
  }

  public convertObject(data?: I) {
    if (!data && Array.isArray(this._data)) {
      const e = new Error(
        `Using convertObject() requires that the input is an object and it is of type ${typeof this
          ._data}`
      );
      e.name = "TypedMapper::InvalidFormat";
      throw e;
    }
    return this.convert(data) as O;
  }

  private _convertObject(data: I, arr: I[] = []): O {
    if (!this._map) {
      throw new Error(`Attempt convert an object failed because there was no Mapper defined yet!`);
    }
    const output: Partial<O> = {};
    const keys = Object.keys(this._map) as Array<keyof O>;
    for (const key of keys) {
      const prop: IFunctionalMapping<I, O[typeof key]> | keyof I = this._map[key];
      // cheating a bit on below typing but its pissing me off and runtime works fine
      (output as any)[key] = typeof prop === "function" ? prop(data as I, arr as I[]) : data[prop];
    }

    // passthroughs
    if (this._passthrough) {
      const pkeys = Array.isArray(this._passthrough) ? this._passthrough : Object.keys(data);

      for (const key of pkeys) {
        (output as any)[key] = (data as any)[key];
      }
    }
    // exclusions
    if (Array.isArray(this._exclude)) {
      const exclude = new Set(this._exclude);
      const ekeys = Object.keys(data).filter(e => !exclude.has(e as any));

      for (const key of ekeys) {
        (output as any)[key] = (data as any)[key];
      }
    }

    return output as O;
  }

  private _convertArray(data: I[]): O[] {
    const output: O[] = [];
    for (const datum of data) {
      output.push(this._convertObject(datum));
    }

    return output;
  }

  /**
   * Converts input data into an aggregate record
   */
  public aggregate(config: IMapperConfiguration<I, O>) {
    if (this._map) {
      const e = new Error(
        'A TypedMapper object should NOT have a "map" and "aggregate" configuration and this object already has a "map" configuration!'
      );
      e.name = "TypedMapper::NotAllowed";
      throw e;
    }

    this._aggregate = config;
    return this;
  }
}
