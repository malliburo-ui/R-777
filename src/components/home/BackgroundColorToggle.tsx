"use client";

import { useEffect, useState } from "react";

import { PAGE_SIDE_NAV_HOTSPOT_ID } from "@/components/home/PageSideNavHotspot";
import { setAltBackgroundActive } from "@/hooks/useAltBackgroundActive";

const DEFAULT_BG = "#232003";
const ALT_BG = "#0000FE";

function shouldIgnoreClick(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest(`#${PAGE_SIDE_NAV_HOTSPOT_ID}`));
}

export function BackgroundColorToggle() {
  const [altActive, setAltActive] = useState(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (shouldIgnoreClick(event.target)) {
        return;
      }

      setAltActive((current) => !current);
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    const bg = altActive ? ALT_BG : DEFAULT_BG;
    document.documentElement.style.setProperty("--portfolio-bg", bg);
    document.body.style.backgroundColor = "";
    setAltBackgroundActive(altActive);

    return () => {
      document.documentElement.style.setProperty("--portfolio-bg", DEFAULT_BG);
      document.body.style.backgroundColor = "";
      setAltBackgroundActive(false);
    };
  }, [altActive]);

  return null;
}
