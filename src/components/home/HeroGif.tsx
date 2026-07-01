"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function HeroGif() {
  const [mirrored, setMirrored] = useState(false);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      setMirrored(event.clientX >= window.innerWidth / 2);
    };

    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
    >
      <div className="relative aspect-square w-[min(95vw,1140px)] translate-y-[clamp(36px,10vh,115px)] rotate-[17deg] sm:w-[min(95vw,1020px)] lg:w-[min(90vw,912px)]">
        <Image
          src="/figma/zine-225-hero.gif"
          alt=""
          fill
          unoptimized
          className={`object-contain ${mirrored ? "-scale-x-100" : ""}`}
          priority
          sizes="(max-width: 640px) 95vw, (max-width: 1024px) 95vw, 912px"
        />
      </div>
    </div>
  );
}
