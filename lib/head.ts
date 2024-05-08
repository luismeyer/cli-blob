import { Argv } from "yargs";

import { head } from "@vercel/blob";

import { baseArgs } from "./base-args";
import { resolveToken } from "./resolve-token";
import { sdkInfo } from "./sdk";
import { setApiUrl } from "./set-api-url";

export function headCommand(yargs: Argv<{}>) {
  yargs.command(
    "head <url>",
    "Get details of the blob",
    (yargs) =>
      baseArgs(yargs).positional("url", {
        description: "The URL of the blob",
        type: "string",
      }),
    async (input) => {
      const { url } = input;

      if (!url) {
        console.error("url is required");
        return;
      }

      await setApiUrl();

      const token = await resolveToken(input);
      const { fail, success } = sdkInfo(token);

      try {
        const res = await head(url, { token });

        success(res);
      } catch (error) {
        fail(error);
      }
    }
  );
}
