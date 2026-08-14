// 目标：把 unknown 解析成可信领域类型。练习：返回字段级错误，而不是单个字符串。
interface CreateUserInput { name: string; age?: number }

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function parseCreateUser(input: unknown): ParseResult<CreateUserInput> {
  if (typeof input !== "object" || input === null) return { ok: false, error: "必须是对象" };
  if (!("name" in input) || typeof input.name !== "string" || input.name.trim() === "") {
    return { ok: false, error: "name 必须是非空字符串" };
  }
  if ("age" in input && typeof input.age !== "number") return { ok: false, error: "age 必须是数字" };

  const value: CreateUserInput = { name: input.name.trim() };
  if ("age" in input) value.age = input.age;
  return { ok: true, value };
}

const raw: unknown = JSON.parse('{"name":" Ada ","age":36}');
console.log("06", parseCreateUser(raw));
