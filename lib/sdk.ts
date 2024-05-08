import ora from "ora";

import { BlobError } from "@vercel/blob";

export function getApiUrl(pathname = ""): string {
  let baseUrl = null;
  try {
    // wrapping this code in a try/catch as this function is used in the browser and Vite doesn't define the process.env.
    // As this varaible is NOT used in production, it will always default to production endpoint
    baseUrl =
      process.env.VERCEL_BLOB_API_URL ||
      process.env.NEXT_PUBLIC_VERCEL_BLOB_API_URL;
  } catch {
    // noop
  }
  return `${baseUrl || "https://blob.vercel-storage.com"}${pathname}`;
}

const BLOB_API_VERSION = 7;

export function getApiVersion(): string {
  let versionOverride = null;
  try {
    // wrapping this code in a try/catch as this function is used in the browser and Vite doesn't define the process.env.
    // As this varaible is NOT used in production, it will always default to the BLOB_API_VERSION
    versionOverride =
      process.env.VERCEL_BLOB_API_VERSION_OVERRIDE ||
      process.env.NEXT_PUBLIC_VERCEL_BLOB_API_VERSION_OVERRIDE;
  } catch {
    // noop
  }

  return `${versionOverride ?? BLOB_API_VERSION}`;
}

export function getToken(): string {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }

  throw new Error(
    "No token found. Either configure the `BLOB_READ_WRITE_TOKEN` environment variable, or pass a `token` option to your calls."
  );
}

export function maskBlobToken(token: string): string {
  const secretStart = token.lastIndexOf("_");

  const secret = token.substring(secretStart + 1);
  const publicToken = token.substring(0, secretStart);

  return `${publicToken}_${"*".repeat(secret.length)}`;
}

export function sdkInfo(token = getToken()) {
  console.info("API URL:", getApiUrl());
  console.info("API Version:", getApiVersion());

  console.info("API Token:", maskBlobToken(token));

  console.info("");

  const spinner = ora("Sending request\n").start();

  return {
    success: (object: unknown) => {
      spinner.succeed("Request successful");

      console.info(object);
    },
    fail: (error: unknown) => {
      spinner.fail("Request failed");

      if (error instanceof BlobError) {
        console.error(error.message);
      }
    },
  };
}
