"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { setMobileFilterIndex } from "@/hooks/useMobileFilterIndex";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

export const MOBILE_CONTROLS_ROOT_ID = "mobile-home-controls";
export const MOBILE_CONTROLS_Z = 100_000;
export const MOBILE_FILTER_CYCLE_EVENT = "portfolio:mobile-filter-cycle";
export const MOBILE_FILTER_IMAGE_INDEX = 1;

const inset = "clamp(10px, 1.5vw, 16px)";
const CV_NOTION_URL =
  "https://malliburo.notion.site/Valeriy-Kolpaschikov-UI-UX-designer-9b361fde1ba749a6b58b65946d9418bf?pvs=4";
const DEFAULT_MOBILE_BG = "#232003";
const DEFAULT_MOBILE_FG = "#c7c7c7";
const MOBILE_FILTER_BG_IMAGE = "/cases/Mobile/mobile-filter-bg.png?v=30";
const MOBILE_FILTER_D_HEAD_IMAGE = "/cases/Mobile/mobile-filter-d-head.png?v=3";
const MOBILE_FILTER_D_BG = "#232323";
const CYCLE_COOLDOWN_MS = 350;

export const MOBILE_FILTERS = [
  { id: "B", name: "Фильтр B", kind: "color" as const, color: "#0000FF", textColor: DEFAULT_MOBILE_FG },
  {
    id: "C",
    name: "Фильтр C",
    kind: "image" as const,
    color: DEFAULT_MOBILE_BG,
    image: MOBILE_FILTER_BG_IMAGE,
    textColor: DEFAULT_MOBILE_FG,
  },
  {
    id: "D",
    name: "Фильтр D",
    kind: "image" as const,
    color: MOBILE_FILTER_D_BG,
    image: MOBILE_FILTER_D_HEAD_IMAGE,
    imageSize: "contain",
    textColor: DEFAULT_MOBILE_FG,
  },
] as const;

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
    document.body.style.backgroundPosition = "center";
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
  const [cvPressed, setCvPressed] = useState(false);
  const lastCycleAtRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || !isMobileLayout) {
    return null;
  }

  return createPortal(
    <div
      id={MOBILE_CONTROLS_ROOT_ID}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: MOBILE_CONTROLS_Z,
        pointerEvents: "none",
      }}
    >
      <a
        href={CV_NOTION_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="CV"
        onPointerDown={() => setCvPressed(true)}
        onPointerUp={() => setCvPressed(false)}
        onPointerLeave={() => setCvPressed(false)}
        onPointerCancel={() => setCvPressed(false)}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 2,
          margin: 0,
          padding: inset,
          border: "none",
          background: "transparent",
          color: "var(--portfolio-fg)",
          fontFamily: "inherit",
          fontWeight: 700,
          fontSize: "clamp(18px, 2.79vw, 28.481px)",
          lineHeight: 1,
          letterSpacing: "-0.03em",
          minWidth: 56,
          minHeight: 56,
          pointerEvents: "auto",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          transform: `scale(${cvPressed ? 2 : 1})`,
          transformOrigin: "top right",
          transition: "transform 200ms ease-out",
          textDecoration: "none",
        }}
      >
        CV!
      </a>
    </div>,
    document.body,
  );
}
