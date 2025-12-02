import { execSync } from "child_process";
import { existsSync } from "fs";
import { TRY_CLI_PATH, TRY_PATH } from "./constants";

export function isTryCliAvailable(): boolean {
  return existsSync(TRY_CLI_PATH);
}

export function execTryCli(args: string[]): string {
  if (!isTryCliAvailable()) {
    throw new Error(`Try CLI not found at ${TRY_CLI_PATH}`);
  }

  const quotedArgs = args.map((arg) => `'${arg.replace(/'/g, "'\\''")}'`).join(" ");
  const cmd = `/usr/bin/env ruby '${TRY_CLI_PATH}' --path '${TRY_PATH}' ${quotedArgs}`;

  return execSync(cmd, { encoding: "utf8" });
}

export function cloneRepo(url: string, name?: string): string {
  const args = ["clone", url];
  if (name) args.push(name);
  return execTryCli(args);
}

export function createWorktree(repoPath: string, name?: string): string {
  const args = ["worktree", repoPath];
  if (name) args.push(name);
  return execTryCli(args);
}
