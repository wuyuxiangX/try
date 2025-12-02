import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { useTryDirectories } from "./hooks/useTryDirectories";
import { TryListItem } from "./components/TryListItem";
import { TRY_PATH } from "./lib/constants";

export default function BrowseCommand() {
  const { data: directories, isLoading, revalidate } = useTryDirectories();

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search try directories..." navigationTitle="Try Directories">
      <List.Section title="Try Directories" subtitle={TRY_PATH}>
        {directories?.map((directory) => (
          <TryListItem key={directory.path} directory={directory} onDelete={revalidate} />
        ))}
      </List.Section>
      {!isLoading && (!directories || directories.length === 0) && (
        <List.EmptyView
          icon={Icon.Folder}
          title="No try directories"
          description="Create your first try directory with the Create command"
          actions={
            <ActionPanel>
              <Action.Push title="Create New" icon={Icon.Plus} target={<CreateInlineForm onSuccess={revalidate} />} />
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}

import { Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { createTryDirectory, generateDatePrefix } from "./lib/utils";

function CreateInlineForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const { pop } = useNavigation();

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "Name required",
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
      onSuccess();
      pop();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to create directory",
        message: String(error),
      });
    }
  };

  return (
    <Form
      navigationTitle="Create Try Directory"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title="Name"
        placeholder="my-experiment"
        info={`Will create: ${generateDatePrefix()}-${name || "..."}`}
        value={name}
        onChange={setName}
      />
    </Form>
  );
}
