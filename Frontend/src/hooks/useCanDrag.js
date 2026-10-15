import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

const subscribe = (callback) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};

const getSnapshot = () => window.matchMedia(QUERY).matches;

const getServerSnapshot = () => true;

export const useCanDrag = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);