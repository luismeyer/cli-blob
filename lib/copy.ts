import { Argv } from "yargs";

import { copy } from "@vercel/blob";

import { baseArgs } from "./base-args";
import { setApiUrl } from "./set-api-url";
import { resolveToken } from "./resolve-token";
import { sdkInfo } from "./sdk";

export function copyCommand(yargs: Argv<{}>) {
  yargs.command(
    "copy <fromUrl> <toPathname>",
    "Copy a blob",
    (yargs) =>
      baseArgs(yargs)
        .positional("fromUrl", {
          description: "The URL of the blob to copy",
          type: "string",
        })
        .positional("toPathname", {
          description: "The pathname of the new blob",
          type: "string",
        })
        .option("add-random-suffix", {
          description: "Whether to add a random suffix",
          type: "boolean",
          default: false,
          alias: "a",
        })
        .option("content-type", {
          description: "The content type of the blob",
          type: "string",
          alias: "c",
        })
        .option("cache-control-max-age", {
          description: "The max age of the cache control",
          type: "number",
          alias: "m",
        }),
    async (input) => {
      const {
        fromUrl,
        toPathname,
        addRandomSuffix,
        contentType,
        cacheControlMaxAge,
      } = input;

      if (!fromUrl || !toPathname) {
        console.error("fromUrl and toPathname are required");
        return;
      }

      await setApiUrl();

      const token = await resolveToken(input);
      const { fail, success } = sdkInfo(token);

      try {
        const res = await copy(fromUrl, toPathname, {
          access: "public",
          addRandomSuffix,
          contentType,
          cacheControlMaxAge,
          token,
        });

        success(res);
      } catch (error) {
        fail(error);
      }
    }
  );
}
