import { Argv } from "yargs";

import { list } from "@vercel/blob";

import { setApiUrl } from "./set-api-url";
import { resolveToken } from "./resolve-token";
import { sdkInfo } from "./sdk";
import { baseArgs } from "./base-args";

export function pingCommand(yargs: Argv<{}>) {
  yargs.command(
    "$0",
    "ping blob API",
    (yargs) => baseArgs(yargs),
    async (input) => {
      await setApiUrl();

      const token = await resolveToken(input);
      const { fail, success } = sdkInfo(token);

      try {
        const start = Date.now();

        const res = await list({ token });

        const duration = Date.now() - start;

        success(
          `Ping completed after ${duration}ms, ${res.blobs.length} blobs in the store`
        );
      } catch (error) {
        fail(error);
      }
    }
  );
}
