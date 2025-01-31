import { Table } from "console-table-printer";
import type { Argv } from "yargs";

import { listConfig, readConfig, writeConfig } from "./config";
import { maskBlobToken } from "./sdk";
import cliSelect from "cli-select";

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

function blurToken(token: string) {
  const stripLen = 32;
  const start = token.substring(0, stripLen);
  const masked = "*".repeat(30);
  return start + masked;
}

export function tokenCommand(yargs: Argv) {
  yargs.command(
    "token [sub] [name] [token]",
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
      if (!sub) {
        const config = await tokenConfig();
        if (!config) {
          return;
        }

        const currentProfile = await currentTokenConfig();

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
          data[2] = blurToken(data[2]);

          return data
            .map((content, index) => renderCell(index, content))
            .join("");
        }

        console.info("Select a Token profile:");

        const { value } = await cliSelect({
          values,
          defaultValue: currentProfile
            ? values.indexOf(currentProfile)
            : undefined,
          selected: "",
          unselected: "",
          valueRenderer: (key, selected) => {
            const value = config[key];

            const row = [key, value];
            if (selected) {
              row.unshift("◉");
            } else {
              row.unshift("◯");
            }

            return renderRow(row);
          },
        });

        await writeConfig(CurrentToken, value);

        console.info(`Current API updated: ${value}`);
        return;
      }

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
        const config = await tokenConfig();
        if (!config) {
          return;
        }

        const currentProfile = await currentTokenConfig();
        const table = new Table();

        for (const key in config) {
          table.addRow(
            { Name: key, Token: blurToken(config[key]) },
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

async function tokenConfig() {
  const config = await listConfig();

  if (!Object.keys(config).length) {
    console.info("No API config yet");
    return;
  }

  const out: Record<string, string> = {};
  for (const key in config) {
    if (key.startsWith(ProfilePrefix)) {
      out[key.substring(ProfilePrefix.length)] = config[key];
    }
  }

  return out;
}

async function currentTokenConfig() {
  const currentProfile = await readConfig<string>(CurrentToken);

  return currentProfile;
}
