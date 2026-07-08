"use client";

import { useEffect } from "react";

/** Locks page scroll on desktop — mobile uses its own scroll layer for CASES. */
export function ScrollLock() {
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    const apply = () => {
      const html = document.documentElement;
      const { body } = document;

      if (!media.matches) {
        html.style.overflow = "";
        html.style.overscrollBehavior = "";
        body.style.overflow = "";
        body.style.overscrollBehavior = "";
        body.style.position = "";
        body.style.inset = "";
        body.style.width = "";
        return;
      }

      html.style.overflow = "hidden";
      html.style.overscrollBehavior = "none";
      body.style.overflow = "hidden";
      body.style.overscrollBehavior = "none";
      body.style.position = "fixed";
      body.style.inset = "0";
      body.style.width = "100%";
    };

    apply();
    media.addEventListener("change", apply);

    return () => {
      media.removeEventListener("change", apply);

      const html = document.documentElement;
      const { body } = document;
      html.style.overflow = "";
      html.style.overscrollBehavior = "";
      body.style.overflow = "";
      body.style.overscrollBehavior = "";
      body.style.position = "";
      body.style.inset = "";
      body.style.width = "";
    };
  }, []);

  return null;
}
