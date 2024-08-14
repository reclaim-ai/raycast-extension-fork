import { getPreferenceValues } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo } from "react";
import { NativePreferences } from "../types/preferences";
import { SmartHabit } from "../types/smart-series";

const useSmartHabits = () => {
  const { apiUrl, apiToken } = getPreferenceValues<NativePreferences>();

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    [apiToken]
  );

  const {
    data: smartHabits,
    error,
    isLoading,
  } = useFetch<[SmartHabit]>(`${apiUrl}/smart-habits`, {
    headers,
    keepPreviousData: true,
  });

  if (error) throw error;

  return {
    smartHabits,
    error,
    isLoading,
  };
};

export { useSmartHabits };
