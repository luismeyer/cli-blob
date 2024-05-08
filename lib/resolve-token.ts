import { readConfig } from "./config";
import { createTokenKey, CurrentToken } from "./token";

export async function resolveToken({
  dotenv,
  token,
}: {
  token?: string;
  dotenv?: boolean;
}): Promise<string | undefined> {
  if (token) {
    return token;
  }

  const currentProfileName = await readConfig<string>(CurrentToken);

  if (currentProfileName) {
    const profile = await readConfig<string>(
      createTokenKey(currentProfileName)
    );

    if (profile) {
      return profile;
    }
  }

  if (dotenv) {
    const glob = new Bun.Glob(".env*");

    for await (const file of glob.scan({ dot: true })) {
      const text = await Bun.file(file).text();

      for (let line of text.split("\n")) {
        if (!line.startsWith("BLOB_READ_WRITE_TOKEN")) {
          continue;
        }

        let value = line.split("=")[1];

        if (value.startsWith('"')) {
          value = value.substring(1);
        }

        if (value.endsWith('"')) {
          value = value.substring(0, value.length - 1);
        }

        return value;
      }
    }
  }
}
