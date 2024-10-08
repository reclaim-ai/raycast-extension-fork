import { getPreferenceValues, showToast, Toast } from "@raycast/api";
import { ENV_REQUEST_HEADERS } from "../consts/requests.consts";
import { NativePreferences } from "../types/preferences";

const { apiToken } = getPreferenceValues<NativePreferences>();

export class MissingApiKeyError extends Error { }

export const getRequestHeaders = (): Record<string, string> => {
    if (!apiToken) {
        showToast({
            style: Toast.Style.Failure,
            title: "Something is wrong with your API Token key. Check your Raycast config and set up a new token.",
            message: "Something wrong with your API Token key. Check your Raycast config and set up a new token.",
        });

        throw new MissingApiKeyError("No API key found in configuration");
    }

    return {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...ENV_REQUEST_HEADERS
    };
};
