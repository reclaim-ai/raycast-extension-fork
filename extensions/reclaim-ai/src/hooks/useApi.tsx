import { getPreferenceValues } from "@raycast/api";
// eslint-disable-next-line no-restricted-imports
import { useFetch } from "@raycast/utils";
import { NativePreferences } from "../types/preferences";
import { Hint, upgradeAndCaptureError, useCaptureException } from "../utils/sentry";
import { getRequestHeaders } from "../utils/requests";

export class UseApiError extends Error {}
export class UseApiResponseError extends UseApiError {}

const useApi = <T,>(url: string) => {
  const hint: Hint = { data: { request: `${url}` } };

  let error: UseApiError | undefined;

  try {
    const { apiUrl } = getPreferenceValues<NativePreferences>();

    const result = {
      error,
      ...useFetch<T>(`${apiUrl}${url}`, {
        headers: getRequestHeaders(),
        keepPreviousData: true,
      }),
    };

    useCaptureException(result.error, {
      mutate: (cause) => new UseApiResponseError("Error in response", { cause }),
      hint,
    });

    return result;
  } catch (error) {
    throw upgradeAndCaptureError(
      error,
      UseApiError,
      (cause) => new UseApiError("Something went wrong", { cause }),
      hint
    );
  }
};

export default useApi;
