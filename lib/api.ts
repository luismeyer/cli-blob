import { Table } from "console-table-printer";
import { Argv } from "yargs";

import { listConfig, readConfig, writeConfig } from "./config";
import cliSelect from "cli-select";

export const CurrentApi = "current-api";
export const ApiPrefix = "api-";

export function createApiKey(name: string): string {
  return `${ApiPrefix}${name}`;
}

const SetCommand = "set";
const RmCommand = "rm";
const LsCommand = "ls";
const UseCommand = "use";
const CurrentCommand = "curr";

export function apiCommand(yargs: Argv<{}>) {
  yargs.command(
    "api [sub] [name] [url]",
    "Configure API settings",
    (yargs) =>
      yargs
        .positional("sub", {
          description: "Subcommand",
          type: "string",
          choices: [
            SetCommand,
            RmCommand,
            LsCommand,
            UseCommand,
            CurrentCommand,
          ],
        })
        .positional("name", {
          description: "API name",
          type: "string",
        })
        .positional("url", {
          description: "API URL",
          type: "string",
        }),
    async ({ sub, url, name }) => {
      if (!sub) {
        const config = await apiConfig();
        if (!config) {
          return;
        }

        const currentProfile = await currentApiConfig();

        const values = Object.keys(config);

        const colWidths = Object.entries(config).reduce<number[]>(
          (acc, [key, value]) => {
            acc[0] = 1;
            acc[1] = Math.max(acc[1], key.length);
            acc[2] = Math.max(acc[2], value.length);

            return acc;
          },
          [1, 1, 1]
        );

        const padding = " ".repeat(4);

        function renderCell(index: number, content: string) {
          const offset = colWidths[index] - content.length;
          return content + " ".repeat(offset) + padding;
        }

        function renderRow(data: string[]) {
          return data
            .map((content, index) => renderCell(index, content))
            .join("");
        }

        console.info("Select an API profile:");

        const { value } = await cliSelect({
          values,
          defaultValue: currentProfile
            ? values.indexOf(currentProfile)
            : undefined,
          selected: "",
          unselected: "",
          valueRenderer: (key, selected) => {
            const value = config[key];

            let row = [key, value];
            if (selected) {
              row.unshift("◉");
            } else {
              row.unshift("◯");
            }

            return renderRow(row);
          },
        });

        await writeConfig(CurrentApi, value);

        console.info("Current API updated: " + value);
        return;
      }

      if (sub === SetCommand) {
        if (!name || !url) {
          console.error("name and url are required");
          return;
        }

        await writeConfig(createApiKey(name), url);
        console.info("API config updated");

        return;
      }

      if (sub === RmCommand) {
        if (!name) {
          console.error("name is required");
          return;
        }

        await writeConfig(createApiKey(name), null);
        console.info("API config removed");

        return;
      }

      if (sub === LsCommand) {
        const config = await apiConfig();
        if (!config) {
          return;
        }

        const currentProfile = await currentApiConfig();
        const table = new Table();

        for (const key in config) {
          table.addRow(
            { Name: key, URL: config[key] },
            { color: key === currentProfile ? "green" : "white" }
          );
        }

        table.printTable();

        return;
      }

      if (sub === UseCommand) {
        if (!name) {
          console.error("name is required");
          return;
        }

        const api = await readConfig<string>(createApiKey(name));
        if (!api) {
          console.error("API not found");
          return;
        }

        await writeConfig(CurrentApi, name);

        console.info("Current API updated");
        return;
      }

      if (sub === CurrentCommand) {
        const currentName = await readConfig<string>(CurrentApi);
        if (!currentName) {
          console.info("Current API not set");
          return;
        }

        const url = await readConfig<string>(createApiKey(currentName));
        if (!url) {
          console.error("API not found");
          return;
        }

        console.info("Current API:\n");
        console.info("Name:", currentName);
        console.info("Value:", url);

        return;
      }
    }
  );
}

async function apiConfig() {
  const config = await listConfig();

  if (!Object.keys(config).length) {
    console.info("No API config yet");
    return;
  }

  let out: Record<string, string> = {};
  for (let key in config) {
    if (key.startsWith(ApiPrefix)) {
      out[key.substring(ApiPrefix.length)] = config[key];
    }
  }

  return out;
}

async function currentApiConfig() {
  const currentProfile = await readConfig<string>(CurrentApi);

  return currentProfile;
}
