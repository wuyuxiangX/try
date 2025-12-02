import { Form, ActionPanel, Action, showToast, Toast, showInFinder, getApplications, open } from "@raycast/api";
import { useState } from "react";
import { createTryDirectory, generateDatePrefix } from "./lib/utils";

export default function CreateCommand() {
  const [name, setName] = useState("");
  const [openWith, setOpenWith] = useState<string>("finder");

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "Name required",
        message: "Please enter a directory name",
      });
      return;
    }

    try {
      const path = createTryDirectory(name);

      showToast({
        style: Toast.Style.Success,
        title: "Created",
        message: path,
      });

      if (openWith === "finder") {
        await showInFinder(path);
      } else if (openWith !== "none") {
        const apps = await getApplications();
        const app = apps.find((a) => a.bundleId === openWith || a.name === openWith);
        if (app) {
          await open(path, app);
        }
      }
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to create directory",
        message: String(error),
      });
    }
  };

  const datePrefix = generateDatePrefix();
  const previewName = name ? `${datePrefix}-${name.replace(/\s+/g, "-").toLowerCase()}` : `${datePrefix}-...`;

  return (
    <Form
      navigationTitle="Create Try Directory"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Directory" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Directory Name" placeholder="my-experiment" value={name} onChange={setName} />
      <Form.Description title="Preview" text={previewName} />
      <Form.Dropdown id="openWith" title="After Creation" value={openWith} onChange={setOpenWith}>
        <Form.Dropdown.Item value="finder" title="Show in Finder" icon="finder.png" />
        <Form.Dropdown.Item value="com.apple.Terminal" title="Open in Terminal" />
        <Form.Dropdown.Item value="com.microsoft.VSCode" title="Open in VS Code" />
        <Form.Dropdown.Item value="com.todesktop.230313mzl4w4u92" title="Open in Cursor" />
        <Form.Dropdown.Item value="dev.warp.Warp-Stable" title="Open in Warp" />
        <Form.Dropdown.Item value="none" title="Do Nothing" />
      </Form.Dropdown>
    </Form>
  );
}
