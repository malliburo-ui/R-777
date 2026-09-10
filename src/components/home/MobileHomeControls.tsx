"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { setMobileFilterIndex } from "@/hooks/useMobileFilterIndex";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

export const MOBILE_CONTROLS_ROOT_ID = "mobile-home-controls";
export const MOBILE_CONTROLS_Z = 100_000;
export const MOBILE_FILTER_CYCLE_EVENT = "portfolio:mobile-filter-cycle";
export const MOBILE_FILTER_IMAGE_INDEX = 1;
export const MOBILE_FILTER_D_INDEX = 1;
export const MOBILE_FILTER_D_LAYER_Z = 1;

const DEFAULT_MOBILE_BG = "#232003";
const DEFAULT_MOBILE_FG = "#c7c7c7";
const MOBILE_FILTER_D_HEAD_IMAGE = "/cases/Mobile/mobile-filter-d-head.gif?v=2";
const MOBILE_FILTER_D_HEAD_OFFSET_Y = 20;
const CYCLE_COOLDOWN_MS = 350;

export const MOBILE_FILTERS = [
  { id: "B", name: "Фильтр B", kind: "color" as const, color: "#0000FF", textColor: DEFAULT_MOBILE_FG },
  {
    id: "D",
    name: "Фильтр D",
    kind: "overlay" as const,
    image: MOBILE_FILTER_D_HEAD_IMAGE,
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

  if (filter.kind === "overlay") {
    clearMobileBackgroundStyles();
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

  if (!mounted || !isMobileLayout || activeFilterIndex !== MOBILE_FILTER_D_INDEX) {
    return null;
  }

  return createPortal(
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: MOBILE_FILTER_D_LAYER_Z,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MOBILE_FILTER_D_HEAD_IMAGE}
        alt=""
        decoding="async"
        draggable={false}
        style={{
          position: "absolute",
          left: "50%",
          top: `calc(50% + ${MOBILE_FILTER_D_HEAD_OFFSET_Y}px)`,
          height: "100dvh",
          width: "auto",
          maxWidth: "100vw",
          transform: "translate(-50%, -50%)",
          objectFit: "contain",
        }}
      />
    </div>,
    document.body,
  );
}
