import { useEffect } from "react";
import { fetcher } from "../utils/fetcher";
import { useCallbackSafeRef } from "./useCallbackSafeRef";
import { ApiResponseMoment } from "./useEvent.types";
import { useSyncCachedState } from "./useSyncCachedState";
import { mapTimes } from "../utils/arrays";
import { minutesToMilliseconds } from "date-fns";

const UPDATE_ON_MINUTE = 5;
const MINUTES_EARLY = 1;
// [0, 5, 10, 15 ... 45, 50, 55, 60]
const MINUTE_CHUNKS = mapTimes(60 / UPDATE_ON_MINUTE + 1, (i) => i * UPDATE_ON_MINUTE);

const getNextUpdateChunkEpoch = (now: Date = new Date()) => {
  // nfmc: next five minute chunk
  const nfmcDate = new Date(now);
  // zero-out units below minute
  nfmcDate.setMilliseconds(0);
  nfmcDate.setSeconds(0);
  // get current minute
  const currentMinute = nfmcDate.getMinutes();
  // find the first five-minute-chunk which is greater-than or equal-to the current minute
  const nfmc = MINUTE_CHUNKS.find((chunkMinute) => chunkMinute > currentMinute);
  // set the dates minutes to the next five-minute-chunk.
  // nfmc should never not be found in `MINUTE_CHUNKS` but as a type guard and juuuust
  // in case fallback to 60 to push to the next hour
  nfmcDate.setMinutes(nfmc || 60);
  return nfmcDate.getTime() - minutesToMilliseconds(MINUTES_EARLY);
};

export const useMoment = () => {
  const [, setMomentData, momentData] = useSyncCachedState<ApiResponseMoment | undefined>("useMomentData", undefined);
  const [, setIsLoading, isLoading] = useSyncCachedState("useMomentLoading", true);
  const [, setError, error] = useSyncCachedState<Error | undefined>("useMomentError", undefined);
  const [lastUpdateChunkEpochRef, setLastUpdateChunkEpoch] = useSyncCachedState<number | undefined>(
    "useMomentLastUpdateChunkEpoch",
    undefined
  );

  const checkForUpdate = useCallbackSafeRef(async () => {
    const now = new Date();
    const nowEpoch = now.getTime();
    const nextUpdateChunkEpoch = getNextUpdateChunkEpoch(now);

    // update if:
    if (
      // we've never updated before
      lastUpdateChunkEpochRef.current === undefined ||
      // we're in the last `MINUTES_EARLY` of this chunk
      ((nowEpoch > nextUpdateChunkEpoch ||
        // we've passed the max amount of time since the last update (fall back in case we've somehow skipped the last minute of the last chunk)
        nowEpoch > lastUpdateChunkEpochRef.current + minutesToMilliseconds(UPDATE_ON_MINUTE)) &&
        // we are not updating the same chunk we did last time
        nextUpdateChunkEpoch > lastUpdateChunkEpochRef.current)
    ) {
      setLastUpdateChunkEpoch(nextUpdateChunkEpoch);
      setIsLoading(true);
      try {
        const data = await fetcher<ApiResponseMoment>("/moment/next");
        setIsLoading(false);
        setMomentData(data);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Problem fetching moment", { cause: e }));
      }
    }
    setTimeout(() => checkForUpdate(), getNextUpdateChunkEpoch() - new Date().getTime());
  });

  useEffect(() => {
    checkForUpdate();
  }, []);

  return {
    momentData,
    isLoading,
    error,
  };
};
