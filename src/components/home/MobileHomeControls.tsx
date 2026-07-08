"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

export const MOBILE_CONTROLS_ROOT_ID = "mobile-home-controls";
export const MOBILE_CONTROLS_Z = 100_000;

const inset = "clamp(10px, 1.5vw, 16px)";
const SITE_FG = "#c7c7c7";
const TOGGLE_COOLDOWN_MS = 350;

export function MobileHomeControls() {
  const isMobileLayout = useIsMobileLayout();
  const [mounted, setMounted] = useState(false);
  const [redScreenActive, setRedScreenActive] = useState(false);
  const [mindPressed, setMindPressed] = useState(false);
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

  const releaseMindPress = useCallback(() => {
    setMindPressed(false);
  }, []);

  const pressMind = useCallback(() => {
    setMindPressed(true);
  }, []);

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
      {redScreenActive ? (
        <button
          type="button"
          aria-label="Close red screen"
          onClick={() => setRedScreenActive(false)}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
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

      <button
        type="button"
        aria-label="Toggle red screen"
        onClick={(event) => {
          event.stopPropagation();
          toggleRedScreen();
        }}
        onTouchStart={(event) => {
          event.stopPropagation();
          pressMind();
          toggleRedScreen();
        }}
        onTouchEnd={releaseMindPress}
        onTouchCancel={releaseMindPress}
        onPointerDown={(event) => {
          event.stopPropagation();
          pressMind();
          toggleRedScreen();
        }}
        onPointerUp={releaseMindPress}
        onPointerLeave={releaseMindPress}
        onPointerCancel={releaseMindPress}
        style={{
          position: "absolute",
          left: "50%",
          top: "58%",
          zIndex: 2,
          margin: 0,
          padding: "24px 48px",
          border: "none",
          background: "#FF2600",
          color: "#ffffff",
          fontFamily: "inherit",
          fontWeight: 500,
          fontSize: "clamp(22px, 6vw, 32px)",
          lineHeight: 1,
          letterSpacing: "-0.03em",
          minWidth: 56,
          minHeight: 56,
          pointerEvents: "auto",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          transform: `translate(-50%, -50%) scale(${mindPressed ? 2 : 1})`,
          transformOrigin: "center",
          transition: "transform 200ms ease-out",
        }}
      >
        mind
      </button>
    </div>,
    document.body,
  );
}
