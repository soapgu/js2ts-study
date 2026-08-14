// 目标：控制流收窄与穷尽检查。练习：新增 timeout 错误，观察 assertNever 的作用。
type AppError =
  | { kind: "validation"; fields: string[] }
  | { kind: "not-found"; resource: string }
  | { kind: "conflict"; version: number };

function assertNever(value: never): never {
  throw new Error(`未处理分支: ${JSON.stringify(value)}`);
}

function statusCode(error: AppError): number {
  switch (error.kind) {
    case "validation": return 400;
    case "not-found": return 404;
    case "conflict": return 409;
    default: return assertNever(error);
  }
}

function hasMessage(value: unknown): value is { message: string } {
  return typeof value === "object" && value !== null && "message" in value
    && typeof value.message === "string";
}

const caught: unknown = { message: "数据库离线" };
console.log("03", statusCode({ kind: "not-found", resource: "user" }), hasMessage(caught) ? caught.message : "未知错误");
