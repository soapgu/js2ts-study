// 目标：观察推断、unknown 和 never。练习：让 parsePort 拒绝浮点数与越界端口。
const serviceName = "order-api"; // 推断为字面量可赋值给 string
let requestCount = 0; // 推断为 number

function parsePort(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  throw new TypeError("port 必须是数字");
}

function fail(message: string): never {
  throw new Error(message);
}

requestCount += 1;
console.log("01", { serviceName, requestCount, port: parsePort("3000") });
void fail; // 仅展示 never 签名，不实际抛错
