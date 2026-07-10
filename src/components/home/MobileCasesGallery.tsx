"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  dispatchMobileFilterCycle,
  MOBILE_CONTROLS_ROOT_ID,
  MOBILE_CONTROLS_Z,
} from "@/components/home/MobileHomeControls";
import { galleryImagePath, type GalleryEntry } from "@/lib/gallery";

const GALLERY_ASSET_VERSION = "29";
const PRELOAD_RADIUS = 2;
const MOBILE_IMAGE_BASE = "/cases/Mobile";
const MOBILE_FAN_SOURCE = "21.gif";
const MOBILE_FLOWER_IMAGE = "zine-225-hero-transparent.gif";
const SWIPE_THRESHOLD = 48;
const TAP_THRESHOLD = 16;
const YELLOW_OVERLAY = "#FFE600";
const MOBILE_GALLERY_Z = 30;
const MOBILE_YELLOW_Z = MOBILE_CONTROLS_Z - 1;
const SCROLL_STEP_RATIO = 0.14;
const MIN_SCROLL_STEP = 64;
const DEFAULT_SCROLL_STEP = 96;

function readScrollStep() {
  return Math.max(
    MIN_SCROLL_STEP,
    Math.round(window.innerHeight * SCROLL_STEP_RATIO),
  );
}

function mobileImageSrc(filename: string) {
  return `${galleryImagePath(MOBILE_IMAGE_BASE, filename)}?v=${GALLERY_ASSET_VERSION}`;
}

function isFanImage(filename: string) {
  return filename === MOBILE_FAN_SOURCE;
}

function isFlowerImage(filename: string) {
  return filename === MOBILE_FLOWER_IMAGE;
}

function isControlsHit(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest(`#${MOBILE_CONTROLS_ROOT_ID}`));
}

function readMaxScroll(scrollEl: HTMLDivElement) {
  return Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
}

function indexFromScrollTop(scrollTop: number, maxScroll: number, itemCount: number) {
  if (itemCount <= 1 || maxScroll <= 0) {
    return 0;
  }

  const progress = scrollTop / maxScroll;
  return Math.min(itemCount - 1, Math.max(0, Math.round(progress * (itemCount - 1))));
}

function scrollTopForIndex(index: number, maxScroll: number, itemCount: number) {
  if (itemCount <= 1 || maxScroll <= 0) {
    return 0;
  }

  return (index / (itemCount - 1)) * maxScroll;
}

const preloaded = new Set<string>();

function preloadGalleryImage(filename: string, priority: "high" | "low" = "low") {
  const url = mobileImageSrc(filename);
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

type MobileCasesGalleryProps = {
  items: GalleryEntry[];
};

export function MobileCasesGallery({ items }: MobileCasesGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollStep, setScrollStep] = useState(DEFAULT_SCROLL_STEP);
  const [yellowOverlayActive, setYellowOverlayActive] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const count = items.length;
  const active = items[activeIndex];

  useEffect(() => {
    const updateScrollStep = () => {
      setScrollStep(readScrollStep());
    };

    updateScrollStep();
    window.addEventListener("resize", updateScrollStep);

    return () => {
      window.removeEventListener("resize", updateScrollStep);
    };
  }, []);

  const syncIndexFromScroll = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) {
      return;
    }

    const maxScroll = readMaxScroll(scrollEl);
    const nextIndex = indexFromScrollTop(scrollEl.scrollTop, maxScroll, count);
    setActiveIndex(nextIndex);
  }, [count]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) {
      return;
    }

    scrollEl.scrollTop = 0;
    setActiveIndex(0);
  }, [items]);

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
          items[index].image,
          index === activeIndex ? "high" : "low",
        );
      }
    }
  }, [activeIndex, items]);

  useEffect(() => {
    preloadGalleryImage(MOBILE_FAN_SOURCE, "low");
  }, []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) {
      return;
    }

    if (count > 1) {
      scrollEl.addEventListener("scroll", syncIndexFromScroll, { passive: true });
    }

    let startX = 0;
    let startY = 0;
    let tracking = false;
    let gesture: "none" | "vertical" | "horizontal" = "none";

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || isControlsHit(event.target)) {
        tracking = false;
        gesture = "none";
        return;
      }

      const touch = event.touches[0];
      tracking = true;
      gesture = "none";
      startX = touch.clientX;
      startY = touch.clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!tracking || isControlsHit(event.target)) {
        tracking = false;
        gesture = "none";
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      if (gesture === "none") {
        if (
          Math.abs(deltaX) < SWIPE_THRESHOLD &&
          Math.abs(deltaY) < SWIPE_THRESHOLD
        ) {
          return;
        }

        gesture = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
      }

      if (gesture === "horizontal") {
        event.preventDefault();
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!tracking) {
        return;
      }

      tracking = false;

      const endTouch = event.changedTouches[0];
      if (!endTouch) {
        gesture = "none";
        return;
      }

      const deltaX = endTouch.clientX - startX;
      const deltaY = endTouch.clientY - startY;
      const finishedGesture = gesture;

      if (
        finishedGesture === "horizontal" &&
        deltaX >= SWIPE_THRESHOLD &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        setYellowOverlayActive(true);
        gesture = "none";
        return;
      }

      if (
        finishedGesture === "none" &&
        Math.abs(deltaX) < TAP_THRESHOLD &&
        Math.abs(deltaY) < TAP_THRESHOLD
      ) {
        dispatchMobileFilterCycle();
        gesture = "none";
        return;
      }

      gesture = "none";

      if (count <= 1) {
        return;
      }

      syncIndexFromScroll();

      const maxScroll = readMaxScroll(scrollEl);
      if (maxScroll <= 0) {
        return;
      }

      const snappedIndex = indexFromScrollTop(scrollEl.scrollTop, maxScroll, count);
      scrollEl.scrollTo({
        top: scrollTopForIndex(snappedIndex, maxScroll, count),
        behavior: "smooth",
      });
    };

    scrollEl.addEventListener("touchstart", onTouchStart, { passive: true });
    scrollEl.addEventListener("touchmove", onTouchMove, { passive: false });
    scrollEl.addEventListener("touchend", onTouchEnd, { passive: true });
    scrollEl.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      if (count > 1) {
        scrollEl.removeEventListener("scroll", syncIndexFromScroll);
      }
      scrollEl.removeEventListener("touchstart", onTouchStart);
      scrollEl.removeEventListener("touchmove", onTouchMove);
      scrollEl.removeEventListener("touchend", onTouchEnd);
      scrollEl.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [count, syncIndexFromScroll]);

  if (!active) {
    return null;
  }

  const fanImage = isFanImage(active.image);
  const flowerImage = isFlowerImage(active.image);
  const imageSrc = fanImage ? mobileImageSrc(MOBILE_FAN_SOURCE) : mobileImageSrc(active.image);

  return (
    <>
      {portalReady && yellowOverlayActive
        ? createPortal(
            <button
              type="button"
              aria-label="Close yellow overlay"
              onClick={() => setYellowOverlayActive(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: MOBILE_YELLOW_Z,
                margin: 0,
                padding: 0,
                border: "none",
                background: YELLOW_OVERLAY,
                pointerEvents: "auto",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            />,
            document.body,
          )
        : null}

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 w-screen max-lg:block lg:hidden"
        style={{ height: "calc(100dvh - 220px)", zIndex: 10 }}
      >
        <div className="pointer-events-none flex h-full w-full items-end justify-center leading-[0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={fanImage ? "fan" : active.image}
            src={imageSrc}
            alt={active.title}
            className="pointer-events-none block h-auto max-h-full w-full object-contain object-bottom"
            style={{
              width: "100vw",
              ...(fanImage ? { mixBlendMode: "screen" } : {}),
              ...(flowerImage
                ? {
                    transform: "scale(1.44) translateY(50px)",
                    transformOrigin: "bottom center",
                  }
                : {}),
            }}
            decoding="async"
            fetchPriority="high"
            draggable={false}
          />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="fixed inset-0 overflow-y-scroll overscroll-none touch-pan-y [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-lg:block lg:hidden"
        style={{ zIndex: MOBILE_GALLERY_Z }}
        aria-hidden
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="pointer-events-none shrink-0"
            style={{ height: scrollStep }}
            aria-hidden
          />
        ))}
      </div>
    </>
  );
}
