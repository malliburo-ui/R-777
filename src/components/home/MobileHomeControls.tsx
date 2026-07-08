"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

export const MOBILE_CONTROLS_ROOT_ID = "mobile-home-controls";
export const MOBILE_CONTROLS_Z = 100_000;
export const MOBILE_FILTER_A_Z = 100_001;
export const MOBILE_FILTER_A_DISMISS_Z = 100_002;
export const MOBILE_RED_TOGGLE_EVENT = "portfolio:mobile-red-toggle";

const inset = "clamp(10px, 1.5vw, 16px)";
const SITE_FG = "#c7c7c7";
const SITE_BG = "#232003";
const FILTER_A_COLOR = "#FF2600";
const TOGGLE_COOLDOWN_MS = 350;

const FILTER_A_LAYER_STYLE = {
  position: "fixed" as const,
  top: "env(safe-area-inset-top, 0px)",
  right: "env(safe-area-inset-right, 0px)",
  bottom: "env(safe-area-inset-bottom, 0px)",
  left: "env(safe-area-inset-left, 0px)",
  zIndex: MOBILE_FILTER_A_Z,
  margin: 0,
  padding: 0,
  border: "none",
  background: FILTER_A_COLOR,
  mixBlendMode: "difference" as const,
  pointerEvents: "none" as const,
  touchAction: "manipulation" as const,
  WebkitTapHighlightColor: "transparent",
};

export function dispatchMobileRedToggle() {
  if (typeof document === "undefined") {
    return;
  }

  document.dispatchEvent(new Event(MOBILE_RED_TOGGLE_EVENT));
}

function restoreSafariChrome() {
  const { documentElement, body } = document;

  documentElement.style.backgroundColor = SITE_BG;
  body.style.backgroundColor = SITE_BG;

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  themeMeta?.setAttribute("content", SITE_BG);

  delete documentElement.dataset.filterA;

  requestAnimationFrame(() => {
    void body.offsetHeight;
  });
}

export function MobileHomeControls() {
  const isMobileLayout = useIsMobileLayout();
  const [mounted, setMounted] = useState(false);
  const [filterAActive, setFilterAActive] = useState(false);
  const [cvPressed, setCvPressed] = useState(false);
  const lastToggleAtRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleFilterA = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleAtRef.current < TOGGLE_COOLDOWN_MS) {
      return;
    }

    lastToggleAtRef.current = now;
    setFilterAActive((current) => !current);
  }, []);

  useEffect(() => {
    if (!mounted || !isMobileLayout) {
      return;
    }

    const onToggleRequest = () => {
      toggleFilterA();
    };

    document.addEventListener(MOBILE_RED_TOGGLE_EVENT, onToggleRequest);

    return () => {
      document.removeEventListener(MOBILE_RED_TOGGLE_EVENT, onToggleRequest);
    };
  }, [isMobileLayout, mounted, toggleFilterA]);

  useEffect(() => {
    if (!mounted || !isMobileLayout) {
      return;
    }

    if (filterAActive) {
      document.documentElement.dataset.filterA = "active";
      return;
    }

    restoreSafariChrome();
  }, [filterAActive, isMobileLayout, mounted]);

  useEffect(() => {
    if (!mounted || !isMobileLayout) {
      return;
    }

    return () => {
      restoreSafariChrome();
    };
  }, [isMobileLayout, mounted]);

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
            top: "env(safe-area-inset-top, 0px)",
            right: "env(safe-area-inset-right, 0px)",
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

      {filterAActive ? (
        <>
          <div aria-hidden data-filter-a-layer style={FILTER_A_LAYER_STYLE} />
          <button
            type="button"
            aria-label="Фильтр А — выключить"
            onClick={toggleFilterA}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: MOBILE_FILTER_A_DISMISS_Z,
              margin: 0,
              padding: 0,
              border: "none",
              background: "transparent",
              pointerEvents: "auto",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          />
        </>
      ) : null}
    </>,
    document.body,
  );
}
