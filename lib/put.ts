import { Argv } from "yargs";

import { put } from "@vercel/blob";

import { baseArgs } from "./base-args";
import { resolveToken } from "./resolve-token";
import { sdkInfo } from "./sdk";
import { setApiUrl } from "./set-api-url";

export function putCommand(yargs: Argv<{}>) {
  yargs.command(
    "put <pathname> <body>",
    "Creates a new blob",
    (yargs) =>
      baseArgs(yargs)
        .positional("pathname", {
          description: "The pathname of the blob",
          type: "string",
        })
        .positional("body", {
          description: "The body of the blob",
          type: "string",
        })
        .option("multipart", {
          description: "Whether to use multipart upload",
          type: "boolean",
          default: false,
          alias: "p",
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
        pathname,
        body,
        multipart,
        addRandomSuffix,
        contentType,
        cacheControlMaxAge,
      } = input;

      if (!pathname || !body) {
        console.error("pathname and body are required");
        return;
      }

      await setApiUrl();

      const token = await resolveToken(input);
      const { fail, success } = sdkInfo(token);

      let uploadBody: string | Buffer | Blob = body;

      try {
        const fileBody = Bun.file(body);

        if (await fileBody.exists()) {
          uploadBody = fileBody;
        }

        const res = await put(pathname, uploadBody, {
          access: "public",
          multipart,
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
