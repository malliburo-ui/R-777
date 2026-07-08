"use client";

import { useEffect } from "react";

const MOBILE_QUERIES = [
  "(max-width: 1023px)",
  "(hover: none) and (pointer: coarse)",
] as const;

function isMobileLayout() {
  return MOBILE_QUERIES.some((query) => window.matchMedia(query).matches);
}

function lockPageScroll() {
  const html = document.documentElement;
  const { body } = document;

  html.style.overflow = "hidden";
  html.style.overscrollBehavior = "none";
  html.style.height = "100%";
  body.style.overflow = "hidden";
  body.style.overscrollBehavior = "none";
  body.style.position = "fixed";
  body.style.inset = "0";
  body.style.width = "100%";
}

function unlockPageScroll() {
  const html = document.documentElement;
  const { body } = document;

  html.style.overflow = "";
  html.style.overscrollBehavior = "";
  html.style.height = "";
  body.style.overflow = "";
  body.style.overscrollBehavior = "";
  body.style.position = "";
  body.style.inset = "";
  body.style.width = "";
}

/** Locks page scroll on desktop and mobile — mobile CASES use a separate layer. */
export function ScrollLock() {
  useEffect(() => {
    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    const mobileMedia = MOBILE_QUERIES.map((query) => window.matchMedia(query));

    const apply = () => {
      if (desktopMedia.matches || isMobileLayout()) {
        lockPageScroll();
        return;
      }

      unlockPageScroll();
    };

    apply();
    desktopMedia.addEventListener("change", apply);
    mobileMedia.forEach((entry) => entry.addEventListener("change", apply));

    return () => {
      desktopMedia.removeEventListener("change", apply);
      mobileMedia.forEach((entry) => entry.removeEventListener("change", apply));
      unlockPageScroll();
    };
  }, []);

  return null;
}
