export declare type IFunctionalMapping<I, O> = (input?: I, set?: I[]) => O;
export declare type IStaticMapping<I> = keyof I;
export declare type IMapperConfiguration<I, O> = {
    [K in keyof O]: (keyof I & O[K]) | IFunctionalMapping<I, O[K]>;
};
export declare type IPassthroughConfig<I, O> = Array<keyof O> | true | false;
export declare type IExcludeConfig<I, O> = Array<keyof O> | false;
export default class TypedMapper<I = any, O = any> {
    private _map;
    private _aggregate;
    private _data;
    private _passthrough;
    private _exclude;
    static map<I = any, O = any>(config: IMapperConfiguration<I, O>): TypedMapper<I, O>;
    static passthrough<I = any, O = any>(config: IPassthroughConfig<I, O>): TypedMapper<I, O>;
    static exclude<I = any, O = any>(config: IExcludeConfig<I, O>): TypedMapper<I, O>;
    static aggregate<I = any, O = any>(config: IMapperConfiguration<I, O>): TypedMapper<I, O>;
    readonly mapConfig: IMapperConfiguration<I, O>;
    map(config: IMapperConfiguration<I, O>): this;
    passthrough(config: IPassthroughConfig<I, O>): this;
    exclude(config: IExcludeConfig<I, O>): this;
    input(data: I | I[]): this;
    readonly inputData: I | I[];
    convert(data?: I | I[]): O | O[];
    convertArray(data?: I[]): O[];
    convertObject(data?: I): O;
    private _convertObject;
    private _convertArray;
    aggregate(config: IMapperConfiguration<I, O>): this;
}
