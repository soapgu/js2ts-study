# 定制教程与知识地图

## 你已有的优势与需要补齐的部分

Node.js 经验意味着你已经熟悉 JavaScript、异步 I/O、模块和 npm。学习时可以跳过变量、Promise 等 JS 基础，把精力放在“类型如何描述程序”。需要特别补齐的是：结构化类型、控制流分析、类型与运行时边界、ESM 配置，以及浏览器 DOM API 自带的可空性和事件类型。

## 第一阶段：从 JavaScript 思维切换到类型建模

### 01 推断、注解与 `any`/`unknown`/`never`

- 类型注解不是越多越好；局部变量通常交给推断。
- `any` 关闭检查并会传播；`unknown` 强迫使用者先证明。
- `never` 表示不可能出现的值，适合穷尽性检查。
- `strict` 是学习和新项目的默认起点。

学习资料：[第 01 章精读讲义](./docs/chapters/01-foundations.md) · [Demo](./src/01-foundations.ts)

### 02 对象类型与业务状态

- `interface` 和 `type` 都能描述对象；联合、元组、交叉通常使用 `type` 更自然。
- `prop?: T` 表示属性可能不存在，不完全等同于 `prop: T | undefined`。
- 字面量类型 + 可辨识联合能让非法状态不可表示。
- `readonly` 是编译期约束，不会在运行时冻结对象。

学习资料：[第 02 章精读讲义](./docs/chapters/02-modeling.md) · [Demo](./src/02-modeling.ts)

## 第二阶段：让类型跟随程序流动

### 03 收窄与穷尽性

掌握 `typeof`、`in`、`instanceof`、真值判断、自定义类型守卫，以及 `switch` + `never`。后端最常见的落点是错误分类、消息处理和外部输入解析。

学习资料：[第 03 章精读讲义](./docs/chapters/03-narrowing.md) · [Demo](./src/03-narrowing.ts)

### 04 函数与泛型

- 可选参数、默认参数、剩余参数和函数类型。
- 泛型参数应表达关系，例如 `getById<T>(items: T[]): T | undefined`。
- 约束 `T extends ...` 只要求最低能力。
- 重载用于调用方式确实不同的公共 API；普通联合类型能解决时不要重载。

学习资料：[第 04 章精读讲义](./docs/chapters/04-generics.md) · [Demo](./src/04-generics.ts)

## 第三阶段：读懂常见库类型

### 05 类型操作工具箱

学习顺序：`typeof` → `keyof` → `T[K]` → 泛型 → 映射类型 → 条件类型。重点是能读懂库声明和消除重复，不追求复杂“类型体操”。常用内置工具包括 `Pick`、`Omit`、`Partial`、`Required`、`Record`、`Parameters`、`ReturnType`、`Awaited`。

学习资料：[第 05 章精读讲义](./docs/chapters/05-type-toolbox.md) · [Demo](./src/05-type-toolbox.ts)

## 第四阶段：真实 Node.js 工程

### 06 类型系统的边界

HTTP body、环境变量、JSON、数据库结果在运行时都不因 `as User` 而变安全。正确流程是：`unknown` → 检查/解析 → 领域类型。类型断言只告诉编译器“相信我”，不会生成校验代码。

学习资料：[第 06 章精读讲义](./docs/chapters/06-boundaries.md) · [Demo](./src/06-boundaries.ts)

### 07 配置、模块与分层

- `target` 描述输出 JavaScript 的语言级别，`lib` 描述可用环境 API。
- Node.js 项目使用 `module: NodeNext`，让检查规则贴近 Node 的 ESM/CJS 行为。
- ESM 相对导入在编译输出模式下通常写 `.js` 扩展。
- `import type` 明确只在类型空间使用，避免不必要的运行时导入。
- `noUncheckedIndexedAccess` 和 `exactOptionalPropertyTypes` 会暴露真实边界问题。

学习资料：[第 07 章精读讲义](./docs/chapters/07-node-service.md) · [Demo](./src/07-node-service.ts)

## 第五阶段：最低限度的前端类型知识

### 08 DOM 与事件

浏览器代码最重要的三个事实：查询元素可能返回 `null`；`EventTarget` 不保证有具体元素属性；前后端使用不同的 `lib`。真实项目中应拆分 Node 与浏览器的 tsconfig，前端项目通常由构建工具负责输出、`tsc` 只做检查。

学习资料：[第 08 章精读讲义](./docs/chapters/08-dom-events.md) · [Demo](./src/08-dom-events.ts)

## 四周建议计划

- 第 1 周：01–03。每天修改一个联合类型，刻意触发并理解 3 个编译错误。
- 第 2 周：04–05。为熟悉的分页、缓存、事件总线 API 写泛型，控制在实用范围。
- 第 3 周：06–07。把一个现有 JS 小模块迁移为 strict TS，记录每类错误的根因。
- 第 4 周：08 + 综合项目。先写领域类型和边界解析，再补实现和测试。

每章采用“阅读精读讲义 → 预测 Demo → 运行 → 完成练习 → 类型检查 → 回答自检题”的节奏。判断是否掌握的标准不是记住语法，而是能解释：这个类型阻止了哪种线上错误，它是否只在编译期有效。

## 逐章官方资料精读

| 章节 | 讲义重点 | 入口 |
|---|---|---|
| 01 | 推断、注解、`any`、`unknown`、`never`、`strict` | [开始阅读](./docs/chapters/01-foundations.md) |
| 02 | 结构化类型、对象属性、可辨识联合、状态建模 | [开始阅读](./docs/chapters/02-modeling.md) |
| 03 | 控制流分析、类型守卫、谓词、穷尽检查 | [开始阅读](./docs/chapters/03-narrowing.md) |
| 04 | 函数、泛型推断、约束、默认参数和设计原则 | [开始阅读](./docs/chapters/04-generics.md) |
| 05 | `keyof`、索引访问、映射、条件和工具类型 | [开始阅读](./docs/chapters/05-type-toolbox.md) |
| 06 | 类型擦除、外部输入、运行时校验和领域边界 | [开始阅读](./docs/chapters/06-boundaries.md) |
| 07 | TSConfig、NodeNext、ESM/CJS 和原生类型擦除 | [开始阅读](./docs/chapters/07-node-service.md) |
| 08 | DOM 可空性、事件目标、表单和浏览器类型环境 | [开始阅读](./docs/chapters/08-dom-events.md) |

每篇讲义都提供官方原始页面和建议阅读范围；文中的中文内容是面向本课程的归纳解读，不替代官方文档本身。
