import Link from "next/link";

import { MindHeroGif } from "@/components/home/MindHeroGif";
import { SideScrollGallery } from "@/components/home/SideScrollGallery";
import type { GalleryEntry } from "@/lib/gallery";

const inset = "clamp(10px, 1.5vw, 16px)";

type MindHeroProps = {
  drawings: GalleryEntry[];
};

export function MindHero({ drawings }: MindHeroProps) {
  return (
    <section
      className="fixed inset-0 h-dvh w-full overflow-hidden text-[#232003]"
      style={{ backgroundColor: "#C7C7C7", color: "#232003" }}
      data-figma-node="mind-page"
    >
      <MindHeroGif />

      <div className="absolute inset-0 z-10">
        <p
          className="pointer-events-none absolute left-0 top-0 z-30 max-w-[min(768px,calc(100vw-3rem))] font-medium leading-[0.96] tracking-[-0.03em]"
          style={{
            padding: inset,
            fontSize: "clamp(24px, 5.2vw, 52px)",
          }}
        >
          Hi. I&apos;m a visual researcher. I&apos;m always rushing to explore the world
          through the dialogue between the{" "}
          <Link href="/" className="pointer-events-auto transition-opacity hover:opacity-70">
            hand
          </Link>
          , the mind, and the way we perceive.
        </p>

        <Link
          href="/cv"
          className="absolute right-0 top-0 z-30 font-bold leading-none tracking-[-0.03em] transition-opacity hover:opacity-70"
          style={{
            padding: inset,
            fontSize: "clamp(18px, 2.79vw, 28.481px)",
          }}
        >
          CV!
        </Link>

        <SideScrollGallery
          side="right"
          sectionLabel="DRAWINGS"
          items={drawings}
          imageBasePath="/mind/web"
          previewAnchor="bottom-right"
          previewFit="natural"
          previewScale={2}
        />
      </div>
    </section>
  );
}
