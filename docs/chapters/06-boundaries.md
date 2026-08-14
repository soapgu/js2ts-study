# 06 类型系统的边界与运行时校验

> 资料核对日期：2026-08-14；基准：TypeScript 5.9。

## 本章目标与前置知识

本章目标是建立后端 TypeScript 最重要的边界意识：静态类型只检查源码，不会验证网络、文件或数据库中的真实值。你需要掌握 `unknown`、对象类型和收窄。完成后，应能设计 `unknown → ParseResult<Domain>` 的输入管线，并拒绝用断言替代校验。

## 官方资料怎么读

- [TypeScript Handbook：Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)：重点理解断言会被编译器移除，且不执行检查。
- [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)：复习对 `unknown` 的逐层证明。
- [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)：理解结构兼容是编译期规则。
- [Node.js TypeScript：Type stripping](https://nodejs.org/api/typescript.html#type-stripping)：观察 Node 如何擦除类型，以及为何它不会做类型检查。

官方资料共同指向一个事实：类型注解和断言在运行时不存在。`JSON.parse(text) as User` 不会检查字段，也不会把日期字符串变成 `Date`。

## 核心解读与心智模型

把应用分成“不可信域”和“可信域”。HTTP body、环境变量、命令行参数、缓存、数据库行和第三方响应都属于不可信域，即使它们由自己控制的服务产生，也可能因为版本、脏数据或部署配置而偏离预期。

边界解析器承担三件事：检查数据形状、执行业务约束、构造领域值。成功后，内部代码才可以依赖领域类型。一个清晰的数据流是：

```text
unknown 原始值 → 运行时解析 → ParseResult<CreateUserInput> → 领域服务
```

这里使用可辨识联合返回结果，使预期的输入错误成为普通控制流，而不是异常。异常更适合不可预期的基础设施失败。

类型校验与业务校验也要区分。`typeof age === "number"` 只证明类型；年龄是否为有限数、整数、非负值属于业务规则。`Number.NaN` 的 `typeof` 也是 `number`。

大型项目可以使用 Zod、Valibot、JSON Schema 等工具减少手写校验，但原则不变：运行时解析产生可信类型。库的类型推断不能替代实际调用解析函数。

## Demo 对照

打开 [src/06-boundaries.ts](../../src/06-boundaries.ts)。

`parseCreateUser(input: unknown)` 先排除非对象和 `null`，再用 `in` 确认 `name` 存在，并用 `typeof` 与业务规则检查非空字符串。只有验证完成，才能构造 `CreateUserInput`。

可选 `age` 的检查和赋值位于同一分支：

```ts
if ("age" in input) {
  if (typeof input.age !== "number") return { ok: false, error: "age 必须是数字" };
  value.age = input.age;
}
```

这样控制流连续地证明 `input.age` 从 `unknown` 收窄到 `number`。如果用 `as number`，错误输入仍会穿透边界。

`JSON.parse` 在标准库中返回宽松类型，Demo 主动把结果变量声明为 `unknown`，恢复安全检查责任。

运行：

```bash
npm run demo:06
npm run typecheck
```

## Node.js 场景

在 Express/Fastify 路由中，不要让未经解析的 `request.body` 直接进入服务层。路由或专门适配器负责解析，服务层只接收 `CreateUserInput`。环境变量也应在进程启动时一次性解析成 `AppConfig`；配置非法应尽早失败，而不是把 `string | undefined` 传播到整个应用。

数据库类型通常根据 schema 或 ORM 生成，但运行时仍可能遇到迁移不完整、手工写入或旧版本数据。关键领域约束应有数据库约束和运行时检查共同保护。

## 常见误区与典型错误

1. `as User` 是静态断言，不是反序列化或校验。
2. 只检查 `typeof value === "object"` 会把 `null` 放进来。
3. 只验证字段类型，不检查 `NaN`、空白字符串、范围和字段组合等业务规则。
4. 每一层重复解析同一对象。应在边界验证一次，然后传递可信领域值。

## 练习与自检

1. 把错误从单个字符串改为字段级数组：`{ field, message }[]`，分别覆盖 `name` 和 `age`。
2. 扩展年龄规则：必须是 0–150 的有限整数，并添加有效、浮点、`NaN`、字符串和越界用例。

自检：类型断言会生成什么 JavaScript？类型校验和业务校验有何区别？边界解析应放在路由层还是领域服务深处？

## 小结与下一章

类型安全必须从运行时验证开始：先解析，再让领域代码相信类型。下一章将把这一原则放进完整的 Node.js 配置、模块和服务分层环境。
