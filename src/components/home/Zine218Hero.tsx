import Link from "next/link";

import { HeroGif } from "@/components/home/HeroGif";
import { SideScrollGallery } from "@/components/home/SideScrollGallery";
import type { GalleryEntry } from "@/lib/gallery";

const inset = "clamp(10px, 1.5vw, 16px)";

type Zine218HeroProps = {
  cases: GalleryEntry[];
  drawings: GalleryEntry[];
};

export function Zine218Hero({ cases, drawings }: Zine218HeroProps) {
  return (
    <section
      className="fixed inset-0 h-dvh w-full overflow-hidden bg-portfolio-bg text-portfolio-fg"
      data-figma-node="1044:6983"
    >
      <HeroGif />

      <div className="absolute inset-0 z-10">
        <p
          className="pointer-events-none absolute left-0 top-0 z-30 max-w-[min(768px,calc(100vw-3rem))] font-medium leading-[0.96] tracking-[-0.03em]"
          style={{
            padding: inset,
            fontSize: "clamp(24px, 5.2vw, 52px)",
          }}
        >
          Hi. I&apos;m a visual researcher. I&apos;m always rushing to explore the world
          through the dialogue between the hand, the mind, and the way we perceive.
        </p>

        <Link
          href="https://malliburo.notion.site/Valeriy-Kolpaschikov-UI-UX-designer-9b361fde1ba749a6b58b65946d9418bf?pvs=4"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-0 top-0 z-30 font-bold leading-none tracking-[-0.03em] transition-opacity hover:opacity-70"
          style={{
            padding: inset,
            fontSize: "clamp(18px, 2.79vw, 28.481px)",
          }}
        >
          CV!
        </Link>

        <SideScrollGallery
          side="left"
          sectionLabel="CASES"
          items={cases}
          imageBasePath="/cases/images"
          previewAnchor="bottom-left"
          unoptimized
        />

        <SideScrollGallery
          side="right"
          sectionLabel="DRAWINGS"
          items={drawings}
          imageBasePath="/drawings/images"
          previewAnchor="top-right"
          unoptimized
        />
      </div>
    </section>
  );
}
