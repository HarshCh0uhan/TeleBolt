import { useSyncExternalStore } from "react";

// Wide-open: a fine pointer anywhere (mouse, trackpad, stylus) is enough.
// The old `(hover: hover) and (pointer: fine)` check was too strict and returned
// false on some desktops; that silently disabled drag, the drag drawer and the
// scroll arrow. This version is intentionally permissive.
const PRIMARY = "(any-pointer: fine)";
const HOVER = "(hover: hover)";

const getSnapshot = () => {
  if (typeof window === "undefined") return false;
  if (window.matchMedia(PRIMARY).matches) return true;
  if (window.matchMedia(HOVER).matches) return true;
  // No touch API on the window at all => desktop by construction.
  if (!("ontouchstart" in window)) return true;
  return false;
};

const subscribe = (callback) => {
  const mediaFine = window.matchMedia(PRIMARY);
  const mediaHover = window.matchMedia(HOVER);
  mediaFine.addEventListener("change", callback);
  mediaHover.addEventListener("change", callback);
  return () => {
    mediaFine.removeEventListener("change", callback);
    mediaHover.removeEventListener("change", callback);
  };
};

const getServerSnapshot = () => true;

export const useCanDrag = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
