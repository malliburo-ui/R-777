"use client";

import { useSyncExternalStore } from "react";

export const ALT_BACKGROUND_EVENT = "portfolio:alt-background";

let altBackgroundActive = false;

export function setAltBackgroundActive(active: boolean) {
  altBackgroundActive = active;
  document.dispatchEvent(new Event(ALT_BACKGROUND_EVENT));
}

export function getAltBackgroundActive() {
  return altBackgroundActive;
}

function subscribe(onStoreChange: () => void) {
  document.addEventListener(ALT_BACKGROUND_EVENT, onStoreChange);

  return () => {
    document.removeEventListener(ALT_BACKGROUND_EVENT, onStoreChange);
  };
}

export function useAltBackgroundActive() {
  return useSyncExternalStore(subscribe, getAltBackgroundActive, () => false);
}
