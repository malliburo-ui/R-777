"use client";

import { useRouter } from "next/navigation";

export const PAGE_SIDE_NAV_HOTSPOT_ID = "page-side-nav-hotspot";

type PageSideNavHotspotProps = {
  href: string;
};

export function PageSideNavHotspot({ href }: PageSideNavHotspotProps) {
  const router = useRouter();

  return (
    <button
      id={PAGE_SIDE_NAV_HOTSPOT_ID}
      type="button"
      aria-label={href === "/" ? "Back to home" : "Open Second page"}
      onClick={() => router.push(href)}
      className="fixed top-1/2 right-0 z-[85] -translate-y-1/2 border-0 bg-transparent p-0 opacity-0"
      style={{
        width: 40,
        height: 40,
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        cursor: "pointer",
      }}
    />
  );
}
