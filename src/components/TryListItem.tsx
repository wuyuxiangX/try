import { List, ActionPanel, Action, Icon, confirmAlert, Alert, showToast, Toast } from "@raycast/api";
import { rmSync } from "fs";
import { TryDirectory } from "../types";
import { formatRelativeTime } from "../lib/utils";
import { OpenWithSubmenu } from "./OpenWithSubmenu";

interface TryListItemProps {
  directory: TryDirectory;
  onDelete: () => void;
}

export function TryListItem({ directory, onDelete }: TryListItemProps) {
  const handleDelete = async () => {
    const confirmed = await confirmAlert({
      title: "Delete Directory",
      message: `Are you sure you want to delete "${directory.name}"? This cannot be undone.`,
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      try {
        rmSync(directory.path, { recursive: true, force: true });
        showToast({
          style: Toast.Style.Success,
          title: "Deleted",
          message: directory.name,
        });
        onDelete();
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "Failed to delete",
          message: String(error),
        });
      }
    }
  };

  return (
    <List.Item
      icon={Icon.Folder}
      title={directory.displayName || directory.name}
      subtitle={directory.datePrefix}
      accessories={[{ text: formatRelativeTime(directory.mtime) }]}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <OpenWithSubmenu path={directory.path} />
            <Action.ShowInFinder path={directory.path} />
            <Action.CopyToClipboard
              title="Copy Path"
              content={directory.path}
              shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.CreateQuicklink
              title="Create Quicklink"
              quicklink={{ link: directory.path, name: directory.displayName || directory.name }}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action
              title="Delete"
              icon={Icon.Trash}
              style={Action.Style.Destructive}
              shortcut={{ modifiers: ["cmd"], key: "backspace" }}
              onAction={handleDelete}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
