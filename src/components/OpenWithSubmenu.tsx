import { ActionPanel, Action, Icon, getApplications } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";

interface OpenWithSubmenuProps {
  path: string;
}

const PREFERRED_APPS = [
  "Finder",
  "Terminal",
  "Warp",
  "iTerm",
  "Visual Studio Code",
  "Code - Insiders",
  "Cursor",
  "WebStorm",
  "Sublime Text",
  "Nova",
  "BBEdit",
  "TextMate",
];

export function OpenWithSubmenu({ path }: OpenWithSubmenuProps) {
  const { data: apps, isLoading } = useCachedPromise(
    async () => {
      const allApps = await getApplications();
      return allApps.filter((app) => PREFERRED_APPS.some((name) => app.name.includes(name)));
    },
    [],
    {
      keepPreviousData: true,
    },
  );

  if (isLoading || !apps || apps.length === 0) {
    return null;
  }

  return (
    <ActionPanel.Submenu title="Open with…" icon={Icon.AppWindow}>
      {apps.map((app) => (
        <Action.Open
          key={app.bundleId || app.name}
          title={app.name}
          target={path}
          application={app}
          icon={{ fileIcon: app.path }}
        />
      ))}
    </ActionPanel.Submenu>
  );
}
