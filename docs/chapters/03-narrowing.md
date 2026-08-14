# 03 控制流收窄与穷尽检查

> 资料核对日期：2026-08-14；基准：TypeScript 5.9。

## 本章目标与前置知识

本章解释 TypeScript 如何把 JavaScript 的运行时判断转化成静态类型证据。你需要理解联合类型和对象类型。完成后，应能正确使用 `typeof`、`in`、`instanceof`、类型谓词和可辨识联合，并能读懂“为什么明明检查过仍是 `unknown`”。

## 官方资料怎么读

- [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)：本章主资料，依次读 `typeof`、真值、相等、`in`、`instanceof`、赋值、控制流、类型谓词、可辨识联合和 `never`。
- [Unions and Intersection Types](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)：用网络状态示例复习联合和穷尽性。
- [`useUnknownInCatchVariables`](https://www.typescriptlang.org/tsconfig/useUnknownInCatchVariables.html)：理解为什么 `catch` 中的值不保证是 `Error`。

官方所说的控制流分析，可以理解为编译器沿每条可能路径维护一份“当前能证明的最具体类型”。判断、提前返回、抛异常和赋值都会改变这份信息。

## 核心解读与心智模型

声明类型是变量的最大范围，收窄类型是当前程序点的已知范围。例如参数是 `string | number`，进入 `typeof value === "string"` 分支后只剩 `string`。离开分支后，如果两条路径重新汇合，类型通常重新合并。

常见守卫各有边界：

- `typeof` 适合原始值，但 `typeof null === "object"`。
- 真值判断会同时排除 `null`、`undefined`、`0`、空字符串等，业务上未必符合意图。
- `in` 判断属性是否存在于对象或原型链，不能单独证明属性值的具体类型。
- `instanceof` 依赖运行时构造函数和原型链，JSON 数据不会自动成为类实例。
- 类型谓词 `value is T` 把证明封装进函数，但实现写错时编译器通常无法替你验证其真实性。

可辨识联合的共同字面量字段让 `switch` 成为可靠的状态分发器。所有成员处理完后，剩余值应为 `never`；将它传给 `assertNever`，未来新增成员但漏改分支时就会出现编译错误。

## Demo 对照

打开 [src/03-narrowing.ts](../../src/03-narrowing.ts)。`AppError` 用 `kind` 区分三类错误；`statusCode` 在每个 `case` 内都获得对应成员。`default` 中的 `error` 只有在分支完整时才是 `never`。

`hasMessage(value: unknown): value is { message: string }` 逐层证明：先是非空对象，再存在属性，最后属性值是字符串。调用成功分支才允许读取 `caught.message`。

### `age` 报错为什么发生

曾经的第 06 章写法是：

```ts
if ("age" in input && typeof input.age !== "number") return error;
if ("age" in input) value.age = input.age;
```

第一个条件未成立有两种可能：没有 `age`，或者有 `age` 且为数字。人可以组合第二个判断推理，但编译器对跨表达式的属性读取保持保守，而且属性还可能由 getter 返回不同值。可靠写法是在同一个存在性分支中检查并使用：

```ts
if ("age" in input) {
  if (typeof input.age !== "number") return error;
  value.age = input.age;
}
```

这不是“骗过编译器”，而是让运行时证明与使用位于连续控制流中。

## Node.js 场景

错误捕获、HTTP 路由、队列消息和 webhook 事件都需要收窄。任何值都可以被 `throw`，所以严格项目中的 `catch (error)` 是 `unknown`；应使用 `error instanceof Error` 或可靠的对象检查，而不是直接读 `error.message`。

来自多个消息类型的消费者可用 `type` 字段组成联合，并用穷尽 `switch` 确保新增事件时所有处理器都得到更新。

## 常见误区与典型错误

1. `if (value)` 不等于“不是 `undefined`”，它还排除合法的 `0` 和 `""`。
2. `"age" in input` 只能证明属性存在；对未知对象而言，`input.age` 仍是 `unknown`。
3. `value as User` 不是收窄，因为没有运行时条件提供证据。
4. 类型谓词是承诺，不是自动校验器；谓词实现必须有测试。

## 练习与自检

1. 给 `AppError` 增加 `timeout`，先不改 `statusCode`，观察 `assertNever` 的错误，再补映射。
2. 编写 `getErrorMessage(error: unknown)`，覆盖 `Error`、字符串和带字符串 `message` 的普通对象。

自检：控制流在何时合并？为什么 `in` 不足以证明属性值类型？类型谓词写错会产生什么风险？

## 小结与下一章

收窄是用运行时事实逐步缩小静态类型，`never` 则检查是否已经穷尽所有可能。下一章将使用泛型保留不同调用之间的类型关系。
