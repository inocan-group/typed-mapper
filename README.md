# Typed Mapper

> transform from one data structure to another with the benefit of Typescript's typing

## Install

```sh
npm install typed-mapper
# or
yarn install typed-mapper
```

## Usage

### Basics

If you have a type `A` and want to map it to type `B`; you would do something like:

```typescript
export interface A {
  firstName: string;
  lastName: string;
  nick: string;
}

export interface B {
  fullName: string;
  nickname: string;
  country: string;
}

const data = {
  firstName: "Bob",
  lastName: "Marley",
  nick: "papa wailer"
};

const converted = TypedMapper.map<A, B>({
  fullName: i => `${i.firstName} ${i.lastName}`,
  nickname: "nick",
  country: () => "usa"
}).convertObject(data);
```

What we see here are the use of two methods:

1. `map()` - allows us to state the output structure and how it _maps_ data from the input
2. `convertObject()` - applies the mapping to the supplied data

We also see _mapping_ allowing us two distinct types of transformations:

- **Name Mapping**: by stating an output properties value as a string you are telling it
- **Function Mapping**: a value of a function in a mapper allows us to use programatic operation and in the example of `fullName` above we're taking advantage of the function being passed the input object to work off of. Of course if we just want to set a static value or don't need the input then we can just ignore the parameter passed in (see `country` as example of this).

And of course with a library called "**Typed**Mapper" you will not be surprised to hear that this library is fully _typed_ and will ensure that both your input and output data structures are typed correctly.

### List Processing

The example above is very useful but often it would be even more useful if you could apply the same transformation rules to an array of data. This is easily done with nearly the same syntax:

```typescript
const data: A[] = [{...},{...}];
const converted = TypedMapper.map<A, B>({
  fullName: i => `${i.firstName} ${i.lastName}`,
  nickname: "nick",
  country: () => "usa"
}).convertArray(data);
```

As you can see, so long as you pass in an array of data, **TypedMapper** will pass back an array of mapped data. We do change the call of `convertObject` to `convertArray` to ensure the type system is completely happy but otherwise precisely the same.

Once you start dealing with lists, however, there are cases where your "function mappers" will want more context than _just_ the current record being converted but rather have access to the full array of inputs to build it's logic off. Here's a silly example:

```typescript
const data: A[] = [{...},{...}];
const converted = TypedMapper.map<A, B>({
  fullName: i => `${i.firstName} ${i.lastName}`,
  firstNameBuddies: (i, list) => list.filter(l = l.firstName === i.firstName).length,
  nickname: "nick",
  country: () => "usa"
}).convertArray(data);
```

### Passthroughs

Another mapping pattern that is supported is the idea of "passthroughs". This term refers to the desire to pass input values directly through to output values. Here are some examples of how you might use this:

```typescript
// pass ALL properties from A to B
const mapper = TypedMapper.passthrough<A, B>(true);
// pass specific properties from A to B
const mapper = TypedMapper.passthrough<A, B>(["foo", "bar"]);
// pass ALL properties from A to B, except those stated
const mapper = TypedMapper.exclude<A, B>(["foo", "bar"]);
```

This would, for each user, give a numeric count of how many other users share the same first name. Not super useful but hopefully you can think of better examples for your data.

> Note: that this too will check your typing and reject invalid conversions at design time but there are some limits to the completeness of the check which I believe are true limitations of TypeScript atm. One suggestion, if you have a passthrough the changing the output type O to Partial<O> is likely going to be what you want.

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
const outputData = TypedMapper<IInput, IOutput>
  .input(inputData)
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
const outputData = TypedMapper<IInput, IOutput>
  .input(input).passthrough(false).map( ... ).convert();
```

Alternatively you can state a few property names which you will NOT being explicitly mapping but you would like to have passed through:

```typescript
const outputData = TypedMapper<IInput, IOutput>
  .input(input)
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
