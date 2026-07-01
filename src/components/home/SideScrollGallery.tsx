"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { galleryImagePath, type GalleryEntry } from "@/lib/gallery";

const inset = "clamp(10px, 1.5vw, 16px)";
const WHEEL_THRESHOLD = 36;
const STEP_COOLDOWN_MS = 90;
const CASES_ASSET_VERSION = "10";

type SideScrollGalleryProps = {
  side: "left" | "right";
  sectionLabel: string;
  items: GalleryEntry[];
  imageBasePath: string;
  previewAnchor: "bottom-left" | "top-right";
  previewTop?: string;
  unoptimized?: boolean;
};

export function SideScrollGallery({
  side,
  sectionLabel,
  items,
  imageBasePath,
  previewAnchor,
  previewTop = "clamp(140px, 28vh, 220px)",
  unoptimized = false,
}: SideScrollGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const zoneRef = useRef<HTMLDivElement>(null);
  const wheelDelta = useRef(0);
  const lastStepAt = useRef(0);
  const touchStartY = useRef<number | null>(null);

  const count = items.length;
  const active = items[activeIndex];
  const isLeft = side === "left";

  const step = useCallback(
    (direction: 1 | -1) => {
      if (count <= 1) {
        return;
      }

      const now = Date.now();
      if (now - lastStepAt.current < STEP_COOLDOWN_MS) {
        return;
      }

      lastStepAt.current = now;
      setActiveIndex((current) => {
        const next = current + direction;
        return Math.min(count - 1, Math.max(0, next));
      });
      wheelDelta.current = 0;
    },
    [count],
  );

  useEffect(() => {
    items.forEach((item) => {
      const img = new window.Image();
      img.src = galleryImagePath(imageBasePath, item.image);
    });
  }, [items, imageBasePath]);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone || count <= 1) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      const rect = zone.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      wheelDelta.current += event.deltaY;

      if (Math.abs(wheelDelta.current) >= WHEEL_THRESHOLD) {
        step(wheelDelta.current > 0 ? 1 : -1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
    };
  }, [count, step]);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const startY = touchStartY.current;
    const endY = event.changedTouches[0]?.clientY;

    if (startY == null || endY == null) {
      return;
    }

    const delta = startY - endY;
    if (Math.abs(delta) < 40) {
      return;
    }

    step(delta > 0 ? 1 : -1);
    touchStartY.current = null;
  };

  if (!active) {
    return null;
  }

  const imageObjectClass =
    previewAnchor === "bottom-left" ? "object-contain object-left-bottom" : "object-contain object-right-top";

  const previewPositionClass =
    previewAnchor === "bottom-left" ? "bottom-0 left-0" : "";

  const previewPositionStyle =
    previewAnchor === "bottom-left"
      ? {}
      : { top: previewTop, right: inset };

  const previewPaddingStyle =
    previewAnchor === "bottom-left"
      ? { paddingLeft: inset }
      : { paddingTop: inset };

  return (
    <>
      <div
        ref={zoneRef}
        className={`absolute inset-y-0 z-20 w-1/2 touch-pan-y ${isLeft ? "left-0" : "right-0"}`}
        onMouseLeave={() => {
          wheelDelta.current = 0;
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-label={`${sectionLabel} gallery. Scroll to change image.`}
      />

      <div
        className={`pointer-events-none absolute z-20 aspect-square ${previewPositionClass}`}
        style={{
          width: "clamp(220px, 42vw, 420px)",
          ...previewPaddingStyle,
          ...previewPositionStyle,
        }}
      >
        <div className="relative size-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={active.image}
            src={
              unoptimized
                ? `${galleryImagePath(imageBasePath, active.image)}?v=${CASES_ASSET_VERSION}`
                : galleryImagePath(imageBasePath, active.image)
            }
            alt={active.title}
            className={`absolute inset-0 size-full ${imageObjectClass}`}
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>
    </>
  );
}
