## 类型兼容

在 TypeScript 编程中，类型兼容是最基础的一道检查机制，一旦代码中出现类型不兼容的表达式，编译就会失败。

- 赋值表达式中，右值输出到左值需要类型兼容。如下：
```typescript
const foo: 233 = 233;
const bar: number = foo;
```

- 函数调用表达式中，实参输出到形参需要类型兼容。如下：
```typescript
declare function log(x: number /*形参*/): void;

const foo: 233 = 233;
log(foo /*实参*/);
```

- 函数表达式中，输出的返回值类型需要兼容函数返回类型。如下：
```typescript
function mysteryBox(): number {
  const foo: 233 = 233;
  return foo;
}
```

### 向下兼容 
**TypeScript 的类型兼容总是向下兼容的。**

得到输入的 A 总是要求输出的 B 拥有 A 类型的一切特性，以致于 A 能表现出的特性在实际使用中不会缺失，从而保证程序正确。

## 集合的角度

从集合的角度出发能让我们更好地理解向下兼容。

当我们把类型 T 视为集合 S 时，S 由全部的满足 T 一切特性的元素组成，S 的每一个元素都满足 T ，S 的每一个子集都满足 T 。
- 此时，将 S 的任一子集视为新的类型 T1 。T1 拥有 T 的一切特性，T1 向下兼容 T 。
- 同样的，将能够向下兼容 T 的任一类型视为新的集合 S1 。S1 满足 T ，S1 包含于 S ，S1 是 S 的子集。

由此可得，**子类型向下兼容超类型如同子集包含于超集**。

### 维恩图

我们可以用表示集合关系的维恩图，表达类型间的兼容关系。如前文出现的 `233` 类型和 `number` 类型：
![img](./1-x.svg)
- `233` 向下兼容 `number` 。
- `233` 是 `number` 的子类型，`233` 是 `number` 的子集。
- `number` 是 `233` 的超类型，`number` 是 `233` 的超集。

### 认识 `as` 、`extends` 、`infer`

本文将从类型兼容的角度，辅以集合的概念，重新认识 `as` 、`extends` 、`infer` 等 TypeScript 符号。

## 类型断言 as

不知道在阅读的你是否有留意过 `as` 的报错，里面提到过“两种类型不能充分重叠……”如下：
```typescript
// Conversion of type 'number' to type 'string' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.(2352)
// 类型 "number" 到类型 "string" 的转换可能是错误的，因为两种类型不能充分重叠。如果这是有意的，请先将表达式转换为 "unknown"。ts(2352)
233 as string;
```

### 充分重叠

如果把“充分重叠”这个词放在类型是集合的上下文中，那么就能更容易理解这些报错的含义了。

我们不妨这么认为，当集合 B 是集合 A 的子集时，集合 B 的元素选取范围就与集合 A 的元素选取范围“充分重叠”。*（如同上文维恩图所示。）*

不充分重叠的时候，意味着 A 包含有不属于 B 的元素，B 也包含有不属于 A 的元素。

显然，在我们的编程经验中， `number` 和 `string` 不是充分重叠的。这是导致 `233 as string` 报错的直接原因。

### unknown

同时，上文的报错提示我们，“如果这是有意的，请先将表达式转换为 "unknown"。”
```typescript
233 as unknown as string; // 编译通过
```

为什么 `as unknown` 可以发挥作用？我们可以先分析一下 `unknown` 类型。

从[文档](https://www.typescriptlang.org/docs/handbook/type-compatibility.html#any-unknown-object-void-undefined-null-and-never-assignability)可知，所有类型都能分配给 `unknown` 。这等同于所有类型都能向下兼容 `unknown` 。

因为所有类型都向下兼容 `unknown` ，**`unknown` 是所有类型的超类型！** （也是超集。）

已知，`number` 是 `unknown` 的子集，与 `unknown` 充分重叠；`string` 是 `unknown` 的子集，与 `unknown` 充分重叠。

上文的报错侧面告诉我们，**只要是充分重叠的两个类型，就能使用 `as` 完成转换。** 因此，将 `233 as unknown as string` 分成两步判断，`233 as unknown` 和 `unknown as string` 都是合法的，可以通过编译的。

如果用维恩图表示 `number` ，`string` 和 `unknown` 之间的关系，则是这样的：
![img](./2-x.svg)
- `number` 和 `string` 没有包含关系，不能充分重叠，。
- `number` 是 `unknown` 的子集，与 `unknown` 充分重叠。
- `string` 是 `unknown` 的子集，与 `unknown` 充分重叠。

### number | string

如果将 `number` 和 `string` 的合集视为一个类型，该类型也能与 `number` 或 `string` 充分重叠。那么，该类型能否代替 `233 as unknown as string` 中的 `unknown` 发挥作用？在此之前，如何构造出这个类型呢？

TypeScript 提供了[联合类型](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)的运算符 `|` 。从语义上看，这个运算符似乎可以联合两个类型，得到他们的合集。

我们不妨用 `|` 做一次实验：
```typescript
type Chimera = number | string;

233 as Chimera as string; // 无报错

const foo: Chimera = 233; // 无报错
const bar: Chimera = "hello"; // 无报错

declare const baz: Chimera;
const qux: number = baz; // 不能向下兼容，报错了
const zoo: string = baz; // 不能向下兼容，报错了
```
- `Chimera` 代替 `233 as unknown as string` 中的 `unknown` 发挥作用了。
- `Chimera` 如同 `number` 和 `string` 共同的超类型，被 `number` 或 `string` 向下兼容，发挥着超类型的作用。
- 而 `Chimera` 不能向下兼容 `number` 或 `string` 。`number` 和 `string` 都是 `Chimera` 的真子集，`number` 或 `string` 与 `Chimera` 不相等。

由此可得 ~~（cai）~~ ，**`|` 运算符可以联合两个类型，得到他们的合集。** 同时也是他们的共同超类型。而且，在 `as` 表达式中，只要一边是超类型就能使其合法。

### number & string

同样的，如果将 `number` 和 `string` 的交集视为一个类型，该类型也能与 `number` 或 `string` 充分重叠。那么，该类型能否代替 `233 as unknown as string` 中的 `unknown` 发挥作用？在此之前，如何构造出这个类型呢？

TypeScript 提供了[交叉类型](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)的运算符 `&` 。从语义上看，这个运算符似乎可以交叉两个类型，得到他们的交集。

我们不妨用 `&` 做一次实验：
```typescript
type Chimera = number & string;

233 as Chimera as string; // 无报错

const foo: Chimera = 233; // 不能向下兼容，报错了
const bar: Chimera = "hello"; // 不能向下兼容，报错了

declare const baz: Chimera;
const qux: number = baz; // 无报错
const zoo: string = baz; // 无报错
```
- `Chimera` 代替 `233 as unknown as string` 中的 `unknown` 发挥作用了。
- `number` 和 `string` 都不能向下兼容 `Chimera` 。
- 而 `Chimera` 如同 `number` 和 `string` 共同的子类型，可以向下兼容 `number` 或 `string` ，发挥着子类型的作用。

由此可得，**`&` 运算符可以交叉两个类型，得到他们的交集。** 同时也是他们的共同子类型。而且，在 `as` 表达式中，只要一边是子类型就能使其合法。

### as 的成立条件

类型断言（ `as` ）的[文档](https://www.typescriptlang.org/zh/docs/handbook/2/everyday-types.html#type-assertions)有那么一句话：

> TypeScript only allows type assertions which convert to a more specific or less specific version of a type.

其中，**more specific** 和 **less specific** ，字面意思是更具体和更不具体，也许可以用大家更熟悉的词汇代替，**更具体**和**更抽象**。

如此之后，引用的句子可以翻译为：

> 类型断言只能把类型转换成更具体或更抽象的版本。

结合我们的编程经验，我们不妨认为，*类型更具体的版本* 和他的子集是等价的，*类型更抽象的版本* 和他的超集是等价的。

由此可得，`as` 运算符两边的类型，只有在它们存在集合间的包含关系才能够成立。

