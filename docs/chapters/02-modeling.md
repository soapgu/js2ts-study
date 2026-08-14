# 02 对象类型与业务状态建模

> 资料核对日期：2026-08-14；基准：TypeScript 5.9、`exactOptionalPropertyTypes: true`。

## 本章目标与前置知识

本章目标是从“给字段标类型”进阶到“让非法业务状态无法构造”。你需要已经理解联合类型和字面量类型。完成后，应能用结构化类型描述数据能力，用可辨识联合替代互相矛盾的布尔字段。

## 官方资料怎么读

- [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)：重点读属性修饰符、索引签名、扩展、交叉类型和泛型对象。
- [Everyday Types：Type Aliases 与 Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-aliases)：关注两者相似处和接口可重新开放的差异。
- [Narrowing：Discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)：理解共同字面量字段如何关联不同成员的专属属性。
- [`exactOptionalPropertyTypes`](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)：理解“属性缺失”和“属性存在但值为 `undefined`”的语义区别。

TypeScript 使用结构化类型（structural typing）：只要值拥有所需的结构，就可以赋给目标类型，不要求像 Java/C# 那样显式声明实现关系。这非常适合 JavaScript 的对象组合方式，但也意味着类型名称本身不会创造运行时身份。

## 核心解读与心智模型

把对象类型看作“最低能力要求”。函数需要 `{ id: string }`，调用者可以提供更多字段；函数只保证能安全读取 `id`。这解释了为什么 `User` 可以传给只需要 `Entity` 的函数。

`interface` 与 `type` 不必宗教化选择：可扩展的对象契约和库声明常用 `interface`；联合、元组、映射和组合类型常用 `type`。团队保持一致比寻找唯一正确答案重要。

可选属性 `nickname?: string` 表示属性可以不存在。开启 `exactOptionalPropertyTypes` 后，若没有显式写 `| undefined`，就不能通过 `{ nickname: undefined }` 冒充“缺失”。这对 PATCH、序列化和数据库更新很重要：缺失常表示“不修改”，显式 `undefined` 可能有另一种语义。

业务状态建模的核心是把相关字段绑定到状态上。下面这种模型存在非法组合：

```ts
interface BadJob {
  running: boolean;
  succeeded: boolean;
  result?: string;
  error?: Error;
}
```

它允许 `running` 和 `succeeded` 同时为真，也允许成功却没有结果。可辨识联合则让每个成员以共同的字面量字段 `status` 区分，并只携带该状态合法的数据。

`readonly` 只提供编译期浅层约束，不会调用 `Object.freeze`。如果属性指向可变对象，内部仍可能变化。

## Demo 对照

打开 [src/02-modeling.ts](../../src/02-modeling.ts)。`UserId` 是类型别名，但仍与普通 `string` 结构兼容；如果需要防止订单 ID 与用户 ID 混用，后续可以学习 branded type，但当前先保持简单。

`Job` 的四个成员共享 `status` 和 `createdAt`，各自拥有合法字段。`describe` 判断 `status` 后，TypeScript 自动允许访问 `result` 或 `error`。尝试在 `queued` 分支访问 `result`，编译器会拒绝。

运行：

```bash
npm run demo:02
npm run typecheck
```

## Node.js 场景

任务队列、支付、订单、审批流和异步作业都适合可辨识联合。API 层可以直接依据状态序列化不同响应，但要注意类型不会校验数据库中的旧数据；读取持久化数据时仍需运行时解析。

对更新接口，应区分创建输入、更新输入和持久化实体，不要用一个包含大量可选字段的 `User` 覆盖所有阶段。`CreateUserInput`、`UserPatch`、`User` 三种类型表达的是不同生命周期。

## 常见误区与典型错误

1. “结构匹配意味着两个领域概念相同。”TS 只判断结构兼容，领域含义仍需命名和边界设计。
2. “`readonly` 会冻结对象。”它不会产生运行时代码，也默认不递归。
3. “所有字段都写成可选最灵活。”这会把校验责任推给每个使用者，制造大量非法状态。
4. 交叉类型 `A & B` 不是对象合并操作；冲突字段可能交叉成 `never`。

## 练习与自检

1. 给 `Job` 增加 `{ status: "cancelled"; reason: string }`，更新 `describe`。提示：先改联合再看编译器指引。
2. 设计 `Order` 的 `draft`、`paid`、`shipped` 状态，确保只有已支付状态有 `paidAt`，只有已发货状态有物流单号。

自检：`nickname?: string` 与 `nickname: string | undefined` 有何不同？为什么多个布尔值难以表示状态机？`readonly` 提供哪一层保障？

## 小结与下一章

结构化类型描述对象具备的能力，可辨识联合描述互斥业务状态。下一章将深入编译器如何沿 `if`、`switch` 和返回语句收窄这些联合。
