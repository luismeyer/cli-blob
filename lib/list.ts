import { Argv } from "yargs";

import { list } from "@vercel/blob";

import { resolveToken } from "./resolve-token";
import { sdkInfo } from "./sdk";
import { setApiUrl } from "./set-api-url";

export function listCommand(yargs: Argv<{}>) {
  yargs.command(
    "list",
    "List blobs",
    (yargs) =>
      yargs
        .option("cursor", {
          description: "The cursor to start listing from",
          type: "string",
          alias: "c",
        })
        .option("limit", {
          description: "The maximum number of blobs to list",
          type: "number",
          alias: "l",
        })
        .option("mode", {
          description: "The mode of the listing",
          choices: ["folded", "expanded"],
          type: "string",
          alias: "m",
        })
        .option("prefix", {
          description: "The prefix to filter the blobs",
          type: "string",
          alias: "p",
        })
        .option("token", {
          description: "The read write token for the blob store",
          type: "string",
          alias: "t",
        }),
    async (input) => {
      const { cursor, limit, mode, prefix } = input;

      await setApiUrl();

      const token = await resolveToken(input);
      const { fail, success } = sdkInfo(token);

      try {
        const res = await list({
          cursor,
          limit,
          mode: mode as "folded" | "expanded",
          prefix,
          token,
        });

        success(res);
      } catch (error) {
        fail(error);
      }
    }
  );
}
