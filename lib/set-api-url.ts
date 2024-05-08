import { createApiKey, CurrentApi } from "./api";
import { readConfig } from "./config";

export async function setApiUrl() {
  const currentProfileName = await readConfig<string>(CurrentApi);

  if (currentProfileName) {
    const profile = await readConfig<string>(createApiKey(currentProfileName));

    if (profile) {
      process.env.VERCEL_BLOB_API_URL = profile;
    }
  }
}
