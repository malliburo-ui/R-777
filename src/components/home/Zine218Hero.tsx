import { HeroGif } from "@/components/home/HeroGif";
import { HomeGalleries } from "@/components/home/HomeGalleries";
import { MobileCasesGalleryClient } from "@/components/home/MobileCasesGalleryClient";
import { MobileHomeControls } from "@/components/home/MobileHomeControls";
import type { GalleryEntry } from "@/lib/gallery";

const inset = "clamp(10px, 1.5vw, 16px)";
const CV_NOTION_URL =
  "https://malliburo.notion.site/Valeriy-Kolpaschikov-UI-UX-designer-9b361fde1ba749a6b58b65946d9418bf?pvs=4";

type Zine218HeroProps = {
  cases: GalleryEntry[];
  drawings: GalleryEntry[];
  mobileCases: GalleryEntry[];
};

export function Zine218Hero({ cases, drawings, mobileCases }: Zine218HeroProps) {
  return (
    <section
      className="relative h-dvh w-full bg-portfolio-bg text-portfolio-fg lg:fixed lg:inset-0 lg:overflow-hidden"
      data-figma-node="1044:6983"
    >
      <div className="max-lg:hidden">
        <HeroGif />
      </div>

      <div className="hidden max-lg:contents">
        <MobileCasesGalleryClient items={mobileCases} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[70] max-lg:z-[20]">
        <p
          className="pointer-events-none absolute left-0 top-0 max-w-[min(768px,calc(100vw-3rem))] font-medium leading-[0.96] tracking-[-0.03em] max-md:max-w-[calc(100vw-2*clamp(10px,1.5vw,16px))] text-[clamp(28px,7.6vw,42px)] md:text-[clamp(24px,5.2vw,52px)]"
          style={{
            padding: inset,
          }}
        >
          Hi. I&apos;m a visual researcher. I&apos;m always rushing to explore the world
          through the dialogue between the hand, the{" "}
          <span className="pointer-events-none max-lg:opacity-100">
            mind
          </span>
          , and the way we perceive.
        </p>

        <a
          href={CV_NOTION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto absolute right-0 top-0 z-[80] font-bold leading-none tracking-[-0.03em] transition-opacity hover:opacity-70 max-lg:hidden"
          style={{
            padding: inset,
            fontSize: "clamp(18px, 2.79vw, 28.481px)",
          }}
        >
          CV!
        </a>

        <div className="pointer-events-auto max-lg:hidden">
          <HomeGalleries cases={cases} drawings={drawings} />
        </div>
      </div>

      <MobileHomeControls />
    </section>
  );
}
