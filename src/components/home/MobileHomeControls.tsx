"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

export const MOBILE_CONTROLS_ROOT_ID = "mobile-home-controls";
export const MOBILE_CONTROLS_Z = 100_000;
export const MOBILE_RED_Z = 100_001;
export const MOBILE_RED_TOGGLE_EVENT = "portfolio:mobile-red-toggle";

const inset = "clamp(10px, 1.5vw, 16px)";
const SITE_FG = "#c7c7c7";
const TOGGLE_COOLDOWN_MS = 350;

export function dispatchMobileRedToggle() {
  if (typeof document === "undefined") {
    return;
  }

  document.dispatchEvent(new Event(MOBILE_RED_TOGGLE_EVENT));
}

export function MobileHomeControls() {
  const isMobileLayout = useIsMobileLayout();
  const [mounted, setMounted] = useState(false);
  const [redScreenActive, setRedScreenActive] = useState(false);
  const [cvPressed, setCvPressed] = useState(false);
  const lastToggleAtRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleRedScreen = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleAtRef.current < TOGGLE_COOLDOWN_MS) {
      return;
    }

    lastToggleAtRef.current = now;
    setRedScreenActive((current) => !current);
  }, []);

  useEffect(() => {
    if (!mounted || !isMobileLayout) {
      return;
    }

    const onToggleRequest = () => {
      toggleRedScreen();
    };

    document.addEventListener(MOBILE_RED_TOGGLE_EVENT, onToggleRequest);

    return () => {
      document.removeEventListener(MOBILE_RED_TOGGLE_EVENT, onToggleRequest);
    };
  }, [isMobileLayout, mounted, toggleRedScreen]);

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

      {redScreenActive ? (
        <button
          type="button"
          aria-label="Close red screen"
          onClick={toggleRedScreen}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: MOBILE_RED_Z,
            margin: 0,
            padding: 0,
            border: "none",
            background: "#FF2600",
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
