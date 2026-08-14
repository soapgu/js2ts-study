import { spawnSync } from "node:child_process";

for (const chapter of Array.from({ length: 8 }, (_, index) => String(index + 1).padStart(2, "0"))) {
  const result = spawnSync(process.execPath, [`src/${chapter}-${[
    "foundations", "modeling", "narrowing", "generics", "type-toolbox",
    "boundaries", "node-service", "dom-events"
  ][Number(chapter) - 1]}.ts`], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
