# 01 推断、注解与安全的未知值

> 资料核对日期：2026-08-14；基准：TypeScript 5.9、`strict: true`。

## 本章目标与前置知识

你已经会 JavaScript，本章不重复变量和函数语法。目标是理解 TypeScript 在什么时候自动推断类型、什么时候值得写注解，以及 `any`、`unknown`、`never` 分别在类型系统里扮演什么角色。学完后，你应该能解释为什么一段没有显式类型的代码仍然是类型安全的，以及为什么后端边界应该从 `unknown` 开始。

## 官方资料怎么读

- [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)：先读类型推断、结构化类型和联合类型，建立“TS 是 JS 的静态检查器”这一认识。
- [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)：重点读类型注解、上下文类型、联合类型、字面量类型、`null`/`undefined`。
- [The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)：重点看静态检查、非异常失败和显式类型。
- [`strict` TSConfig 选项](https://www.typescriptlang.org/tsconfig/strict.html)：理解它是一组严格检查的总开关，升级 TypeScript 时可能新增检查。

官方文档反复强调的不是“给每个变量标类型”，而是让检查器尽可能从 JavaScript 代码中获得信息。类型注解是一种约束和文档，不是仪式。局部值通常让编译器推断；函数参数、公共返回值、配置和领域边界则适合显式声明。

## 核心解读与心智模型

把类型理解成“某个程序点上允许出现的值的集合”。`number` 是所有数字值的集合，`"queued"` 是只有一个成员的集合。联合类型 `string | number` 是两个集合的并集。控制流检查会不断缩小集合，这会在第 03 章展开。

推断分为常见的两类：初始化推断和上下文推断。`let count = 0` 从初始值推断为 `number`；`names.map(name => name.length)` 中，回调参数从 `map` 的调用上下文推断为 `string`。重复写 `let count: number = 0` 通常没有增加信息。

`const` 不一定让对象的每个属性都成为字面量类型。`const config = { mode: "prod" }` 的属性仍可能被修改，所以 `mode` 往往推断为 `string`。需要深层字面量和只读效果时才考虑 `as const`。

三种特殊类型可以这样记：

- `any`：退出类型检查。它可以赋给任何类型，也能接收任何类型，错误会沿调用链传播。
- `unknown`：确实不知道。它能接收任何值，但使用前必须通过运行时检查证明类型。
- `never`：不可能到达。永不返回的函数、已经穷尽的联合分支会得到 `never`。

## Demo 对照

打开 [src/01-foundations.ts](../../src/01-foundations.ts)。

`serviceName` 与 `requestCount` 展示推断；函数 `parsePort(value: unknown)` 展示边界输入不能直接参与运算，必须先用 `typeof` 判断。字符串分支还要完成业务校验：能转成数字不等于它就是合法端口，这也是本章练习要补的部分。

`fail(message): never` 表示函数不会正常返回。它与 `void` 不同：`void` 函数可以执行到结尾，只是不关心返回值；`never` 代表不存在正常完成路径。

运行：

```bash
npm run demo:01
npm run typecheck
```

## Node.js 场景

环境变量、HTTP body、消息队列载荷和 `JSON.parse` 的结果都来自程序边界。即使某个库把它们标成宽泛类型，也应在领域层入口将其视为 `unknown`。例如 `process.env.PORT` 在语义上不是数字，而是 `string | undefined`；必须完成存在性、格式和范围校验后才能成为应用内部的 `number`。

公共服务函数的返回类型建议显式声明，因为它能防止重构时意外改变 API；函数内部的中间变量则优先依靠推断。

## 常见误区与典型错误

1. “写了 `as number` 就转换成数字。”错误。断言不会生成运行时代码，`"3000" as unknown as number` 运行时仍是字符串。
2. “`any` 只影响当前一行。”错误。`any` 调用的结果通常也是 `any`，会让后续检查失效。
3. “返回类型都不该写。”私有小函数可推断，公共 API 显式返回类型往往更稳定。
4. `Object`、`String`、`Number` 不是日常值应使用的类型；应写小写的 `object`、`string`、`number`。

## 练习与自检

1. 修改 `parsePort`：只接受 1–65535 的整数。提示：先统一转换，再用 `Number.isInteger` 和范围判断；不要用断言。
2. 写 `formatError(error: unknown): string`：`Error` 返回 `message`，字符串原样返回，其余返回“未知错误”。提示：使用 `instanceof Error` 和 `typeof`。

自检：为什么 `unknown` 比 `any` 更适合 HTTP body？`void` 与 `never` 有何区别？哪些位置的注解真正增加了约束？

## 小结与下一章

类型推断负责减少噪声，显式注解负责固定边界，`unknown` 迫使代码证明安全，`never` 描述不可能路径。下一章会把这些基本集合组合成对象类型和业务状态。
