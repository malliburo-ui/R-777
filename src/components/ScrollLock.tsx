"use client";

import { useEffect } from "react";

/** Locks page scroll — for full-screen static hero layouts. */
export function ScrollLock() {
  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyInset = body.style.inset;
    const prevBodyWidth = body.style.width;
    const prevOverscroll = html.style.overscrollBehavior;

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.inset = "0";
    body.style.width = "100%";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      html.style.overscrollBehavior = prevOverscroll;
      body.style.overflow = prevBodyOverflow;
      body.style.overscrollBehavior = "";
      body.style.position = prevBodyPosition;
      body.style.inset = prevBodyInset;
      body.style.width = prevBodyWidth;
    };
  }, []);

  return null;
}
