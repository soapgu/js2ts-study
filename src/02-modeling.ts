// 目标：用可辨识联合让非法状态不可表示。练习：增加 cancelled 状态和 reason。
type UserId = string;

interface User {
  readonly id: UserId;
  name: string;
  nickname?: string;
}

type Job =
  | { status: "queued"; createdAt: Date }
  | { status: "running"; createdAt: Date; startedAt: Date }
  | { status: "succeeded"; createdAt: Date; startedAt: Date; result: string }
  | { status: "failed"; createdAt: Date; startedAt: Date; error: Error };

function describe(job: Job): string {
  if (job.status === "succeeded") return `结果: ${job.result}`;
  if (job.status === "failed") return `失败: ${job.error.message}`;
  return job.status === "running" ? "运行中" : "排队中";
}

const user: User = { id: "u-1", name: "Ada" };
const job: Job = { status: "succeeded", createdAt: new Date(), startedAt: new Date(), result: "42" };
console.log("02", user.name, describe(job));
