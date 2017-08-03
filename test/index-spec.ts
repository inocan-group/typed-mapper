import TypedMapper, { IMapConfig } from '../src/index';
import * as chai from "chai";

const expect = chai.expect;

describe("Can Instantiate", () => {
  it("empty constructor", () => {
    const mapper = new TypedMapper();
    expect(mapper).to.be.an('object');
    expect(mapper.map).to.be.a('function');
    expect(mapper.inputData).to.be.a('function');
    expect(mapper.mappingConfig).to.be.a('function');
  });

  it("constructor with data", () => {
    const data = {
      foo: 'bar'
    };
    const mapper = new TypedMapper(data);
    expect(mapper).to.be.an('object');
    expect(mapper.map).to.be.a('function');
    expect(mapper.inputData).to.be.a('function');
    expect(mapper.mappingConfig).to.be.a('function');
  });

  it("constructor with data and config", () => {
    const data = {
      foo: 'bar'
    };
    const config = {
      process: {
        foo: () => 'baz'
      }
    }
    const mapper = new TypedMapper(data, config);
    expect(mapper).to.be.an('object');
    expect(mapper.map).to.be.a('function');
    expect(mapper.inputData).to.be.a('function');
    expect(mapper.mappingConfig).to.be.a('function');
  });

});

describe('Mapping works', () => {

  it('dasherize props works', () => {
    const config = {
      dasherize: ['fooBar', 'BaxBaz', 'bat_shit_crazy']
    };
    const data = {
      "fooBar": "hello world",
      "BaxBaz": "hello world 2",
      "bat_shit_crazy": "hello world 3",
    };
    const mapped = new TypedMapper(data, config).map();
    
    expect(mapped['foo-bar']).to.equal('hello world'); 
    expect(mapped['bax-baz']).to.equal('hello world 2');
    expect(mapped['bat-shit-crazy']).to.equal('hello world 3');

    const arrayData = [
      { "fooBar": "hello world" },
      { "fooBar": "hello world" , "BaxBaz": "hello world 2" },
      { "fooBar": "hello world",  "bat_shit_crazy": "hello world 3"}
    ];

    const arrayMapped = new TypedMapper(arrayData, config).map();
    expect(arrayMapped[0]['foo-bar']).to.equal('hello world'); 
    expect(arrayMapped[1]['foo-bar']).to.equal('hello world'); 
    expect(arrayMapped[2]['foo-bar']).to.equal('hello world'); 
    expect(arrayMapped[1]['bax-baz']).to.equal('hello world 2');
    expect(arrayMapped[2]['bat-shit-crazy']).to.equal('hello world 3');   
  });

  it('camelize props works', () => {
    const config = {
      camelize: ['foo-bar', 'bax.baz', 'bat_shit_crazy']
    };
    const data = {
      "foo-bar": "hello world",
      "bax.baz": "hello world 2",
      "bat_shit_crazy": "hello world 3",
    };
    const mapped = new TypedMapper(data, config).map();
    
    expect(mapped.fooBar).to.equal('hello world'); 
    expect(mapped.baxBaz).to.equal('hello world 2');
    expect(mapped.batShitCrazy).to.equal('hello world 3');

    const arrayData = [
      { "foo-bar": "hello world" },
      { "foo-bar": "hello world" , "bax.baz": "hello world 2" },
      { "foo-bar": "hello world",  "bat_shit_crazy": "hello world 3"}
    ];

    const arrayMapped = new TypedMapper(arrayData, config).map();
    expect(arrayMapped[0].fooBar).to.equal('hello world'); 
    expect(arrayMapped[1].fooBar).to.equal('hello world'); 
    expect(arrayMapped[2].fooBar).to.equal('hello world'); 
    expect(arrayMapped[1].baxBaz).to.equal('hello world 2');
    expect(arrayMapped[2].batShitCrazy).to.equal('hello world 3');
  });

  it('pascalize props works', () => {
    const config = {
      pascalize: ['foo-bar', 'bax.baz', 'bat_shit_crazy']
    };
    const data = {
      "foo-bar": "hello world",
      "bax.baz": "hello world 2",
      "bat_shit_crazy": "hello world 3",
    };
    const mapped = new TypedMapper(data, config).map();
    
    expect(mapped.FooBar).to.equal('hello world'); 
    expect(mapped.BaxBaz).to.equal('hello world 2');
    expect(mapped.BatShitCrazy).to.equal('hello world 3');

    const arrayData = [
      { "foo-bar": "hello world" },
      { "foo-bar": "hello world" , "bax.baz": "hello world 2" },
      { "foo-bar": "hello world",  "bat_shit_crazy": "hello world 3"}
    ];

    const arrayMapped = new TypedMapper(arrayData, config).map();
    expect(arrayMapped[0].FooBar).to.equal('hello world'); 
    expect(arrayMapped[1].FooBar).to.equal('hello world'); 
    expect(arrayMapped[2].FooBar).to.equal('hello world'); 
    expect(arrayMapped[1].BaxBaz).to.equal('hello world 2');
    expect(arrayMapped[2].BatShitCrazy).to.equal('hello world 3');
  });
  
  it('callbacks generate output data even when source property exists', () => {
    const config = {
      pascalize: ['foo-bar'],
      process: {
        foo: (props, defaultValue) => {
          return props.FooBar + 's';
        },
        bar: (props, defaultValue) => {
          return props.baz;
        }
      }
    };
    const data = {
      "foo-bar": "hello world",
      baz: 'hello baz'
    };
    const mapped = new TypedMapper(data, config).map();
    expect(mapped.foo).to.equal('hello worlds');
    expect(mapped.bar).to.equal('hello baz');
  });

  it('passthrough\'s work with and without defaults', () => {
    const config = {
      passThroughs: ['foo', 'bar', 'baz'],
      defaults: {
        foo: 12345
      }
    };
    const data = {
      bar: 'hello world'
    };
    interface IFooBarBaz {
      foo: number;
      bar: string; 
      baz: string;
    }
    const mapped = new TypedMapper<IFooBarBaz>(data, config).map();
    expect(mapped.foo).to.equal(12345);
    expect(mapped.bar).to.equal('hello world');
    expect(Object.keys(mapped)).to.include('baz');
    expect(mapped.baz).to.equal(undefined);
  });
});
  
