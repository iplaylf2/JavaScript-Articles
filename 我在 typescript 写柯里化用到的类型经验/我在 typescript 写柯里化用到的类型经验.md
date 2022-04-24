# 我在 typescript 写柯里化用到的类型经验

- [我写了个库，但本文重点不是它](#我写了个库但本文重点不是它)
- [只是一些朴实的技巧](#只是一些朴实的技巧)
- [说一下 any 、never 、unknown](#说一下-any-never-unknown)
  - [any](#any)
  - [never](#never)
  - [unknown](#unknown)
- [派生图谱](#派生图谱)
- [类型断言](#类型断言)
  - [有可能兼容的 as](#有可能兼容的-as)
  - [不可能兼容的 as](#不可能兼容的-as)
- [extends](#extends)
  - [泛型约束的 extends](#泛型约束的-extends)
  - [条件类型表达式约束的 extends](#条件类型表达式约束的-extends)
  - [一个类型派生于它本身](#一个类型派生于它本身)
- [infer](#infer)
  - [提取局部类型](#提取局部类型)
  - [提取整体类型](#提取整体类型)
  - [条件类型表达式一定是个三元表达式](#条件类型表达式一定是个三元表达式)
  - [条件类型不是类型](#条件类型不是类型)
- [元组与函数形参](#元组与函数形参)
  - [IsFixedTuple](#isfixedtuple)
  - [参数列表的小遗憾](#参数列表的小遗憾)
  - [IsOptionalTuple](#isoptionaltuple)
    - [infer 的使用和解构很似](#infer-的使用和解构很似)
    - [论兼容](#论兼容)
    - [回到 IsOptionalTuple](#回到-isoptionaltuple)
- [可以递归的条件类型](#可以递归的条件类型)
- [联合类型与条件类型](#联合类型与条件类型)
  - [特例 any](#特例-any)
  - [拒绝 distributive](#拒绝-distributive)
  - [如何判断一个类型是否为 any](#如何判断一个类型是否为-any)
    - [好用的派生图谱](#好用的派生图谱)
    - [回到 IsAny](#回到-isany)
  - [实参是 boolean 也会 distributive](#实参是-boolean-也会-distributive)
  - [实参是 never 不会 distributive ？](#实参是-never-不会-distributive-)
- [never 制造的麻烦](#never-制造的麻烦)

## 我写了个库，但本文重点不是它

我写了个库，[facade.ts](https://github.com/iplaylf2/facade.ts) ，可以把一个函数变成柯里化的函数。

``` typescript
$((x: string, n: number) => x.repeat(n))("Hello!")(3); 
// Hello!Hello!Hello!
```

就像 [ramda](https://github.com/ramda/ramda) 那样，但是本身是类型安全的，而要做到那样的效果需要在类型体操上花点精力。

我想分享一下这过程中总结的类型经验，顺便推广一下自己的库，这就是本文的来由。

## 只是一些朴实的技巧

其实我不太愿意用体操这个词，至少题目没用到。typescript 的类型操作很多都有文档出处，虽然也有特例，但常规操作的组合就能满足大部分需求。

这并不是奇技淫巧，本文将要介绍的只是一些朴实的技巧，并且会尽量链接相关知识的出处。

## 说一下 any 、never 、unknown

做体操会大量用到 [条件类型表达式（ Conditional Types ）](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) 的特性，和与之深深关联的 extends 关键字。

在这之前，有 3 个类型更需要先弄明白，any 、never 、unknown 。

### any

“遇事不决用 any ”，“ AnyScript ”，想必很多人都听说过。

[any](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any) 类型的变量，能赋值给所有类型的变量，也能接受所有类型的值。

``` typescript
let x: any = 233;
const foo: string = x;
x = false;
```

复用别的面向对象语言的经验，子类总是向上兼容基类。有人会以，“ any 是所有类型的基类也是所有类型的子类”，去方便理解 any 。

可是官方文档除了介绍 class 时，没有基类和子类这般说法，像“继承”用到的 extends 关键字也能翻译成“扩展”。

或许，我们可以借用 [Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)（ as 或 <> ）提到的**更具体的**和**更抽象的**去表达类型之间的关系。
> TypeScript only allows type assertions which convert to a more specific or less specific version of a type.

更具体的类型总是向上[兼容](https://www.typescriptlang.org/docs/handbook/type-compatibility.html#advanced-topics)它更抽象的版本。

那么，姑且在这定义 any 是所有类型的最具体和最抽象的版本。所以 any 类型的变量，能赋值给所有类型的变量，也能接受所有类型的值。

**啊不！！！any 有一个类型的变量不能去赋值，那就是 never ！**

```typescript
let x: any = 233;
const bar: never = x;
// 不能将类型“any”分配给类型“never”。ts(2322)
```

### never

[never](https://www.typescriptlang.org/docs/handbook/2/functions.html#never) 才是所有类型最具体的版本，包括 any 。

```typescript
declare const x: never;
const foo: string = x;
const bar: number = x;
const qux: any = x;
```

具体的类型能够兼容抽象的版本，所以在这个例子中，never 的 x 可以赋值给不同类型的变量。

虽然 never 的语义是不可到达，不可得到的类型，但它的确是上文所述的最具体的类型。而这种奇怪的属性，会在后面的类型操作中制造巨大的麻烦。

### unknown

与 never 相反，[unknown](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown) 是所有类型最抽象的版本，其他类型都是基于 unknown 更具体的版本。

好拗口，具体的类型派生于抽象的类型，这里直接沿用术语派生（ derive ）吧。所有类型都派生于 unknown 。以及 never 派生于所有类型。

```typescript
let x: unknown = 233;
x = false;
```

而在这个例子中，不同类型的值都能赋值给 unknown 的 x 。

**等等！两个最抽象的类型？any 和 unknown 都是最抽象的？**

``` typescript
const x: unknown = 233;
const foo: any = x;
const bar: unknown = foo;
```

为什么不能有两个“最”？再说了， any 都那么特殊了，再当次特例不奇怪。~~（摆烂。）~~

## 派生图谱

有了上面的认识，我们可以画一张 typescript 类型的派生图谱。

为了简化关系，这里把 any 作为 unknown 更抽象的版本，unknown 派生于 any。反正不会破坏 unknown 的性质。

```mermaid
flowchart LR
  any --> unknown

  any2[any]
  any2 --> never

  unknown --> boolean --> any2
  unknown --> number --> any2
  unknown --> string --> any2
  unknown --> object --> any2
  unknown --> rest[...] --> any2
```

箭头的方向就是派生的方向。

## 类型断言

类型断言也就是我们常用的 as ，有了派生图谱，就可以更容易地去理解它。

### 有可能兼容的 as

as 只能把一个值的类型转化成比它更具体或者更抽象的版本。

```typescript
const x: number = 233;
const foo = x as unknown; // 转化成更抽象的版本
const bar = x as never; // 转化成更具体的版本
```

从派生图谱上看，在同一条不折返的派生路径上的两个类型，可以通过 as 进行互相转化。

这条路径上的类型总是向上兼容的，as 的结果可能是兼容的，但不一定是正确的。我们可以看下面的例子。

```typescript
interface Animal {
  name: string;
}

// Cat 派生于 Animal
interface Cat extends Animal {
  climbTree(): void;
}

const azhu = { name: "azhu", climbTree(): void {} } as Animal; // 转化成更抽象的版本
azhu.climbTree(); // Animal 没有 climbTree 字段，编译不通过
const azhu_cat = azhu as Cat; // 转化成更具体的版本
azhu_cat.climbTree(); // 来自 azhu 的值有 climbTree 字段，兼容的类型不会直接导致运行出错

const foo: Animal = { name: "foo" };
const foo_cat = foo as Cat; // 转化成更具体的版本
foo_cat.climbTree(); // 来自 foo 的值没有 climbTree 字段，不兼容的类型直接导致了运行出错
```

一个抽象的类型的值，如果来自于它更具体的类型，才有可能在转化成更具体的版本时保持兼容。

### 不可能兼容的 as

如果是不可能兼容的类型之间使用 as ，则编译会报错。

```typescript
const x: number = 233;
const foo = x as string;
// 类型 "number" 到类型 "string" 的转换可能是错误的，因为两种类型不能充分重叠。如果这是有意的，请先将表达式转换为 "unknown"。ts(2352)
```

从派生图谱的角度来看，如果两个类型不在同一条不折返的派生路径上，他们之间就不存在派生关系，也就是不可能兼容的。

上述例子的报错信息，提示可以先把 number 转化成 unknown 。unknown 是大家共同的抽象类型，就能间接转化另一条路径上的类型。

```typescript
const x: number = 233;
const foo = x as unknown as string; // 编译能通过
```

## extends

有了上述概念的铺垫，我们回过头来看 extends 这个关键字。

extends 出现在 typescript 的 4 种场景之中。

- Class 的[继承](https://www.typescriptlang.org/docs/handbook/2/classes.html#extends-clauses)
- Object Types 的[派生](https://www.typescriptlang.org/docs/handbook/2/objects.html#extending-types)
- 泛型[约束](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- 条件类型表达式[约束](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

每种场景的 extends 作用不同，但它们具有相同的语义——派生。而且，extends 左边的元素总是更具体的类型，右边的元素总是更抽象的类型。

这里主要认识一下在*泛型约束*和*条件类型表达式约束*它们之中的 extends 。

### 泛型约束的 extends

如果你的项目中使用了 typescript-eslint ，那么用到 Function 类型时有可能会[报错](https://typescript-eslint.io/rules/ban-types/#default-options)。它给出了两个理由。

- Function 没有约束参数和返回值，它不是类型安全的。
- Function 也是构造函数的抽象类型，如果我们不用 new 去调用一个构造函数，会有不可预测的后果。

我们可以定义一个 BaseFunction 去表达一个普通的函数，而且它不是一个构造函数。

```typescript
type BaseFunction<Params extends unknown[], Return> = (
  ...args: Params
) => Return;
```

在这里，泛型参数列表中的 extends ，起到了泛型约束的作用。

`Params extends unknown[]` ，用前文的概念去解释就是，（更）具体的类型 Params **派生于**（更）抽象的类型 unknown[] 。

在接下来的上下文中，Params 是 unknown[] 的具体类型，它兼容 unknown[] ，具有 unknown[] 的一切特性。

作为代价，实际传入 Params 的参数需要接受类型的约束，它必须派生于 unknown[] 。

在[函数类型表达式](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions) `(...args: Params) => Return` 中，args 是一个 [rest 参数](https://www.typescriptlang.org/docs/handbook/2/functions.html#rest-parameters-and-arguments)，它的类型必须是数组。

而 args 的类型 Params ，是 unknown[] 的具体类型，因此满足了 rest 参数的条件。

再者，另一个泛型参数 Return 类型，它没有泛型约束，可以是任意类型，在类型表达式中也没有受到限制。

最终我们就得到了一个合法的 BaseFunction 类型。

```typescript
const repeat: BaseFunction<[string, number], string> = (a, b) => a.repeat(b); // 编译通过

class Foo {
  constructor(public name: string) {}
}

const new_foo: BaseFunction<[string], Foo> = Foo; // 编译不通过
```

如果要表达构造函数，需要使用[构造签名](https://www.typescriptlang.org/docs/handbook/2/functions.html#construct-signatures) `new (...args: Params) => Instance` ，这里就不赘述了。

### 条件类型表达式约束的 extends

有了 BaseFunction ，我们可以定义一个条件类型 IsBaseFunction ，用来判断一个类型是否普通的函数类型，-。

```typescript
type IsBaseFunction<T> = T extends BaseFunction<any, any> ? true : false;
```

在这里的 extends ，起到了条件类型表达式约束的作用。

`T extends BaseFunction<any, any>` 声明了一个约束，具体类型 T **派生于**抽象类型 BaseFunction\<any, any\> 。如果满足这个约束，就会采用第一个分支 `true` 的计算结果作为 IsBaseFunction\<T\> 的类型，否则采用第二个分支 `false` 的结果。

```typescript
type test1 = IsBaseFunction<{}>; // 类型 test1 为 false
type test2 = IsBaseFunction<() => void>; // 类型 test2 为 true
```

### 一个类型派生于它本身

还有一点需要补充一下，一个类型派生于它本身。我们可以用条件类型表达式来验证一下。

```typescript
type test1 = number extends number ? true : false; // 类型 test1 为 true
type test2 = { x: string } extends { x: string } ? true : false; // 类型 test2 为 true
```

（*条件类型表达式，在没有未知的泛型类型参数时，在信息足够时，能够立刻计算出结果。*）

“一个类型派生于它本身”，这个说法听起来怪怪的，或许用 [assignability](https://www.typescriptlang.org/docs/handbook/type-compatibility.html#advanced-topics) 比派生更合适，但是我不知道怎么翻译。

## infer

[infer](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types) 关键字是条件类型表达式的另一大利器，用于提取抽象类型的局部类型或整体类型。

### 提取局部类型

这里可以参考 typescript 内置的 Parameters 的定义。

Parameters 能够返回一个函数类型中的参数类型。

```typescript
type Parameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;
```

条件类型表达式没有预设具体类型一定要派生于抽象类型，我们这次分析完全可以忽略泛型约束部分，来减少可能的干扰项。

```typescript
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
```
（*这样的改动并不会影响 Parameters 的结果。*）

`T extends (...args: infer P) => any` 声明一个约束，具体类型 T 派生于抽象类型 (...args: infer P) => any 。

在抽象类型的表达式中，infer 将参数列表 args 的类型**提取为** P 。P 会尽量具体，或者说，P 将会和 T 在兼容该抽象类型时，与 T 的 args 类型相同。

如果满足这个约束，P 作为 Parameters\<T\> 的类型，否则为 never 。

```typescript
type test1 = Parameters<(a: string, b: number) => boolean>; // test1 的类型为 [a: string, b: number]
```

### 提取整体类型

提取整体类型的情况比较少见，但也比较简单。

我们来定义一个条件类型 DoubleParameters ，获取 2 次参数列表的类型。

```typescript
type DoubleParameters<T extends (...args: any) => any> =
  Parameters<T> extends infer K ? [K, K] : never;
```

`Parameters<T> extends infer K` 声明一个约束，具体类型 Parameters\<T\> 派生于抽象类型 K 。

infer 将抽象类型整体提取为 K ，K 会尽量具体，K 就是具体类型 Parameters\<T\> 。

这里的条件类型表达式如同定义了一个变量，然后对变量进行了复用。

```typescript
type test1 = DoubleParameters<(x: string) => number>; // [[x: string], [x: string]]
```

### 条件类型表达式一定是个三元表达式

可以看到，上文的条件类型表达式例子之中，有泛型约束，表明左边的的具体类型必将派生于右边的抽象类型；有整体类型的提取，来表示右边的抽象类型将与左边的具体类型相同。

即使有足够的上下文信息，去证明条件类型表达式中的具体类型必将派生于抽象类型，条件类型表达式还是一个三元表达式，它还是需要声明第二条不可能抵达的 never 分支。

这或许能够改进，我们可以期待未来有更简单的结构。

### 条件类型不是类型

前文一直很冗长地称条件类型表达式，是因为条件类型表达式确实是个表达式，他能出现在所有类型表达式能出现的地方，条件类型表达式的计算结果就是类型。

```typescript
const foo: never extends boolean ? string : number = "233";
const bar = true as number extends unknown ? boolean : string;
type qux = NonNullable<233 extends number ? "qux" : false>;
```

那么标题的**条件类型**具体是什么？如果在定义一个泛型类型时，它在等号（ = ）右边的部分，直接是一个条件类型表达式，那么我们就称这个泛型类型为条件类型。

就如上面提到的 IsBaseFunction 、 Parameters 、 DoubleParameters ，它们都是条件类型。

为什么说条件类型不是类型？因为这种泛型类型，需要通过计算条件类型表达式的结果，才能得到最终的类型，而它的结果在得到泛型类型参数前往往是不可知的。

条件类型不是类型，它的结果才是类型。这会导致一个现象，那就是无法用 infer 提取一个抽象的条件类型的参数。如下面的例子所示。

``` typescript
type sth = (x: string) => number;

type foo = Parameters<sth> extends Parameters<infer K> ? K : never;

type qux<T extends (...args: any) => any> = Parameters<T> extends Parameters<
  infer K
>
  ? K
  : never;

type bar = qux<sth>;
```

上面这个例子，无论 foo 还是 bar，都得不到和 sth 一样的类型。

## 元组与函数形参

有了以上的概念，就能开始对 typescript 的类型进行一些复杂的操作了。

本文开头提到过，我写了一个操作函数的库 facade.ts 。我在其中主要是操作函数类型，而函数形参是操作最多的部分。为了使表达更直白，后文把函数形参称为参数列表。

前文提到过，参数列表的类型是数组，其实再往细里说，参数列表的类型是派生于数组的[元组](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types)。

作为参数列表的元组除了兼容数组，还有以下特点：

- 每一项元素都能拥有不同的类型。

```typescript
type foo = [number, boolean];
```

- 尾部的元素可以是可缺省的。

```typescript
type foo = [number, boolean?, string?];
```

- 元素还可以是 rest 数组。

```typescript
type foo = [number, ...boolean[]];  
```

- 长度可以是固定的。

```typescript
type foo = [number, boolean?, string?]["length"]; // 1 | 2 | 3
type bar = number[]["length"]; // number
```

- 每一项元素都能有名字。

```typescript
type foo = [a:number, b?:boolean, c?:string];
```

### IsFixedTuple

柯里化函数要求作为原型的函数它的参数列表是固定的，可数的。于是我需要定义一个条件类型 IsFixedTuple ，用来判断元组长度是否固定的，固定为 true ，非固定为 false 。

```typescript
type IsFixedTuple<T extends unknown[]> = number extends T["length"]
  ? false
  : true;
```

原理很简单，元组的数量不是固定时，它的长度是类型 number 它本身。只需判断具体类型 T 的长度是否为 number 它本身，就能判断一个元组类型的长度是否固定。

在条件类型表达式中，需要用到具体类型 T 的 length 属性获得长度，在它的上下文中，T 需要具备数组的特性才能拥有 length 属性。于是我们需要通过泛型约束，声明具体类型 T 派生于某种数组的抽象类型。

为什么是 unknown[] ？因为泛型约束会限制传入 T 的实参类型，为了使 T 能接受所有种类的数组类型作为实参，所以使用了元素为最抽象类型 unknown 的数组类型 unknown[] 。any[] 也行。

T["length"] 除了会得到 number 它本身的类型，还会得到派生于 number 的数值[字面量类型](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types)，如前文中的 1 | 2 | 3 。number 类型兼容数值字面量类型，而 number 不派生于数值字面量。所以在使用 extends 的条件类型表达式中，要准确判断 T["length"] 是否为 number 它本身，只能把 T["length"] 放在抽象类型的位置上，最终得到 `number extends T["length"]` 。

```typescript
type IsFixedTuple<T extends unknown[]> = number extends T["length"]
  ? false
  : true;

type foo = IsFixedTuple<[number, boolean]>; // true
type bar = IsFixedTuple<[number, boolean?, string?]>; // true ；1 | 2 | 3　也算是可数的。
type qux = IsFixedTuple<[number, ...boolean[]]>; // false
```

### 参数列表的小遗憾

迄今为止，4.6.3 的 typescript ，没有在参数类型上区分可缺省参数和默认值参数。

```typescript
const foo = (a: number, b?: string) => {}; // 可缺省参数
const bar = (a: number, b: string = "") => {}; // 默认值参数

type Foo = Parameters<typeof foo>; // [a: number, b?: string]
type Bar = Parameters<typeof bar>; // [a: number, b?: string]
```

在运行时，foo.length 为 2 ，bar.length 为 1 。可是它们参数列表类型是相同的 [a: number, b?: string] ，length 也是 1 | 2 。由于这种差异存在，包含可缺省参数或默认值参数的函数，在转化成柯里化函数时无法保证类型安全，所以我们需要找一个条件类型来辨别它们。

### IsOptionalTuple

也许可以从[联合类型](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)入手解决问题，但联合类型在类型操作上比较特别，我也不知道如何判断一个类型是否联合类型。

我需要换一种思路，由于它们都表现为尾部的参数是可缺省的，所以我还能通过对尾部参数的辨别去解决问题。

我们来定义一个条件类型 IsOptionalTuple ，判断一个类型是否为可缺省的元组。

```typescript
type IsOptionalTuple<T extends unknown[]> = T extends [
  ..._: infer Front,
  _?: infer Tail
]
  ? [..._: Front, _?: Tail] extends T
    ? true
    : false
  : false;
```

这是由多个条件类型表达式组合而成的条件类型。多亏有格式化插件，不然真没法读。

实际上，只要判断元组最后一个元素是否可缺省的，就能知道这个元组是否为可缺省的元组。

#### infer 的使用和解构很似

在继续分析之前，有一个值得分享的经验，那就是 infer 的使用和解构很似。

我个人认为，infer 的使用能看作是 extends 右边的抽象类型对它左边的具体类型进行解构，这样会直观很多。特别是[元组的解构](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#tuple-destructuring)，不过比起运行时的解构，元组类型的解构要更为宽松。

在表达式 `T extends [..._: infer Front, _?: infer Tail]` 中，infer 以解构的形式从抽象类型提取最后一项元素的类型为 Tail ，以及前边剩余的元素为元组类型 Front。

这里有几点说明需要补充一下：

1. 元组类型的解构比运行时的解构要更为宽松，rest 元素可以在任意位置。只要提供给上下文的信息是足够的。
2. 解构得到的 rest 元素还是元组类型。
3. 元素的命名不影响解构结果，甚至可以相同。在这里命名的作用是给缺省符号 ? 提供放置的位置。
4. 如同某类型 K 兼容 K | undefined ，元组 [K] 兼容 [K?] ，只要前面的类型一一兼容就好。

~~说明的说明。~~

第 3 点是我自己试出来的。

``` typescript
type foo = [] extends [_?: infer T] ? T : 233; // foo 为 unknown 。233 是故意的，只要 T 一定不是 233 就行。
type bar = [x: "x"] extends [_?: infer T] ? T : 233; // bar 为 "x"
type qux = [x?: "x"] extends [_?: infer T] ? T : 233; // bar 为 "x"
```

#### 论兼容

关于第 4 点。对于联合类型，对于 [K?] ，派生这个词似乎不那么好用了，所以这种时候我就说[兼容](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)。

有两个类型 A 和 B ，A 兼容 B 意味着什么？简单来说就是， B 能安全使用的场景，A 也能安全使用。

用代码来表达可能直观一点，以下代码编译会报错。

```typescript
const func = (foo: number | null) => foo + 233;
// 对象可能为 "null"。ts(2531)
```

从[类型收缩](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)的角度来看，联合类型总是宽松的，在把它的值当作其中一个类型来使用之前，需要有额外的判断使其能够安全地转化（收缩）为那个类型。

所以类型 K 兼容包含它的联合类型 K | XXX 合情合理。

包含可缺省元素的元组也可以视作宽松的，与上同理，可缺省元组宽松的部分必定会经过收缩才能够使用。所以不可缺省的元组 A ，只要同样位置上的元素的类型一一兼容可缺省的元组 B，那么 A 就兼容 B 。

反过来就不能成立了，宽松的类型在没有经过收缩前，无法当作不宽松的版本直接使用，它必然不兼容它的不宽松版本。

#### 回到 IsOptionalTuple

IsOptionalTuple 的 第一条表达式 `T extends [..._: infer Front, _?: infer Tail]` ，它的主要作用是提取 Front 和 Tail，不能直接判断 T 的最后一个元素是否可缺省。所以我们需要第二条表达式 `[..._: Front, _?: Tail] extends T` 。

第二条表达式在第一条表达式约束成立后才会进入的第一个分支中，它能复用第一条表达式约束成立后的上下文信息。

那就是，由 T 解构而来，把 T 拆分成两个部分的 Front 和 Tail 。与此同时，Front 是一个元组。这些新的上下文信息，都能在后续的上下文使用。

所以 [..._: Front, _?: Tail] 表达的是，最后一个元素必定是可缺省的 T 的宽松版本。

由于宽松的类型不能兼容它的不宽松版本，如果这个宽松版本的 T 兼容了 T 它本身，那么 T 它本身最后一个元素必定是可缺省的。所以第二条表达式 `[..._: Front, _?: Tail] extends T` 在新的上下文中，起到了判断 T 的最后一个元素是否可缺省的作用。

以上就是 IsOptionalTuple 的全部解释。

```typescript
type foo = IsOptionalTuple<[]>; // false
type bar = IsOptionalTuple<[a: number]>; // false
type qux = IsOptionalTuple<[a: number, b?: string]>; // true
```

## 可以递归的条件类型

条件类型的结构和函数的结构很相似，类型名字与函数名字对应，泛型参数列表跟函数形参对应，条件表达式与函数体对应。它们同样是接受实际参数后才计算结果。

条件类型也能像函数那样递归表达，以下拿 Repeat 类型举例，它的作用是把类型 T 复用 N 遍作为元组返回。

```typescript
type Repeat<
  T extends unknown,
  N extends number,
  R extends T[] = []
> = N extends R["length"] ? R : Repeat<T, N, [...R, T]>;
```

Repeat 第 3 个形参 R 是一个默认参数。在使用 Repeat 时如果没有传入第 3 个参数，就会使用默认参数 []，方便使用。

写递归的条件类型就跟写递归函数一样……篇幅有限，此处不展开。

我能分享的是，类型操作没有闭包没有办法用变量去缓存状态，所以需要通过参数列表去传递状态。

Repeat 就是用第 3 个参数 R 来传递未来的结果。在一次次递归调用 Repeat 中，元组 R 的 length 一直增长，直到等于 N 。

```typescript
type foo = Repeat<unknown, 3>; // [unknown, unknown, unknown]
type bar = Repeat<unknown, 0>; // []
type qux = Repeat<string, 2>; // [string, string]
```

## 联合类型与条件类型

有没有想过 `Repeat<number, 1 | 3>` 会得到什么结果。

```typescript
type foo = Repeat<number, 1 | 3>;
// [number] | [number, number, number]
```

这里不是与上文矛盾，宽松类型兼容了它的不宽松版本。而是条件类型的特殊机制—— [distributive](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types) 。

此时的 `Repeat<number, 1 | 3>` 相当于 `Repeat<number, 1> | Repeat<number, 3>` 。

如果直接使用条件类型表达式，是不会违背前文所述的兼容理论。

```typescript
type foo = 1 | 3 extends 1 ? "gg" : 233; // 233

type D<T> = T extends 1 ? "gg" : 233;
type bar = D<1 | 3>; // "gg" | 233
```

typescript 的一些[内置条件类型](https://www.typescriptlang.org/docs/handbook/utility-types.html)，如：Exclude 、Extract 、NonNullable 等，都依赖于 distributive 这个特性，感兴趣的自己看定义。

### 特例 any

讨厌的特例来了，在非条件类型的情况下也会 distributive ，那就是 any 。

```typescript
type foo = any extends 1 ? "gg" : 233; // "gg" | 233

type D<T> = T extends 1 ? "gg" : 233;
type bar = D<any>; // "gg" | 233
```

any 总是遍历条件类型表达式的两个分支。

也许 any 的语义是包括所有的类型，除了 never ，所以才那么特殊吧。

### 拒绝 distributive

如果想要拒绝 distributive ，那么就把类型 T 装到元组里，此时就能用本文的兼容理论去解释条件类型表达式。

```typescript
type foo = [any] extends [1] ? "gg" : 233; // "gg"

type D<T> = [T] extends [1] ? "gg" : 233;
type bar = D<any>; // "gg"
```

（*我是试出来了才知道文档有 distributive 这种说法，以及拒绝它的方法。*）

这种机制其实很奇怪，细究的话我也不知道怎么圆，开始难受起来了。

### 如何判断一个类型是否为 any

提到了联合类型，提到了 any ，不妨我们再提提[交叉类型](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types) 。

使用交叉类型来辨别 any 。

```typescript
type IsAny<T> = 0 extends 1 & T ? true : false;

type A = IsAny<any>; // true
type B = IsAny<number>; // false
type C = IsAny<unknown>; // false
type D = IsAny<never>; // false
```

（*从[stack overflow](https://stackoverflow.com/questions/49927523/disallow-call-with-any/49928360#49928360)抄的。*）

#### 好用的派生图谱

结合派生图谱可以解释，为什么只有 any 可以满足 `0 extends 1 & any` 。

联合类型的操作符 | 和交叉类型的操作符 & ，在某些情况下能合并它们的操作数返回新的类型。

| 两边的操作数在同一条派生路径时，它会取更抽象的类型作为结果。

```typescript
type foo = number | 1; // number
type bar = unknown | number; // unknown
type jux = number | never; // number
type aab = unknown | never; // unknown
type qwe = any | unknown; // any ；any 也能是最抽象的
```

& 两边的操作数在同一条派生路径时，它会取更具体的类型作为结果。

```typescript
type foo = number & 1; // 1
type bar = unknown & number; // number
type jux = number & never; // never
type aab = unknown & never; // never
type qwe = any & unknown; // any
type bbq = any & never; // never
```

如果两两边的操作数不在同一条派生路径时，| 会保留它们，结合操作符作为新的类型。

``` typescript
type foo = string | number; // string | number
type bar = number | { x: string }; // number | { x: string }
type jux = { x: number } | { y: string }; // { x: number } | { y: string }
```

& 的情况比较复杂，如果两边的操作数没有重叠的可能性，就会返回 never 。否则就是结合它们返回新的类型。

``` typescript
type foo = string & number; // never
type bar = number & { x: string }; // number & { x: string }
type jux = { x: number } & { y: string }; // { x: number } & { y: string }
```

（ *bar ??? 因为 number 能装箱么，算了，不会圆了。*）

never 的语义确实能用在这种场景，有的类型不可能存在。

#### 回到 IsAny

`1 & T` 因为操作符 & 的性质，它只会得到类型 1 或比类型 1 更具体的类型。因此一般情况下，`0 extends 1 & T` 这个约束是无法成立的。

但是 any 是特例，any 除了是最具体的类型（不考虑 never ），还能是最抽象的类型，所以 `0 extends 1 & T` 这个约束在 T 是 any 的时候可以成立。

综上所述就是 IsAny 的原理。

### 实参是 boolean 也会 distributive

true | false 是 boolean？这个可以理解。

```typescript
type foo = true | false; // boolean
```

在这个基础上，boolean 会触发 distributive ，也是可以理解的。

```typescript
type DTest<T> = T extends true ? "fork1" : "fork2";

type foo = DTest<boolean>; // "fork2" | "fork1"
```

那 number 能不能是 1 | 2 |... ？然后触发 distributive ？

```typescript
type DTest<T> = T extends 1 ? "fork1" : "fork2";

type foo = DTest<number>; // "fork2"
```

不会触发 distributive 。

### 实参是 never 不会 distributive ？

传入条件类型的实参是 never 时。

```typescript
type DTest<T> = T extends true ? "fork1" : "fork2";

type foo = DTest<never>; // never
```

never 是特例么？条件类型传入 never 就直接返回 never ？

```typescript
type DTest<T> = [T] extends [true] ? "fork1" : "fork2";

type foo = DTest<never>; // "fork1"
```

拒绝 distributive ？？？不知道咋圆回去。

## never 制造的麻烦
