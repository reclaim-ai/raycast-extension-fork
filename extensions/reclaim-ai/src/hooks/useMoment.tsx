import { RefObject, useEffect, useState } from "react";
import { fetcher } from "../utils/fetcher";
import { useCallbackSafeRef } from "./useCallbackSafeRef";
import { ApiResponseMoment } from "./useEvent.types";

const makeSyncSharedStateHook = <T,>(defaultState: T) => {
  const lastStateRef = { current: defaultState };
  return (): [state: T, setState: (state: T) => unknown, stateRef: RefObject<T>] => {
    const [state, setState] = useState(lastStateRef.current);
    return [
      state,
      useCallbackSafeRef((state) => {
        lastStateRef.current = state;
        setState(state);
      }),
      lastStateRef,
    ];
  };
};

const MINUTES_EARLY = 1;
const FIVE_MINUTE_CHUNKS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
let initialized = false;

const useMomentData = makeSyncSharedStateHook<ApiResponseMoment | undefined>(undefined);
const useIsLoading = makeSyncSharedStateHook(true);
const useError = makeSyncSharedStateHook<Error | undefined>(undefined);

const getNextUpdateEpoch = (now: Date = new Date()) => {
  // nfmc: next five minute chunk
  const nfmcDate = new Date(now);
  // zero-out units below minute
  nfmcDate.setMilliseconds(0);
  nfmcDate.setSeconds(0);
  // get current minute
  const currentMinute = nfmcDate.getMinutes();
  // find the first five-minute-chunk which is greater-than or equal-to the current minute
  const nfmc = FIVE_MINUTE_CHUNKS.find((chunkMinute) => chunkMinute > currentMinute);
  // set the dates minutes to the next five-minute-chunk.
  // nfmc should never not be found in `FIVE_MINUTE_CHUNKS` but as a type guard and juuuust
  // in case fallback to 60 to push to the next hour
  nfmcDate.setMinutes(nfmc || 60);
  return nfmcDate.getTime() - MINUTES_EARLY * 60 * 1000;
};

export const useMoment = () => {
  const [momentData, setMomentData] = useMomentData();
  const [isLoading, setIsLoading, isLoadingRef] = useIsLoading();
  const [error, setError] = useError();

  const checkForUpdate = useCallbackSafeRef(async () => {
    if (isLoadingRef.current && initialized) return;
    const now = new Date();
    const nowEpoch = now.getTime();

    if (nowEpoch > getNextUpdateEpoch(now) || !initialized) {
      setIsLoading(true);
      try {
        const data = await fetcher<ApiResponseMoment>("/moment/next");
        initialized = true;
        setIsLoading(false);
        setMomentData(data);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Problem fetching moment", { cause: e }));
      }
    }

    setTimeout(() => checkForUpdate(), getNextUpdateEpoch() - nowEpoch);
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
