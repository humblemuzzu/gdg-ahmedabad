import path from "node:path";

export function getRepoRoot(): string {
  return process.cwd();
}

export function getDataDir(): string {
  return path.join(getRepoRoot(), "data");
}

