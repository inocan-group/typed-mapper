import { IDictionary } from 'common-types';
export declare type MapCallback = (props: IDictionary, defaultValue: any) => any;
export interface IMapConfig {
    camelize?: string[];
    dasherize?: string[];
    pascalize?: string[];
    process?: IDictionary<MapCallback>;
    defaults?: IDictionary;
    passThroughs?: string[];
}
export default class TypedMapper<T = any> {
    private _inputData;
    private _config;
    constructor(inputData?: IDictionary, mappingConfig?: IMapConfig);
    inputData(data: IDictionary): void;
    mappingConfig(config: IMapConfig): void;
    map(): T | T[];
    private convert(data);
    private dasherize(name);
    private camelize(name);
    private pascalize(name);
}
