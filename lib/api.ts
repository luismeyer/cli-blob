import { Table } from "console-table-printer";
import { Argv } from "yargs";

import { listConfig, readConfig, writeConfig } from "./config";

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
    "api <sub> [name] [url]",
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
        const config = await listConfig();

        if (!Object.keys(config).length) {
          console.info("No API config");
          return;
        }

        const currentProfile = await readConfig<string>(CurrentApi);

        const table = new Table();

        for (let key in config) {
          if (key.startsWith(ApiPrefix)) {
            const name = key.substring(ApiPrefix.length);

            table.addRow(
              {
                Name: name,
                URL: config[key],
              },
              {
                color: name === currentProfile ? "green" : "white",
              }
            );
          }
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
