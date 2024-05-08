#! /usr/bin/env bun

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { delCommand } from "./lib/del";
import { headCommand } from "./lib/head";
import { listCommand } from "./lib/list";
import { tokenCommand } from "./lib/token";
import { putCommand } from "./lib/put";
import { copyCommand } from "./lib/copy";
import { apiCommand } from "./lib/api";

const cli = yargs(hideBin(Bun.argv)).version("1.0");

tokenCommand(cli);
apiCommand(cli);

putCommand(cli);
listCommand(cli);
delCommand(cli);
headCommand(cli);
copyCommand(cli);

cli.parse();
