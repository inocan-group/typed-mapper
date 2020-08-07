export type IFunctionalMapping<I, O> = (input?: I, set?: I[]) => O;
export type IStaticMapping<I> = keyof I;
export type IMapperConfiguration<I, O> = {
  [K in keyof O]: (keyof I & O[K]) | IFunctionalMapping<I, O[K]>;
};

export type IPassthroughConfig<I, O> = Array<keyof O> | true | false;
export type IExcludeConfig<I, O> = Array<keyof O> | false;
