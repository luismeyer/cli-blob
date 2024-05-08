import { Argv } from "yargs";

export function baseArgs(yargs: Argv<{}>) {
  return yargs
    .option("token", {
      description: "The read write token for the blob store",
      type: "string",
      alias: "t",
    })
    .option("dotenv", {
      description: "Read token from .env file",
      type: "boolean",
      alias: "d",
    });
}
