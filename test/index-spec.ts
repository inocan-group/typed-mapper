import TypedMapper, { IMapConfig } from "../src/index";
import * as chai from "chai";
import { datetime } from "common-types";

const expect = chai.expect;

export interface IPersonDetailed {
  firstName: string;
  lastName: string;
  nickName?: string;
  birthday?: datetime;
}

export interface IPersonSimple {
  name: string;
  nick?: string;
  age?: number;
}

export interface A {
  a: string;
  b: number;
  c: boolean;
}

export interface B {
  a: string;
  b: number;
  c?: boolean;
  d: string;
}

describe("Can Instantiate", () => {
  it("empty constructor", () => {
    const mapper = new TypedMapper();
    expect(mapper).to.be.an("object");
    expect(mapper.map).to.be.a("function");
    expect(mapper.input).to.be.a("function");
    expect(mapper.aggregate).to.be.a("function");
  });
});

describe("Mapping works", () => {
  it("Mapping config with just static property maps works on single object input", () => {
    const mapper = TypedMapper.map<IPersonDetailed, IPersonSimple>({
      name: "firstName"
    });
    expect(mapper.mapConfig).to.be.an("object");
    expect(mapper.mapConfig.name).to.equal("firstName");
    const output = mapper.convertObject({
      firstName: "Bob",
      lastName: "Marley"
    });
    expect(output).to.be.an("object");
    expect(output.name).to.equal("Bob");
  });

  it("Mapping config with dynamic map works on single object input", () => {
    const mapper = TypedMapper.map<IPersonDetailed, IPersonSimple>({
      name: i => `${i.firstName} ${i.lastName}`
    });
    expect(mapper.mapConfig).to.be.an("object");
    expect(mapper.mapConfig.name).to.be.a("function");
    const output = mapper.convertObject({
      firstName: "Bob",
      lastName: "Marley"
    });
    expect(output).to.be.an("object");
    expect(output.name).to.equal("Bob Marley");
  });

  it("Mapping on an array of inputs converts each element", () => {
    const mapper = TypedMapper.map<IPersonDetailed, IPersonSimple>({
      name: i => `${i.firstName} ${i.lastName}`,
      nick: 'nickName'
    });
    mapper.input([
      {
        firstName: "Bob",
        lastName: "Marley",
        nickName: "Papa Wailer"
      },
      {
        firstName: "Peter",
        lastName: "Tosh",
        nickName: "Angry Rasta"
      }
    ]);
    const output = mapper.convertArray();
    expect(output).to.be.an("array");
    expect(output).to.have.lengthOf(2);

    expect(output.map(i => i.name)).to.include("Bob Marley");
  });

  it('passthrough array with a simple map() works', async () => {
    const mapper = TypedMapper.passthrough<A,Partial<B>>(['a','b']).map({
      d: (i) => `${i.a} foobar`
    });
    const data = {
      a: 'hey',
      b: 12,
      c: false
    };
    const result = mapper.convertObject(data);

    expect(result.a).to.equal(data.a);
    expect(result.b).to.equal(data.b);
    expect(result.c).to.equal(undefined);
    expect(result.d).to.equal("hey foobar");
  });

  it('passthrough set as TRUE with a simple map() works', async () => {
    const mapper = TypedMapper.passthrough<A,Partial<B>>(true).map({
      d: (i) => `${i.a} foobar`
    });
    const data = {
      a: 'hey',
      b: 12,
      c: false
    };
    const result = mapper.convertObject(data);

    expect(result.a).to.equal(data.a);
    expect(result.b).to.equal(data.b);
    expect(result.c).to.equal(data.c);
    expect(result.d).to.equal("hey foobar");
  });

  it('exclude array with a simple map() works', async () => {
    const mapper = TypedMapper.exclude<A,Partial<B>>(['b']).map({
      d: (i) => `${i.a} foobar`
    });
    const data = {
      a: 'hey',
      b: 12,
      c: false
    };
    const result = mapper.convertObject(data);

    expect(result.a).to.equal(data.a);
    expect(result.b).to.equal(undefined);
    expect(result.c).to.equal(data.c);
    expect(result.d).to.equal("hey foobar");
  });


  // it.skip("dasherize props works", () => {
  //   const config = {
  //     dasherize: ["fooBar", "BaxBaz", "bat_shit_crazy"]
  //   };
  //   const data = {
  //     fooBar: "hello world",
  //     BaxBaz: "hello world 2",
  //     bat_shit_crazy: "hello world 3"
  //   };
  //   const mapped = new TypedMapper(data, config).map();

  //   expect(mapped["foo-bar"]).to.equal("hello world");
  //   expect(mapped["bax-baz"]).to.equal("hello world 2");
  //   expect(mapped["bat-shit-crazy"]).to.equal("hello world 3");

  //   const arrayData = [
  //     { fooBar: "hello world" },
  //     { fooBar: "hello world", BaxBaz: "hello world 2" },
  //     { fooBar: "hello world", bat_shit_crazy: "hello world 3" }
  //   ];

  //   const arrayMapped = new TypedMapper(arrayData, config).map();
  //   expect(arrayMapped[0]["foo-bar"]).to.equal("hello world");
  //   expect(arrayMapped[1]["foo-bar"]).to.equal("hello world");
  //   expect(arrayMapped[2]["foo-bar"]).to.equal("hello world");
  //   expect(arrayMapped[1]["bax-baz"]).to.equal("hello world 2");
  //   expect(arrayMapped[2]["bat-shit-crazy"]).to.equal("hello world 3");
  // });

  // it("camelize props works", () => {
  //   const config = {
  //     camelize: ["foo-bar", "bax.baz", "bat_shit_crazy"]
  //   };
  //   const data = {
  //     "foo-bar": "hello world",
  //     "bax.baz": "hello world 2",
  //     bat_shit_crazy: "hello world 3"
  //   };
  //   const mapped = new TypedMapper(data, config).map();

  //   expect(mapped.fooBar).to.equal("hello world");
  //   expect(mapped.baxBaz).to.equal("hello world 2");
  //   expect(mapped.batShitCrazy).to.equal("hello world 3");

  //   const arrayData = [
  //     { "foo-bar": "hello world" },
  //     { "foo-bar": "hello world", "bax.baz": "hello world 2" },
  //     { "foo-bar": "hello world", bat_shit_crazy: "hello world 3" }
  //   ];

  //   const arrayMapped = new TypedMapper(arrayData, config).map();
  //   expect(arrayMapped[0].fooBar).to.equal("hello world");
  //   expect(arrayMapped[1].fooBar).to.equal("hello world");
  //   expect(arrayMapped[2].fooBar).to.equal("hello world");
  //   expect(arrayMapped[1].baxBaz).to.equal("hello world 2");
  //   expect(arrayMapped[2].batShitCrazy).to.equal("hello world 3");
  // });

  // it("pascalize props works", () => {
  //   const config = {
  //     pascalize: ["foo-bar", "bax.baz", "bat_shit_crazy"]
  //   };
  //   const data = {
  //     "foo-bar": "hello world",
  //     "bax.baz": "hello world 2",
  //     bat_shit_crazy: "hello world 3"
  //   };
  //   const mapped = new TypedMapper(data, config).map();

  //   expect(mapped.FooBar).to.equal("hello world");
  //   expect(mapped.BaxBaz).to.equal("hello world 2");
  //   expect(mapped.BatShitCrazy).to.equal("hello world 3");

  //   const arrayData = [
  //     { "foo-bar": "hello world" },
  //     { "foo-bar": "hello world", "bax.baz": "hello world 2" },
  //     { "foo-bar": "hello world", bat_shit_crazy: "hello world 3" }
  //   ];

  //   const arrayMapped = new TypedMapper(arrayData, config).map();
  //   expect(arrayMapped[0].FooBar).to.equal("hello world");
  //   expect(arrayMapped[1].FooBar).to.equal("hello world");
  //   expect(arrayMapped[2].FooBar).to.equal("hello world");
  //   expect(arrayMapped[1].BaxBaz).to.equal("hello world 2");
  //   expect(arrayMapped[2].BatShitCrazy).to.equal("hello world 3");
  // });
});
