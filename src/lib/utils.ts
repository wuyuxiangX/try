import { readdirSync, statSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { TryDirectory } from "../types";
import { TRY_PATH } from "./constants";

export function getTryDirectories(): TryDirectory[] {
  if (!existsSync(TRY_PATH)) {
    mkdirSync(TRY_PATH, { recursive: true });
    return [];
  }

  const entries = readdirSync(TRY_PATH);
  const directories: TryDirectory[] = [];

  for (const name of entries) {
    if (name.startsWith(".")) continue;

    const fullPath = join(TRY_PATH, name);
    try {
      const stat = statSync(fullPath);
      if (!stat.isDirectory()) continue;

      const dateMatch = name.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);

      directories.push({
        name,
        path: fullPath,
        mtime: stat.mtime,
        ctime: stat.ctime,
        datePrefix: dateMatch?.[1],
        displayName: dateMatch?.[2] || name,
      });
    } catch {
      continue;
    }
  }

  return directories.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
}

export function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function generateDatePrefix(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createTryDirectory(name: string): string {
  const datePrefix = generateDatePrefix();
  const sanitizedName = name.replace(/\s+/g, "-").toLowerCase();
  const dirName = `${datePrefix}-${sanitizedName}`;
  const fullPath = join(TRY_PATH, dirName);

  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }

  return fullPath;
}
