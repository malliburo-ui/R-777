"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { setMobileFilterIndex } from "@/hooks/useMobileFilterIndex";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

export const MOBILE_CONTROLS_Z = 100_000;
export const MOBILE_FILTER_CYCLE_EVENT = "portfolio:mobile-filter-cycle";
export const MOBILE_FILTER_IMAGE_INDEX = 1;

const DEFAULT_MOBILE_BG = "#232003";
const DEFAULT_MOBILE_FG = "#c7c7c7";
const MOBILE_FILTER_D_HEAD_IMAGE = "/cases/Mobile/mobile-filter-d-head.png?v=3";
const MOBILE_FILTER_D_BG = "#232323";
const CYCLE_COOLDOWN_MS = 350;

export const MOBILE_FILTERS = [
  { id: "B", name: "Фильтр B", kind: "color" as const, color: "#0000FF", textColor: DEFAULT_MOBILE_FG },
  {
    id: "D",
    name: "Фильтр D",
    kind: "image" as const,
    color: MOBILE_FILTER_D_BG,
    image: MOBILE_FILTER_D_HEAD_IMAGE,
    imageSize: "contain",
    imagePosition: "center calc(50% + 10px)",
    textColor: DEFAULT_MOBILE_FG,
  },
] as const;

const preloadedFilterImages = new Set<string>();

function preloadMobileFilterImage(url: string) {
  if (preloadedFilterImages.has(url)) {
    return;
  }

  preloadedFilterImages.add(url);
  const img = new window.Image();
  img.decoding = "async";
  img.src = url;
}

export function dispatchMobileFilterCycle() {
  if (typeof document === "undefined") {
    return;
  }

  document.dispatchEvent(new Event(MOBILE_FILTER_CYCLE_EVENT));
}

function resolveMobileForeground(activeFilterIndex: number | null) {
  if (activeFilterIndex === null) {
    return DEFAULT_MOBILE_FG;
  }

  return MOBILE_FILTERS[activeFilterIndex]?.textColor ?? DEFAULT_MOBILE_FG;
}

function clearMobileBackgroundStyles() {
  document.documentElement.style.setProperty("--portfolio-bg", DEFAULT_MOBILE_BG);
  document.documentElement.style.setProperty("--portfolio-fg", DEFAULT_MOBILE_FG);
  document.documentElement.style.backgroundColor = "";
  document.body.style.backgroundColor = "";
  document.body.style.backgroundImage = "";
  document.body.style.backgroundSize = "";
  document.body.style.backgroundPosition = "";
  document.body.style.backgroundRepeat = "";
}

function applyMobileBackground(activeFilterIndex: number | null) {
  const foreground = resolveMobileForeground(activeFilterIndex);
  document.documentElement.style.setProperty("--portfolio-fg", foreground);

  if (activeFilterIndex === null) {
    clearMobileBackgroundStyles();
    return;
  }

  const filter = MOBILE_FILTERS[activeFilterIndex];
  if (!filter) {
    clearMobileBackgroundStyles();
    return;
  }

  if (filter.kind === "image") {
    document.documentElement.style.setProperty("--portfolio-bg", "transparent");
    document.documentElement.style.backgroundColor = filter.color;
    document.body.style.backgroundColor = filter.color;
    document.body.style.backgroundImage = `url(${filter.image})`;
    document.body.style.backgroundSize =
      "imageSize" in filter && filter.imageSize ? filter.imageSize : "cover";
    document.body.style.backgroundPosition =
      "imagePosition" in filter && filter.imagePosition ? filter.imagePosition : "center";
    document.body.style.backgroundRepeat = "no-repeat";
    return;
  }

  document.body.style.backgroundImage = "";
  document.body.style.backgroundSize = "";
  document.body.style.backgroundPosition = "";
  document.body.style.backgroundRepeat = "";
  document.documentElement.style.backgroundColor = "";
  document.documentElement.style.setProperty("--portfolio-bg", filter.color);
  document.body.style.backgroundColor = filter.color;
}

export function MobileHomeControls() {
  const isMobileLayout = useIsMobileLayout();
  const [mounted, setMounted] = useState(false);
  const [activeFilterIndex, setActiveFilterIndex] = useState<number | null>(null);
  const lastCycleAtRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isMobileLayout) {
      return;
    }

    preloadMobileFilterImage(MOBILE_FILTER_D_HEAD_IMAGE);
  }, [isMobileLayout, mounted]);

  const cycleFilter = useCallback(() => {
    const now = Date.now();
    if (now - lastCycleAtRef.current < CYCLE_COOLDOWN_MS) {
      return;
    }

    lastCycleAtRef.current = now;
    setActiveFilterIndex((current) => {
      if (current === null) {
        return 0;
      }

      if (current >= MOBILE_FILTERS.length - 1) {
        return null;
      }

      return current + 1;
    });
  }, []);

  useEffect(() => {
    if (!mounted || !isMobileLayout) {
      return;
    }

    const onCycleRequest = () => {
      cycleFilter();
    };

    document.addEventListener(MOBILE_FILTER_CYCLE_EVENT, onCycleRequest);

    return () => {
      document.removeEventListener(MOBILE_FILTER_CYCLE_EVENT, onCycleRequest);
    };
  }, [cycleFilter, isMobileLayout, mounted]);

  useEffect(() => {
    if (!mounted || !isMobileLayout) {
      return;
    }

    applyMobileBackground(activeFilterIndex);
    setMobileFilterIndex(activeFilterIndex);

    return () => {
      clearMobileBackgroundStyles();
      setMobileFilterIndex(null);
    };
  }, [activeFilterIndex, isMobileLayout, mounted]);

  return null;
}
