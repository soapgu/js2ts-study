# 07 Node.js 工程配置、模块与分层

> 资料核对日期：2026-08-14；基准：TypeScript 5.9、Node.js 22.18+、ESM。

## 本章目标与前置知识

本章目标是理解 `tsconfig.json` 的关键选项、Node.js 的 ESM/CJS 判断方式，以及原生运行 TypeScript 的能力边界。你需要掌握接口、泛型和异步函数。完成后，应能解释项目为什么使用 `NodeNext`，也能区分类型检查、转译和执行。

## 官方资料怎么读

- [Node.js TypeScript 文档](https://nodejs.org/api/typescript.html)：重点读 Type stripping、模块系统、类型导入、`tsconfig` 限制和完整支持方案。
- [TypeScript Modules：Theory](https://www.typescriptlang.org/docs/handbook/modules/theory.html)：重点理解宿主环境决定模块规则，Node 同时支持 ESM/CJS。
- [Modules Reference：Node16/18/Next](https://www.typescriptlang.org/docs/handbook/modules/reference.html#node16-node18-node20-nodenext)：查看格式检测、解析和互操作规则。
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig/)：逐项查看本项目的 `strict`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`、`isolatedModules`、`erasableSyntaxOnly` 和 `verbatimModuleSyntax`。

## 核心解读与心智模型

将工具链拆成三个职责：

1. 类型检查：`tsc --noEmit` 分析类型，不生成文件。
2. 转译：删除类型，必要时转换语法和模块格式。
3. 执行：Node.js 运行 JavaScript，或先擦除可擦除的 TypeScript 语法再执行。

Node 原生类型擦除不会读取 `tsconfig.json`，也不会类型检查。它把可擦除类型语法替换为空白，因此本项目仍必须单独运行 `npm run typecheck`。`erasableSyntaxOnly` 限制代码只使用无需生成额外 JavaScript 的 TS 语法，使源码适合直接执行。

`module: "NodeNext"` 不等于“只输出 ESM”。它让 TypeScript 按当前 Node 的双模块规则判断每个文件。`.mts`/`.mjs` 固定为 ESM，`.cts`/`.cjs` 固定为 CJS；普通 `.ts`/`.js` 还要看最近的 `package.json` 的 `type`。本项目写了 `"type": "module"`，所以 `.ts` 按 ESM 处理。

类型和值属于不同空间。原生擦除下，纯类型导入必须写 `import type`，否则 Node 可能尝试在运行时导入一个根本不存在的值。`verbatimModuleSyntax` 让 TypeScript 对此保持明确，而不是静默重写导入。

严格选项表达真实风险：数组和索引访问可能没有值；可选属性缺失不等于显式 `undefined`；`catch` 值未知。它们增加的是边界可见性，不只是“更挑剔”。

## Demo 对照

打开 [src/07-node-service.ts](../../src/07-node-service.ts) 和 [tsconfig.json](../../tsconfig.json)。

`Repository<T extends Entity>` 是领域层所需的最小端口，`MemoryRepository` 是基础设施实现。`register` 依赖接口而不是具体 Map，因此可以替换为数据库仓储。泛型保证同一个仓储的输入和输出实体一致。

`findById` 返回 `Promise<T | undefined>`，诚实表达未找到。Demo 为了集中展示接口而抛出冲突异常；真实 API 可以将预期冲突改为 `Result<User, ConflictError>`。

源码没有 `enum`、参数属性等需要生成 JavaScript 的 TS 语法，因此 Node 可直接运行：

```bash
npm run demo:07
npm run typecheck
```

## Node.js 场景

服务分层可以按端口与适配器理解：领域服务定义它需要的仓储接口，数据库实现该接口。测试时注入内存实现。接口本身运行时不存在，所以若使用跨文件类型，应用 `import type`。

库发布与应用开发的配置不同。应用只需匹配自己的 Node 版本；发布 npm 库还要考虑声明文件、exports 条件和消费者模块系统，不应直接照搬本教程的 `noEmit` 配置。

路径别名值得谨慎：Node 原生类型擦除不会转换 `tsconfig paths`。可使用标准相对路径、package imports（`#name`）或完整构建工具链。

## 常见误区与典型错误

1. “Node 能运行 `.ts`，所以不需要 `tsc`。”运行不等于检查。
2. “`NodeNext` 就是 ESM 输出。”它模拟 Node 的 ESM/CJS 双格式规则。
3. 忘记 `import type`，原生执行时可能寻找不存在的运行时导出。
4. 认为 Node 会读取 `paths`、`target` 等 tsconfig 配置；原生类型擦除不会。
5. 用一个 tsconfig 同时服务 Node、浏览器、测试和库发布，导致环境类型混杂。

## 练习与自检

1. 给仓储和服务增加更新操作，使用可辨识联合返回“成功”或“不存在”，不要用 `as`。
2. 将实体和仓储拆成两个模块，使用带扩展名的 ESM 相对导入，并对纯类型使用 `import type`。

自检：`tsc --noEmit` 与 `node file.ts` 各负责什么？`package.json#type` 如何影响普通 `.ts`？为什么 paths 别名可能类型检查通过却运行失败？

## 小结与下一章

正确配置必须匹配真实运行宿主；Node 原生 TS 是轻量执行能力，不是完整编译器。下一章切换到浏览器宿主，观察 DOM 类型如何改变边界处理方式。
