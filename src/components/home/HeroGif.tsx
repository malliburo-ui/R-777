"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useAltBackgroundActive } from "@/hooks/useAltBackgroundActive";

const FLOWER_GIF = "/figma/zine-225-hero.gif?v=3";
const FAN_GIF = "/cases/Mobile/21.gif?v=1";

export function HeroGif() {
  const altBackgroundActive = useAltBackgroundActive();
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
      <div className="relative aspect-square w-[clamp(320px,63vw,1600px)] translate-y-[clamp(36px,10vh,115px)] rotate-[17deg] max-md:w-[min(88vw,360px)] max-md:translate-y-[clamp(48px,12vh,96px)] max-md:rotate-[16deg]">
        <Image
          key={altBackgroundActive ? "fan" : "flower"}
          src={altBackgroundActive ? FAN_GIF : FLOWER_GIF}
          alt=""
          fill
          unoptimized
          className={`object-contain ${altBackgroundActive ? "mix-blend-screen" : ""} ${mirrored ? "-scale-x-100" : ""}`}
          priority
          sizes="(max-width: 768px) 88vw, 63vw"
        />
      </div>
    </div>
  );
}
