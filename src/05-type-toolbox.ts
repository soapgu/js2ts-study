// 目标：组合常见类型操作。练习：实现 Mutable<T> 与只允许字符串字段的 StringKeys<T>。
interface Account {
  id: string;
  email: string;
  active: boolean;
  profile: { displayName: string };
}

type AccountPatch = Partial<Pick<Account, "email" | "active" | "profile">>;
type EventName<T extends string> = `${T}:created` | `${T}:updated`;
type Nullable<T> = { [K in keyof T]: T[K] | null };
type UnwrapPromise<T> = T extends Promise<infer Value> ? Value : T;

const patch = { active: false } satisfies AccountPatch;
const event: EventName<"account"> = "account:updated";
const empty: Nullable<Pick<Account, "email" | "profile">> = { email: null, profile: null };
type LoadedAccount = UnwrapPromise<Promise<Account>>;
const loadedId: LoadedAccount["id"] = "a-1";
console.log("05", { patch, event, empty, loadedId });
