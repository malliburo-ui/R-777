"use client";

import { useSyncExternalStore } from "react";

export const MOBILE_FILTER_STATE_EVENT = "portfolio:mobile-filter-state";

let mobileFilterIndex: number | null = null;

export function setMobileFilterIndex(index: number | null) {
  mobileFilterIndex = index;
  document.dispatchEvent(new Event(MOBILE_FILTER_STATE_EVENT));
}

export function getMobileFilterIndex() {
  return mobileFilterIndex;
}

function subscribe(onStoreChange: () => void) {
  document.addEventListener(MOBILE_FILTER_STATE_EVENT, onStoreChange);

  return () => {
    document.removeEventListener(MOBILE_FILTER_STATE_EVENT, onStoreChange);
  };
}

export function useMobileFilterIndex() {
  return useSyncExternalStore(subscribe, getMobileFilterIndex, () => null);
}
