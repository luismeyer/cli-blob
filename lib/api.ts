import { Table } from "console-table-printer";
import { Argv } from "yargs";

import { listConfig, readConfig, writeConfig } from "./config";

export const CurrentApi = "current-api";
export const ApiPrefix = "api-";

export function createApiKey(name: string): string {
  return `${ApiPrefix}${name}`;
}

export function apiCommand(yargs: Argv<{}>) {
  yargs.command(
    "api <sub> [name] [url]",
    "Configure API settings",
    (yargs) =>
      yargs
        .positional("sub", {
          description: "Subcommand",
          type: "string",
          choices: ["set", "rm", "ls", "use", "current"],
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
      if (sub === "set") {
        if (!name || !url) {
          console.error("name and url are required");
          return;
        }

        await writeConfig(createApiKey(name), url);
        console.info("API config updated");

        return;
      }

      if (sub === "rm") {
        if (!name) {
          console.error("name is required");
          return;
        }

        await writeConfig(createApiKey(name), null);
        console.info("API config removed");

        return;
      }

      if (sub === "ls") {
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

      if (sub === "use") {
        if (!name) {
          console.error("name is required");
          return;
        }

        await writeConfig(CurrentApi, name);

        console.info("Current API updated");
        return;
      }

      if (sub === "current") {
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
