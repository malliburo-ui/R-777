"use client";

import { useLayoutEffect, useRef, useState } from "react";

const HERO_TEXT =
  "Hi. I'm a visual researcher. I'm always rushing to explore the world through the dialogue between the hand, the mind, and the way we perceive.";

const LINE_HEIGHT_RATIO = 0.88;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 320;

type SecondHeroTextProps = {
  fontClassName: string;
  padding: string;
};

function wrapLines(
  text: string,
  fontSize: number,
  maxWidth: number,
  fontFamily: string,
): string[] {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context || maxWidth <= 0) {
    return [text.toUpperCase()];
  }

  context.font = `${fontSize}px ${fontFamily}`;
  const words = text.toUpperCase().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
      continue;
    }

    lines.push(current);
    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [text.toUpperCase()];
}

function fitFontSize(
  text: string,
  maxWidth: number,
  maxHeight: number,
  fontFamily: string,
): { fontSize: number; lines: string[] } {
  let bestSize = MIN_FONT_SIZE;
  let bestLines = wrapLines(text, MIN_FONT_SIZE, maxWidth, fontFamily);

  for (let size = MIN_FONT_SIZE; size <= MAX_FONT_SIZE; size += 1) {
    const lines = wrapLines(text, size, maxWidth, fontFamily);
    const blockHeight = lines.length * size * LINE_HEIGHT_RATIO;

    if (blockHeight <= maxHeight) {
      bestSize = size;
      bestLines = lines;
    }
  }

  return { fontSize: bestSize, lines: bestLines };
}

export function SecondHeroText({ fontClassName, padding }: SecondHeroTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [layout, setLayout] = useState<{ fontSize: number; lines: string[] } | null>(null);

  useLayoutEffect(() => {
    const updateLayout = () => {
      const container = containerRef.current;
      const probe = probeRef.current;
      if (!container || !probe) {
        return;
      }

      const styles = getComputedStyle(container);
      const paddingX =
        Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
      const paddingY =
        Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
      const width = container.clientWidth - paddingX;
      const height = container.clientHeight - paddingY;
      const fontFamily = getComputedStyle(probe).fontFamily;

      setLayout(fitFontSize(HERO_TEXT, width, height, fontFamily));
    };

    updateLayout();

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver(updateLayout);
    observer.observe(container);
    window.addEventListener("resize", updateLayout);

    if (document.fonts?.ready) {
      document.fonts.ready.then(updateLayout).catch(() => undefined);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [fontClassName]);

  return (
    <>
      <span ref={probeRef} className={`pointer-events-none absolute opacity-0 ${fontClassName}`} aria-hidden>
        A
      </span>
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 flex flex-col justify-between uppercase"
        style={{ padding }}
      >
        {layout?.lines.map((line, lineIndex) => (
          <p
            key={`${line}-${lineIndex}`}
            className={`${fontClassName} m-0 w-full text-left`}
            style={{
              fontSize: layout.fontSize,
              lineHeight: LINE_HEIGHT_RATIO,
            }}
          >
            {line}
          </p>
        ))}
      </div>
    </>
  );
}
