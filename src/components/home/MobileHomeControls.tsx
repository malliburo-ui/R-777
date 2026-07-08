"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { setMobileFilterIndex } from "@/hooks/useMobileFilterIndex";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

export const MOBILE_CONTROLS_ROOT_ID = "mobile-home-controls";
export const MOBILE_CONTROLS_Z = 100_000;
export const MOBILE_FILTER_CYCLE_EVENT = "portfolio:mobile-filter-cycle";
export const MOBILE_FILTER_D_INDEX = 3;
export const MOBILE_FAN_D_SOURCE = "21D.gif";

const inset = "clamp(10px, 1.5vw, 16px)";
const DEFAULT_MOBILE_BG = "#232003";
const DEFAULT_MOBILE_FG = "#c7c7c7";
const CYCLE_COOLDOWN_MS = 350;

export const MOBILE_FILTERS = [
  { id: "A", name: "Фильтр А", color: "#FF2600", textColor: DEFAULT_MOBILE_FG },
  { id: "B", name: "Фильтр B", color: "#0000FF", textColor: DEFAULT_MOBILE_FG },
  { id: "C", name: "Фильтр C", color: "#232003", textColor: DEFAULT_MOBILE_FG },
  { id: "D", name: "Фильтр D", color: "#533BE6", textColor: "#E353F0" },
] as const;

export function dispatchMobileFilterCycle() {
  if (typeof document === "undefined") {
    return;
  }

  document.dispatchEvent(new Event(MOBILE_FILTER_CYCLE_EVENT));
}

function resolveMobileBackground(activeFilterIndex: number | null) {
  if (activeFilterIndex === null) {
    return DEFAULT_MOBILE_BG;
  }

  return MOBILE_FILTERS[activeFilterIndex]?.color ?? DEFAULT_MOBILE_BG;
}

function resolveMobileForeground(activeFilterIndex: number | null) {
  if (activeFilterIndex === null) {
    return DEFAULT_MOBILE_FG;
  }

  return MOBILE_FILTERS[activeFilterIndex]?.textColor ?? DEFAULT_MOBILE_FG;
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

      return (current + 1) % MOBILE_FILTERS.length;
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

    const background = resolveMobileBackground(activeFilterIndex);
    const foreground = resolveMobileForeground(activeFilterIndex);

    document.documentElement.style.setProperty("--portfolio-bg", background);
    document.documentElement.style.setProperty("--portfolio-fg", foreground);
    document.body.style.backgroundColor = background;
    setMobileFilterIndex(activeFilterIndex);

    return () => {
      document.documentElement.style.setProperty("--portfolio-bg", DEFAULT_MOBILE_BG);
      document.documentElement.style.setProperty("--portfolio-fg", DEFAULT_MOBILE_FG);
      document.body.style.backgroundColor = "";
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
      <button
        type="button"
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
        }}
      >
        CV!
      </button>
    </div>,
    document.body,
  );
}
