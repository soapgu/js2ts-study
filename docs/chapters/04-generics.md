# 04 函数与实用泛型

> 资料核对日期：2026-08-14；基准：TypeScript 5.9。

## 本章目标与前置知识

本章不把泛型当作“占位符语法”，而是把它理解为输入与输出之间的类型关系。你应已掌握函数、对象和联合类型。完成后，应能判断什么时候需要泛型、如何让推断工作，以及何时联合类型比重载或泛型更清楚。

## 官方资料怎么读

- [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)：重点读函数类型表达式、调用签名、泛型函数、约束、重载和编写好函数的指导。
- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)：重点读类型变量、泛型类型、约束和在约束中使用类型参数。
- [Object Types：Generic Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html#generic-object-types)：观察 `Array<T>`、`ReadonlyArray<T>` 等日常泛型。

官方的关键建议是尽量减少无用类型参数，把类型参数压到实际使用处，并优先从参数推断。一个类型参数如果只出现一次，通常没有表达关系，可能直接写具体类型或 `unknown` 更合适。

## 核心解读与心智模型

泛型像一个“由调用者填入、由编译器追踪的类型变量”。`first<T>(items: T[]): T | undefined` 表达：返回值与数组元素是同一种类型。若改成 `unknown[] -> unknown`，运行安全但丢失信息；若改成 `any[] -> any`，连安全性也丢失。

约束 `T extends Entity` 不是说 `T` 必须声明继承 `Entity`，而是要求它的结构至少包含 `id: string`。函数内部只能使用约束保证的成员，但返回的仍是调用者传入的完整 `T`。

默认类型参数适合提供常用缺省值，例如 `ApiResult<T, E = string>`。调用者只提供成功值类型时，错误自动使用 `string`；需要结构化错误时再覆盖 `E`。

泛型与联合解决不同问题。联合表达“值可能是这几种”；泛型表达“多个位置的类型相互关联”。如果返回类型并不随输入变化，往往不需要泛型。

重载适合调用形态明显不同、返回类型随签名变化的公共 API。实现签名不是调用者可见签名。若一个联合参数就能准确描述调用，官方建议优先联合，避免重载解析限制。

## Demo 对照

打开 [src/04-generics.ts](../../src/04-generics.ts)。

`indexById<T extends Entity>` 只依赖 `id`，却让 Map 的值保留 `name` 等额外字段。`first<T>` 配合 `noUncheckedIndexedAccess` 返回 `T | undefined`，真实表达空数组情况。

`ApiResult<T, E = string>` 同时抽象成功值和错误值。`mapResult<T, U, E>` 将成功值从 `T` 映射到 `U`，失败分支原样保留 `E`。这里的三个类型参数都至少关联两个位置，因此都有实际意义。

`as const` 保留用户数组的字面量和只读特征；`satisfies` 检查表达式满足目标类型，但不把表达式粗暴改写成目标类型。

运行：

```bash
npm run demo:04
npm run typecheck
```

## Node.js 场景

仓储、缓存、分页响应、事件总线和中间件上下文常需要泛型。例如 `Page<T>` 保留列表元素类型，`Result<T, E>` 保留服务返回的成功/失败结构。应避免设计一个拥有五六个类型参数、调用者必须手写全部参数的“万能基础类”；这通常是在用类型复杂度掩盖职责过多。

异步函数只是在返回关系外包一层 `Promise<T>`。不要写 `async function f(): T`，正确返回类型是 `Promise<T>`。

## 常见误区与典型错误

1. 用 `<T>` 让函数看起来通用，但 `T` 只出现一次，没有建立关系。
2. 约束写得过宽，如 `T extends any[]`，可能让成员访问退化为 `any`；应直接约束元素类型。
3. 调用时总是手写类型参数。优先让编译器从参数推断，手写只用于无法推断或刻意扩大类型。
4. 用重载处理所有联合输入，结果实现和调用签名难以维护。

## 练习与自检

1. 实现 `groupBy<T, K extends PropertyKey>(items, getKey): Map<K, T[]>`。提示：键由回调返回，输入元素与分组值保持同一 `T`。
2. 为 `Repository<T extends Entity>` 设计 `findMany(): Promise<readonly T[]>`，解释为什么返回只读数组能减少调用者误修改。

自检：泛型相比 `unknown` 保留了什么？约束会不会抹掉 `T` 的额外属性？什么情况下联合类型比泛型更合适？

## 小结与下一章

好的泛型用尽量少的类型参数表达真实关系，并让推断替调用者工作。下一章会在泛型基础上用 `keyof`、映射和条件类型从现有类型生成新类型。
