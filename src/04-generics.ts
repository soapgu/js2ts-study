// 目标：泛型保留输入输出关系。练习：为 groupBy 添加 keyof 约束并保留键类型。
interface Entity { id: string }

function indexById<T extends Entity>(items: readonly T[]): Map<string, T> {
  return new Map(items.map(item => [item.id, item]));
}

function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}

type ApiResult<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

function mapResult<T, U, E>(result: ApiResult<T, E>, fn: (value: T) => U): ApiResult<U, E> {
  return result.ok ? { ok: true, data: fn(result.data) } : result;
}

const users = [{ id: "u1", name: "Ada" }, { id: "u2", name: "Lin" }] as const;
const result = mapResult({ ok: true, data: first(users) } satisfies ApiResult<(typeof users)[number] | undefined>, user => user?.name);
console.log("04", indexById(users).get("u1")?.name, result);
