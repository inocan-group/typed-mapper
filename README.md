# Typed Mapper

> transform from one data structure to another with the benefit of Typescript's typing

## Usage

The most basic usage is:

```typescript
const inputData: IAbc = { /** */ };
const outputData: IXyz = TypedMapper<IAbc, IXyz>.convert(inputData);
```

This will attempt to move data from the `IAbc` interface to the `IXyz` interface. In the case where `IXyz` is a subset of `IAbc` then this will work "as is" but in most cases there will need to some data mapping logic.

### Global Naming Convention Changes

Sometimes all that's needed to move from interface A to B is to change the property names from one standard naming convention to another (e.g., `camelCase` to `kabab-case` or `snake_case`, etc.). This is very simple so let's take a look at a quick example:

```typescript
interface IInput {
  full_name: string;
  user_age: number;
}
interface IOutput {
  fullName: string;
  userAge: number;
}
const inputData: IInput = { full_name: "Bob", user_age: 25 };
const outputData = TypedMapper.create(IInput, IOutput)
  .inputData(inputData)
  .camelize()
  .convert();
```

In this case we've taken the input structure's properties and converted them all to `camelCase`. The other naming conventions supported in this global manner are:

- `dasherize` (e.g., "foo-bar")
- `pascalize` (e.g., "FooBar")
- `snakize` (e.g., "foo_bar") yuck, that's a bit ugly on the naming side ... oh well

> Note: in Javascript its typically not a great idea to use `dasherize` as the properties are harder to access.

### Passthroughs

By default if you state nothing then all properties will be moved across from input to output. If you'd prefer only explicit mapping to be passed over you can achieve this with:

```typescript
const outputData = TypedMapper.create<IInput, IOutput>(input).passthrough(false).map( ... ).convert();
```

Alternatively you can state a few property names which you will NOT being explicitly mapping but you would like to have passed through:

```typescript
const outputData = TypedMapper.create<IInput, IOutput>(input)
  .passthrough('foo', 'bar')
  .map( ... )
  .convert();
```

So in the above example the "output" would have whichever explicit properties were mapped as well as the `foo` and `bar` properties passed through (other props will _not_ pass through).

### Property by Property Mapping

The most important feature of this library is to allow users of the library to do mappings triggered off the output's property names. So, for instance, imagine that our output interface is:

```typescript
interface IOutput {
  fullName: string;
  userAge: number;
}
```

and the incoming input was:

```js
{
  name: {
    first: "Bob",
    last: "Marley"
  },
  age: 68
}
```

Mapping would allow you to do the following:

```ts
const outputData = TypedMapper<any, IOutput>
  .input(inputData)
  .map({
    fullName: (i) => i.name.first + " " + i.name.last,
    userAge: 'age'
  })
  .convert();
```

Two things are happening in this example:

1. `fullName` is defined as a function and is passed the inputs property values so that it can construct a value from multiple attributes.
2. `userAge` is a straight property to property mapping but not one which fits the "naming conventions" rules stated above.

These two styles can go a **long** way toward your mapping needs but in the next few sections you'll see a bit more that is possible.

## Mapping Arrays

Up to now we've mapped one dictionary type to another but often rather than a single mapping you want to map an array of interface A to an array of interface B. Well that's quite simple:

```ts
const outputData = TypedMapper<any, IOutput>
  .inputAsArray(inputData)
  .map({
    fullName: (i) => i.name.first + " " + i.name.last,
    userAge: 'age'
  })
  .convert();
```

It's exactly the same as the prior code snippet but instead of using `input` we are using `inputAsArray`. That's all that's needed. Or is it? For most cases it problem _is_ but there are more advanced mapping use cases which need more.

### Aggregates

It is not uncommon to have your inputs _aggregated_ into a property on the output. This can be achieved with the following:

```ts
const outputData = TypedMapper<any, IOutput>
  .aggregate(inputData)
  .map({
    averageAge: (set) => set.reduce( ... ) / set.length),
    peopleCount: (set) => set.length,
    /** ... */
  })
  .convert();
```

It's important to note that when using `aggregate()` we expect an input array and the output will be a single record (aka, Many → One). Some people will note that this approach isn't bringing a lot more than what you could do with plain old Java/Typescript and you'd be right but it's meant as a simple extention to the mapping API that tends to a pretty standard use case.

All is not lost though for the "I want more" crowd. There are many standard aggregations that you can do outside the box, like so:

```ts
const outputData = TypedMapper<any, IOutput>
  .aggregate(inputData)
  .map({
    averageAge: 'Average:age',
    peopleCount: 'Count:id',
    manDays: 'Sum:days',
    names: 'Unique:name',
    /** ... */
  })
  .convert();
```

This you to quickly state the types of aggregations you'd like using built-in formulas. The syntax is always: `[Function]:[property]` and the functions supported are:

- **Numeric**: Average, Count, Sum, Mean, StdDev
- **String**: Unique
- **Boolean**: Every, None

Ok so that's nice, right? We're not done yet though. Want to group by something? No problem. How about a distribution? Also easy. Filters? Sure why not.

```ts
import { TypedMapper, GroupBy, Distribute, Filter } from 'TypedMapper';
const fn = (i) => i.active === true;
const outputData = TypedMapper<IInput, IAggregate>
  .aggregate(inputData)
  .map({
    ageDistribution: Distribute('Count:age', [0, 30, 50, 80]),
    peopleCount: GroupBy(Filter('Count:id', fn), 'gender'),
  })
  .convert();
```

### Cross Record Mapping

Beyond just aggregation, it is sometimes useful in a normal mapping (aka, Many → Many) to be able to allow mapping functions to see not only the current record but the whole record set. This is possible wherever you are inputting an array with `inputAsArray`:

```ts
const outputData = TypedMapper<any, IOutput>
  .inputAsArray(inputData)
  .map({
    estimate: 'personDays',
    estOfTotal: (i, sum) => i.personDays / sum.reduce( ... )
  })
  .convert();
```
