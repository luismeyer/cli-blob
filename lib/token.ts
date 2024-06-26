import { printTable, Table } from "console-table-printer";
import { Argv } from "yargs";

import { listConfig, readConfig, writeConfig } from "./config";
import { maskBlobToken } from "./sdk";

export const CurrentToken = "current-token";
export const ProfilePrefix = "token-";

export function createTokenKey(name: string): string {
  return `${ProfilePrefix}${name}`;
}

const SetCommand = "set";
const RmCommand = "rm";
const LsCommand = "ls";
const UseCommand = "use";
const CurrentCommand = "curr";

export function tokenCommand(yargs: Argv<{}>) {
  yargs.command(
    "token <sub> [name] [token]",
    "Configure Token settings",
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
          description: "Profile name",
          type: "string",
        })
        .positional("token", {
          description: "Blob RW token",
          type: "string",
        }),
    async ({ sub, token, name }) => {
      if (sub === SetCommand) {
        if (!name || !token) {
          console.error("name and token are required");
          return;
        }

        await writeConfig(createTokenKey(name), token);
        console.info("Token updated");

        return;
      }

      if (sub === RmCommand) {
        if (!name) {
          console.error("name is required");
          return;
        }

        await writeConfig(createTokenKey(name), null);
        console.info("Token removed");

        return;
      }

      if (sub === LsCommand) {
        const config = await listConfig();

        if (!Object.keys(config).length) {
          console.info("No Tokens setup");
          return;
        }

        const currentProfile = await readConfig<string>(CurrentToken);

        const table = new Table();

        for (let key in config) {
          if (key.startsWith(ProfilePrefix)) {
            const name = key.substring(ProfilePrefix.length);
            table.addRow(
              {
                Name: name,
                BLOB_READ_WRITE_TOKEN: maskBlobToken(config[key]),
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

        const token = await readConfig<string>(createTokenKey(name));
        if (!token) {
          console.error("Token not found");
          return;
        }

        await writeConfig(CurrentToken, name);

        console.info("Current Token updated");
        return;
      }

      if (sub === CurrentCommand) {
        const currentName = await readConfig<string>(CurrentToken);
        if (!currentName) {
          console.info("Current Token not set");
          return;
        }

        const token = await readConfig<string>(createTokenKey(currentName));
        if (!token) {
          console.error("Token not found");
          return;
        }

        console.info("Current Token:\n");
        console.info("Name:", currentName);
        console.info("Value:", maskBlobToken(token));

        return;
      }
    }
  );
}
