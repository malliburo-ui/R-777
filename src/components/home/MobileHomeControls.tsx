"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

export const MOBILE_CONTROLS_ROOT_ID = "mobile-home-controls";
export const MOBILE_CONTROLS_Z = 100_000;
export const MOBILE_FILTER_Z = 100_001;
export const MOBILE_FILTER_CYCLE_EVENT = "portfolio:mobile-filter-cycle";

const inset = "clamp(10px, 1.5vw, 16px)";
const SITE_FG = "#c7c7c7";
const CYCLE_COOLDOWN_MS = 350;

export const MOBILE_FILTERS = [
  { id: "A", name: "Фильтр А", color: "#FF2600" },
  { id: "B", name: "Фильтр B", color: "#4DFF00" },
  { id: "C", name: "Фильтр C", color: "#A1FF00" },
  { id: "D", name: "Фильтр D", color: "#000000" },
] as const;

export function dispatchMobileFilterCycle() {
  if (typeof document === "undefined") {
    return;
  }

  document.dispatchEvent(new Event(MOBILE_FILTER_CYCLE_EVENT));
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

  const activeFilter =
    activeFilterIndex === null ? null : MOBILE_FILTERS[activeFilterIndex];

  if (!mounted || !isMobileLayout) {
    return null;
  }

  return createPortal(
    <>
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
            color: SITE_FG,
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
      </div>

      {activeFilter ? (
        <button
          type="button"
          aria-label={activeFilter.name}
          onClick={cycleFilter}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: MOBILE_FILTER_Z,
            margin: 0,
            padding: 0,
            border: "none",
            background: activeFilter.color,
            mixBlendMode: "difference",
            pointerEvents: "auto",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}
        />
      ) : null}
    </>,
    document.body,
  );
}
