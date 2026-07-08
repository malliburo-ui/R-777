"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { galleryImagePath, type GalleryEntry } from "@/lib/gallery";

const inset = "clamp(10px, 1.5vw, 16px)";
const WHEEL_THRESHOLD = 36;
const STEP_COOLDOWN_MS = 90;
const PRELOAD_RADIUS = 2;
const GALLERY_ASSET_VERSION = "21";

type SideScrollGalleryProps = {
  side: "left" | "right";
  sectionLabel: string;
  items: GalleryEntry[];
  imageBasePath: string;
  previewAnchor: "bottom-left" | "top-right" | "bottom-right";
  previewTop?: string;
  previewFit?: "square" | "natural";
  previewScale?: number;
};

const preloaded = new Set<string>();

function preloadGalleryImage(basePath: string, filename: string, priority: "high" | "low" = "low") {
  const url = `${galleryImagePath(basePath, filename)}?v=${GALLERY_ASSET_VERSION}`;
  if (preloaded.has(url)) {
    return;
  }

  preloaded.add(url);
  const img = new window.Image();
  if (priority === "high") {
    img.fetchPriority = "high";
  }
  img.decoding = "async";
  img.src = url;
}

export function SideScrollGallery({
  side,
  sectionLabel,
  items,
  imageBasePath,
  previewAnchor,
  previewTop = "clamp(140px, 28vh, 220px)",
  previewFit = "square",
  previewScale = 1,
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
    if (items.length === 0) {
      return;
    }

    for (let offset = 0; offset <= PRELOAD_RADIUS; offset += 1) {
      for (const index of [activeIndex - offset, activeIndex + offset]) {
        if (index < 0 || index >= items.length) {
          continue;
        }

        preloadGalleryImage(
          imageBasePath,
          items[index].image,
          index === activeIndex ? "high" : "low",
        );
      }
    }
  }, [activeIndex, items, imageBasePath]);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const preloadRest = () => {
      items.forEach((item, index) => {
        if (Math.abs(index - activeIndex) > PRELOAD_RADIUS) {
          preloadGalleryImage(imageBasePath, item.image, "low");
        }
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(preloadRest, { timeout: 4000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(preloadRest, 1500);
    return () => clearTimeout(timeoutId);
  }, [activeIndex, items, imageBasePath]);

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

  if (!active) {
    return null;
  }

  const imageObjectClass =
    previewAnchor === "bottom-left"
      ? "object-contain object-left-bottom"
      : previewAnchor === "bottom-right"
        ? "object-contain object-right-bottom"
        : "object-contain object-right-top";

  const previewMaxWidth = `clamp(${220 * previewScale}px, ${42 * previewScale}vw, ${420 * previewScale}px)`;
  const previewMaxHeight =
    previewScale > 1
      ? "min(85vh, calc(100dvh - 80px))"
      : "min(70vh, calc(100dvh - 160px))";

  const zoneClassName = `absolute inset-y-0 z-20 w-1/2 touch-pan-y ${isLeft ? "left-0" : "right-0"}`;

  const previewPositionClass =
    previewAnchor === "bottom-left"
      ? "bottom-0 left-0"
      : previewAnchor === "bottom-right"
        ? "bottom-0 right-0"
        : "";

  const previewPositionStyle =
    previewAnchor === "top-right" ? { top: previewTop, right: inset } : {};

  const previewPaddingStyle =
    previewAnchor === "bottom-left"
      ? { paddingLeft: inset, paddingBottom: inset }
      : previewAnchor === "bottom-right"
        ? { paddingRight: inset, paddingBottom: inset }
        : { paddingTop: inset };

  const previewFlexClass =
    previewAnchor === "bottom-left"
      ? "justify-start items-end"
      : previewAnchor === "bottom-right"
        ? "justify-end items-end"
        : previewAnchor === "top-right"
          ? "justify-end items-start"
          : "justify-start items-start";

  const imageSrc = `${galleryImagePath(imageBasePath, active.image)}?v=${GALLERY_ASSET_VERSION}`;

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

  return (
    <div className="absolute inset-0">
      <div
        ref={zoneRef}
        className={zoneClassName}
        onMouseLeave={() => {
          wheelDelta.current = 0;
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-label={`${sectionLabel} gallery. Scroll to change image.`}
      />

      {previewFit === "natural" ? (
        <div
          className={`pointer-events-none absolute z-20 flex ${previewPositionClass} ${previewFlexClass}`}
          style={{
            maxWidth: previewMaxWidth,
            ...previewPaddingStyle,
            ...previewPositionStyle,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={active.image}
            src={imageSrc}
            alt={active.title}
            className="block h-auto w-auto max-w-full"
            style={{ maxHeight: previewMaxHeight }}
            decoding="async"
            fetchPriority="high"
            draggable={false}
          />
        </div>
      ) : (
        <div
          className={`pointer-events-none absolute z-20 aspect-square ${previewPositionClass}`}
          style={{
            width: previewMaxWidth,
            ...previewPaddingStyle,
            ...previewPositionStyle,
          }}
        >
          <div className="relative size-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={active.image}
              src={imageSrc}
              alt={active.title}
              className={`absolute inset-0 size-full ${imageObjectClass}`}
              decoding="async"
              fetchPriority="high"
              draggable={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
