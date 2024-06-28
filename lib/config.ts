import { resolve } from "path";

const configFile = resolve(import.meta.dir, "../blob-cli.json");

const exists = await Bun.file(configFile).exists();
if (!exists) {
  Bun.write(configFile, JSON.stringify({}, null, 2));
}

export async function listConfig(): Promise<Record<string, string>> {
  const file = Bun.file(configFile);

  return file.json();
}

export async function readConfig<T>(field: string): Promise<T | undefined> {
  const file = Bun.file(configFile);

  const contents = await file.json();

  return contents[field];
}

export async function writeConfig<T>(field: string, value: T) {
  const file = Bun.file(configFile);
  const contents = await file.json();

  if (!value) {
    delete contents[field];
  } else {
    contents[field] = value;
  }

  await Bun.write(configFile, JSON.stringify(contents, null, 2));
}
