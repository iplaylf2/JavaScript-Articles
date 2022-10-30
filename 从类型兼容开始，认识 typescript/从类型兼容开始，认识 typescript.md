## 向下兼容

类型兼容体现在 typescript 使用过程中的方方面面。如：

- 赋值语句中的向下兼容。

```typescript
const foo: "some value" = "some value";
const bar: string = foo;
```

- 函数传参时的向下兼容

```typescript
declare function log(x: string): void;

const foo: "some value" = "some value";
log(foo);
```

- 函数返回时的向下兼容。

```typescript
function mysteryBox(): string {
  const foo: "some value" = "some value";
  return foo;
}
```

而这些不同的形式，其实都是类型兼容在**赋值**行为上的表现，他要求发起赋值对象的类型，必须向下兼容被赋值对象的类型。

在我看来，如果 B 在代码中出现的地方，都能用 A 去代替而不会编译出错，那么 A 就是向下兼容 B 。至于更准确的描述，请阅读官方文档[Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)。

## 集合的角度

有一个角度能很好地理解类型的向下兼容，就是把类型视作是一个个集合。当 A 类型是 B 类型的子集时，就是 A 向下兼容 B 。

![img](./1-x.svg)

- "some value" 向下兼容 string
- "some value" 向下兼容 "some value"
- string 向下兼容 string

从集合角度出发也有助于理解[联合类型（|）](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)和[交叉类型（&）](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)，以及泛型使用中出现的 extends 和 infer 关键字。

本文后续将围绕着集合进行展开，可是为什么本文不叫从集合开始？有的概念，其实用集合会太过抽象，反而不好理解。如协变和逆变。

~~其实是标题有集合会比较劝退~~

## 类型断言 as

不知道在阅读的你是否有留意过 as 的报错，里面提到过“两种类型不能充分重叠……”

```typescript
// Conversion of type 'number' to type 'string' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.(2352)
// 类型 "number" 到类型 "string" 的转换可能是错误的，因为两种类型不能充分重叠。如果这是有意的，请先将表达式转换为 "unknown"。ts(2352)
233 as string;
```

如果把“充分重叠”这个词放在类型是集合的上下文中，那么就能更容易理解前面报错的含义了。

我们不妨这么认为，当集合 B 是集合 A 的子集时，集合 B 的元素选取范围就与集合 A 的元素选取范围“充分重叠”。

### unknown

![img](./2-x.svg)

从[文档](https://www.typescriptlang.org/docs/handbook/type-compatibility.html#any-unknown-object-void-undefined-null-and-never-assignability)可知，所有类型都能分配给 unknown 。我们可以将 unknown 视作所有类型的超集/父集。

又因为集合 number 和集合 string 都分别是集合 unknown 的子集，所以可以通过 unknown 来完成一次有意的转换。

```typescript
// 编译器没有报错
233 as unknown as string;
```

这似乎就能解释 `as unknown` 能发挥作用的原因。



### number & string

number 和 string 交集的部分，对于他们来说也是各自的“充分重叠”