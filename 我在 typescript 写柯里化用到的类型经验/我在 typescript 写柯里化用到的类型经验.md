# 我在 typescript 写柯里化用到的类型经验

## 我写了个库，但本文重点不是它

我写了个库，[facade.ts](https://github.com/iplaylf2/facade.ts) ，可以把一个 typescript 的函数变成柯里化的函数。

``` typescript
$((x: string, n: number) => x.repeat(n))("Hello!")(3); 
// Hello!Hello!Hello!
```

就像 [ramda](https://github.com/ramda/ramda) 那样，但是本身是类型安全的，而要做到那样的效果需要在类型体操上踩点坑。

我想分享一下这其中总结的类型经验，顺便推广一下自己的库，这就是本文的来由。

## 只是一些朴实的技巧

其实我不太愿意用体操这个词，至少题目没用到。因为我看其他的类型体操文也会被劝退。

在这，我会尽量说一些简单朴实的技巧，尽量指出该技巧在官方文档的出处。

## 说一下 any 、 unknown 、 never

做体操会大量用到 [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) 的特性，和与之深深关联的 extends 关键字。

在这之前，有 3 个类型更需要先弄明白，any 、unknown 、never 。

### any

“遇事不决用 any ”，“ AnyScript ”，想必很多人都听说过。

在 typescript ，[any](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any) 类型的变量，能赋值给所有类型的变量，也能接受所有类型的值。

``` typescript
let x: any = 233;
const a: string = x;
x = false;
```

复用别的面向对象语言的经验，有人会以，“ any 是所有类型的基类也是所有类型的子类”，去方便理解它。

可是 typescript 的文档除了介绍 class 时，没有基类和子类这般说法，像“继承”用到的 extends 关键字也能翻译成“扩展”。

但我觉得这样去理解没啥问题，也方便表达，所以后文还是会用到这两个词。

*或者更抽象和更具体这个表达能更准确些，这个后文再说。*

### unknown

[unknown](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown)

[never](https://www.typescriptlang.org/docs/handbook/2/functions.html#never)


