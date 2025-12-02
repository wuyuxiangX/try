import { Form, ActionPanel, Action, showToast, Toast, showInFinder } from "@raycast/api";
import { useState } from "react";
import { execSync } from "child_process";
import { join } from "path";
import { TRY_PATH } from "./lib/constants";
import { generateDatePrefix } from "./lib/utils";

function parseGitUrl(url: string): { user: string; repo: string } | null {
  const cleanUrl = url.replace(/\.git$/, "");

  const patterns = [
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)/,
    /^git@github\.com:([^/]+)\/([^/]+)/,
    /^https?:\/\/[^/]+\/([^/]+)\/([^/]+)/,
    /^git@[^:]+:([^/]+)\/([^/]+)/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match) {
      return { user: match[1], repo: match[2] };
    }
  }

  return null;
}

export default function CloneCommand() {
  const [url, setUrl] = useState("");
  const [customName, setCustomName] = useState("");
  const [isCloning, setIsCloning] = useState(false);

  const handleSubmit = async () => {
    if (!url.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "URL required",
        message: "Please enter a git repository URL",
      });
      return;
    }

    const parsed = parseGitUrl(url);
    if (!parsed && !customName) {
      showToast({
        style: Toast.Style.Failure,
        title: "Invalid URL",
        message: "Could not parse git URL. Please provide a custom name.",
      });
      return;
    }

    const datePrefix = generateDatePrefix();
    const dirName = customName
      ? `${datePrefix}-${customName.replace(/\s+/g, "-").toLowerCase()}`
      : `${datePrefix}-${parsed!.user}-${parsed!.repo}`;
    const targetPath = join(TRY_PATH, dirName);

    setIsCloning(true);

    try {
      showToast({
        style: Toast.Style.Animated,
        title: "Cloning...",
        message: url,
      });

      execSync(`git clone '${url}' '${targetPath}'`, {
        encoding: "utf8",
        stdio: "pipe",
      });

      showToast({
        style: Toast.Style.Success,
        title: "Cloned successfully",
        message: dirName,
      });

      await showInFinder(targetPath);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Clone failed",
        message: String(error),
      });
    } finally {
      setIsCloning(false);
    }
  };

  const parsed = parseGitUrl(url);
  const datePrefix = generateDatePrefix();
  const previewName = customName
    ? `${datePrefix}-${customName.replace(/\s+/g, "-").toLowerCase()}`
    : parsed
      ? `${datePrefix}-${parsed.user}-${parsed.repo}`
      : `${datePrefix}-...`;

  return (
    <Form
      navigationTitle="Clone to Try Directory"
      isLoading={isCloning}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Clone Repository" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="url"
        title="Git URL"
        placeholder="https://github.com/user/repo.git"
        value={url}
        onChange={setUrl}
      />
      <Form.TextField
        id="customName"
        title="Custom Name"
        placeholder="(optional) Override directory name"
        value={customName}
        onChange={setCustomName}
      />
      <Form.Description title="Preview" text={previewName} />
    </Form>
  );
}
