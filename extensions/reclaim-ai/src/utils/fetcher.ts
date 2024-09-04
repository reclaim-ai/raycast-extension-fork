import { getPreferenceValues } from "@raycast/api";
import fetch, { FetchError, RequestInit } from "node-fetch";
import { NativePreferences } from "../types/preferences";

export async function nodeFetchPromiseData<T>(
  promise: Promise<T>
): Promise<[T, null] | [null, FetchError | undefined]> {
  try {
    const result: Awaited<T> = await promise;
    return [result, null];
  } catch (err) {
    return [null, err as FetchError];
  }
}

const { apiToken, apiUrl } = getPreferenceValues<NativePreferences>();

export const fetcher = async <T>(url: string, options?: RequestInit, payload?: unknown): Promise<T> =>
  fetch(`${apiUrl}${url}`, {
    ...options,
    body: payload ? JSON.stringify(payload) : undefined,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options?.headers,
    },
  })
    .then((r) => r.json())
    .catch((e) => console.error(e));
