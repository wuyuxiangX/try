import { execSync } from "child_process";
import { existsSync } from "fs";
import { TRY_CLI_PATH, TRY_PATH } from "./constants";

export function isTryCliAvailable(): boolean {
  return existsSync(TRY_CLI_PATH);
}

/**
 * Get the shell script output from try CLI
 */
function getTryScript(args: string[]): string {
  if (!isTryCliAvailable()) {
    throw new Error(`Try CLI not found at ${TRY_CLI_PATH}`);
  }

  const quotedArgs = args.map((arg) => `'${arg.replace(/'/g, "'\\''")}'`).join(" ");
  const cmd = `/usr/bin/env ruby '${TRY_CLI_PATH}' --path '${TRY_PATH}' ${quotedArgs}`;

  return execSync(cmd, { encoding: "utf8" });
}

/**
 * Execute the shell script commands from try CLI output
 * Skips: comments, cd, echo, touch commands
 * Executes: mkdir, git clone
 * Returns: the created directory path
 */
function executeScript(script: string): string {
  let createdPath = "";

  // Extract the directory path from mkdir command
  const pathMatch = script.match(/mkdir -p '([^']+)'/);
  if (pathMatch) {
    createdPath = pathMatch[1];
  }

  // Parse and execute commands
  const lines = script.split(/\s*&&\s*\\\s*\n|\s*&&\s*/);

  for (const line of lines) {
    const cmd = line.trim();

    // Skip empty, comments, cd, echo, touch
    if (
      !cmd ||
      cmd.startsWith("#") ||
      cmd.startsWith("cd ") ||
      cmd.startsWith("echo ") ||
      cmd.startsWith("touch ") ||
      cmd.startsWith("(")
    ) {
      continue;
    }

    // Execute mkdir and git clone
    if (cmd.startsWith("mkdir") || cmd.startsWith("git clone")) {
      execSync(cmd, { encoding: "utf8", stdio: "pipe" });
    }
  }

  return createdPath;
}

/**
 * Clone a git repository using try CLI
 * @param url - Git repository URL
 * @param name - Optional custom name for the directory
 * @returns The path to the cloned directory
 */
export function tryClone(url: string, name?: string): string {
  const args = ["clone", url];
  if (name) args.push(name);
  const script = getTryScript(args);
  return executeScript(script);
}

/**
 * Create a worktree using try CLI
 * @param repoPath - Path to the git repository
 * @param name - Optional custom name for the worktree
 * @returns The path to the created worktree
 */
export function tryWorktree(repoPath: string, name?: string): string {
  const args = ["worktree", repoPath];
  if (name) args.push(name);
  const script = getTryScript(args);
  return executeScript(script);
}
