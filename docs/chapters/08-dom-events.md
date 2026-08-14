# 08 DOM、事件与浏览器类型环境

> 资料核对日期：2026-08-14；基准：TypeScript 5.9、现代浏览器 DOM。

## 本章目标与前置知识

本章只补足 Node.js 开发者进入前端 TypeScript 所需的最低知识：DOM 查询的可空性、事件目标的宽类型、表单数据和环境类型库。你需要掌握泛型和收窄。完成后，应能在不滥用非空断言和类型断言的情况下处理表单事件。

## 官方资料怎么读

- [TypeScript DOM Manipulation](https://www.typescriptlang.org/docs/handbook/dom-manipulation.html)：重点读 `lib.dom.d.ts`、元素层次结构、`querySelector` 与事件。
- [MDN：Document.querySelector](https://developer.mozilla.org/docs/Web/API/Document/querySelector)：关注无匹配时返回 `null`，以及选择器错误。
- [MDN：EventTarget](https://developer.mozilla.org/docs/Web/API/EventTarget)：理解它是能接收事件的基础接口，不保证是 HTML 元素。
- [MDN：FormData](https://developer.mozilla.org/docs/Web/API/FormData) 与 [`get`](https://developer.mozilla.org/docs/Web/API/FormData/get)：关注返回值可能是字符串、文件或 `null`。
- [`lib` TSConfig 选项](https://www.typescriptlang.org/tsconfig/lib.html)：理解为何不同宿主应启用不同标准库声明。

TypeScript 自带的 `lib.dom.d.ts` 只是浏览器 API 的类型声明，不会在 Node 中创建 `document`。把 DOM 类型加入 `lib` 能让代码通过检查，但在 Node 运行访问 `document` 仍会抛错。

## 核心解读与心智模型

浏览器类型的第一原则是“查询可能失败”。`querySelector` 返回匹配元素或 `null`。泛型参数 `querySelector<HTMLFormElement>` 是对选择器结果类型的静态指定，不会验证页面上实际元素确实是表单；固定选择器通常可接受，但动态页面仍应考虑运行时检查。

事件系统的基础类型是 `EventTarget`，因为事件目标可能是元素、document、window 或其他实现。`event.target` 还可能因事件冒泡指向子元素；绑定回调时，直接使用已经收窄的闭包变量或 `event.currentTarget` 往往更可靠。

`FormData.get` 返回 `FormDataEntryValue | null`，而 `FormDataEntryValue` 是 `string | File`。因此不能直接调用字符串方法。需要 `typeof value === "string"`，文件上传则用 `value instanceof File`。

`lib` 描述编译时可用的宿主 API：后端通常需要 ES 与 Node 类型，前端需要 ES 与 DOM。一个仓库同时包含前后端时，应建立基础 tsconfig，再为 server/client 分别扩展，避免后端代码意外依赖浏览器全局变量。

## Demo 对照

打开 [src/08-dom-events.ts](../../src/08-dom-events.ts)。

`bindForm(document: Document)` 通过参数显式传入宿主，避免模块加载时直接访问 Node 中不存在的全局 `document`。查询结果先判断 `null`，之后整个闭包内的 `form` 都是 `HTMLFormElement`。

提交事件调用 `preventDefault`，然后从已确认的 `form` 构造 `FormData`。读取 `email` 后用 `typeof` 排除 `File` 和 `null`，才调用 `trim`。

该 Demo 在 Node 中只输出说明，因为 `Document` 类型在运行时被擦除：

```bash
npm run demo:08
npm run typecheck
```

真正浏览器练习可在 HTML 页面或 Vite 等构建环境中调用 `bindForm(document)`。

## Node.js 与前端协作场景

全栈项目常共享 DTO 和领域类型，但不应共享包含 Node `Buffer`、浏览器 `File` 或具体框架请求对象的类型。共享层保持宿主无关；服务端和客户端在边界处转换。

前端提交的表单即使通过 TS 检查，服务端仍必须重新校验。客户端类型提升开发体验，不构成安全边界。浏览器可能被绕过，客户端与服务器版本也可能不同。

## 常见误区与典型错误

1. `document.querySelector(...)!` 用非空断言掩盖页面结构变化，运行时仍可能空引用。
2. 把 `event.target` 直接断言成输入框，忽略冒泡和其他触发源。
3. 认为 `FormData.get` 一定返回字符串；文件字段返回 `File`，缺失返回 `null`。
4. 因为类型检查识别 `document`，就以为 Node 运行时也有该全局变量。
5. 前后端共用一个包含 DOM 和 Node 全局类型的 tsconfig，使错误依赖不再暴露。

## 练习与自检

1. 增加密码字段：查询失败时在页面显示错误；读取 FormData 后确认它是非空字符串，不使用 `!` 或 `as`。
2. 增加头像文件字段：用 `instanceof File` 收窄，并验证文件大小和 MIME 类型。

自检：`querySelector<T>` 会不会验证真实 DOM 标签？`target` 与 `currentTarget` 有何差别？为什么客户端已经校验，服务端仍必须再校验？

## 小结与后续方向

DOM 类型将浏览器固有的不确定性明确暴露出来：元素可能不存在，事件目标可能更宽，表单值可能有多种形态。完成本章后，可进入 [综合项目](../../PROJECT.md)，把类型建模、收窄、泛型、边界校验和工程配置组合起来。
