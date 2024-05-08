import { Argv } from "yargs";

import { del } from "@vercel/blob";

import { baseArgs } from "./base-args";
import { resolveToken } from "./resolve-token";
import { sdkInfo } from "./sdk";
import { setApiUrl } from "./set-api-url";

export function delCommand(yargs: Argv<{}>) {
  yargs.command(
    "del <urls...>",
    "Delete blobs",
    (yargs) =>
      baseArgs(yargs).positional("urls", {
        description: "The URLs of the blobs to delete",
        array: true,
        type: "string",
      }),
    async (input) => {
      const { urls } = input;

      if (!urls || urls.length === 0) {
        console.error("urls is required");
        return;
      }

      await setApiUrl();

      const token = await resolveToken(input);
      const { fail, success } = sdkInfo(token);

      try {
        await del(urls, { token });

        success(`Deleted ${urls.length} blob${urls.length > 1 ? "s" : ""}`);
      } catch (error) {
        fail(error);
      }
    }
  );
}
