# 05 从现有类型生成新类型

> 资料核对日期：2026-08-14；基准：TypeScript 5.9。

## 本章目标与前置知识

本章目标不是进行竞赛式“类型体操”，而是读懂库声明、减少重复类型并让类型随领域模型同步变化。你需要理解对象类型和泛型。完成后，应能按 `typeof → keyof → T[K] → 映射类型 → 条件类型` 的顺序拆解复杂类型。

## 官方资料怎么读

- [Creating Types from Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)：把它当成本章目录。
- [`keyof`](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)、[`typeof`](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html)、[Indexed Access](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)：先掌握三个基础操作。
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) 与 [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)：重点理解属性遍历、修饰符和 `infer`。
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) 与 [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)：最后看组合和标准工具。

官方页面可以逐层阅读，不必一次掌握所有分布式条件类型细节。日常后端开发最有价值的是从单一领域类型派生 DTO、字段名、事件名和函数返回值。

## 核心解读与心智模型

`typeof` 在类型位置读取某个值的静态类型；它不是运行时 `typeof` 的结果字符串。`keyof T` 产生对象键的联合，`T[K]` 读取键对应的值类型。三者组合可以避免重复手写：

```ts
const defaults = { port: 3000, host: "localhost" };
type Config = typeof defaults;
type ConfigKey = keyof Config;
type Port = Config["port"];
```

映射类型像在类型层对属性做 `for...in`：`{ [K in keyof T]: T[K] | null }` 为每个属性增加 `null`。还可以通过 `+?`、`-?`、`readonly` 和键重映射改变修饰符与键名。

条件类型 `T extends U ? X : Y` 是类型层的分支。`infer` 只在条件类型中声明待推断部分，例如从 `Promise<Value>` 中取出 `Value`。当裸类型参数接收联合时，条件类型会分发到每个成员；这是能力也是常见困惑来源。

模板字面量类型适合存在明确命名规则的有限字符串，例如领域事件 `${Entity}:created`。若组合规模巨大或来自动态数据，普通 `string` 加运行时校验更合理。

内置工具类型不是魔法：`Partial<T>` 是添加可选修饰符的映射类型，`Pick<T, K>` 是只遍历指定键。先用标准工具，只有领域语义不同才自定义。

## Demo 对照

打开 [src/05-type-toolbox.ts](../../src/05-type-toolbox.ts)。

`AccountPatch` 先用 `Pick` 限定允许更新的字段，再用 `Partial` 让它们可选，避免客户端修改 `id`。`EventName` 用模板字面量限定事件命名。`Nullable` 展示映射类型；`UnwrapPromise` 展示条件类型与 `infer`。`LoadedAccount["id"]` 则是索引访问类型。

`satisfies AccountPatch` 与 `as AccountPatch` 不同：前者检查值满足约束，同时保留表达式自身更精确的类型；后者要求编译器按断言看待值。

运行：

```bash
npm run demo:05
npm run typecheck
```

## Node.js 场景

配置加载器可以用 `keyof Config` 限制合法配置名；事件总线可以从事件映射派生事件名和处理器参数；服务层可以用 `Awaited<ReturnType<typeof fn>>` 获取异步函数最终结果。不过如果类型只有通过悬停和多次跳转才能理解，应考虑命名中间类型，而不是继续压缩成一行。

PATCH 类型不能盲目写成 `Partial<Entity>`：这往往允许修改 ID、创建时间等不可变字段。应先 `Pick` 或 `Omit` 明确业务允许范围。

## 常见误区与典型错误

1. 把值空间的 `typeof value` 与类型位置的 `typeof value` 混为一谈。
2. 认为 `keyof` 返回运行时数组；它只存在于类型系统中。
3. 条件类型意外分发联合，产生比预期更宽的结果；必要时用元组包裹两侧阻止分发。
4. 为炫技重写 `Pick`、`Awaited` 等标准工具，增加维护成本。

## 练习与自检

1. 实现 `Mutable<T>`，移除所有属性的 `readonly`。提示：映射修饰符使用 `-readonly`。
2. 实现 `StringKeys<T>`，得到值类型为字符串的键联合。提示：先映射每个键为“键或 never”，再用 `[keyof T]` 读取联合。

自检：`keyof T` 与 `T[keyof T]` 分别是什么？`satisfies` 为什么适合配置对象？什么情况下不应继续增加类型复杂度？

## 小结与下一章

类型工具的价值是从单一事实派生其他类型，避免模型漂移。下一章回到运行时：这些精确类型在接触 JSON 和 HTTP 输入时并不会自动验证数据。
