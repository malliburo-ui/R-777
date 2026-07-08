"use client";

import { useSyncExternalStore } from "react";

const QUERIES = [
  "(max-width: 1023px)",
  "(hover: none) and (pointer: coarse)",
] as const;

function readIsMobileLayout() {
  return QUERIES.some((query) => window.matchMedia(query).matches);
}

function subscribe(onStoreChange: () => void) {
  const media = QUERIES.map((query) => window.matchMedia(query));
  media.forEach((entry) => entry.addEventListener("change", onStoreChange));

  return () => {
    media.forEach((entry) => entry.removeEventListener("change", onStoreChange));
  };
}

function getSnapshot() {
  return readIsMobileLayout();
}

function getServerSnapshot() {
  return false;
}

export function useIsMobileLayout() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
