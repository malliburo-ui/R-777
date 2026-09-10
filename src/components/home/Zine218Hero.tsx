import { HeroGif } from "@/components/home/HeroGif";
import { HomeGalleries } from "@/components/home/HomeGalleries";
import { MobileCasesGalleryClient } from "@/components/home/MobileCasesGalleryClient";
import { MobileHomeControls } from "@/components/home/MobileHomeControls";
import { PageSideNavHotspot } from "@/components/home/PageSideNavHotspot";
import { SecondHeroText } from "@/components/home/SecondHeroText";
import type { GalleryEntry } from "@/lib/gallery";

const inset = "clamp(10px, 1.5vw, 16px)";

type Zine218HeroProps = {
  cases: GalleryEntry[];
  drawings: GalleryEntry[];
  mobileCases: GalleryEntry[];
  sideNavHref: string;
  heroTextClassName?: string;
  heroTextLayout?: "default" | "spread";
  mobileGalleryAnchor?: "bottom" | "center";
};

export function Zine218Hero({
  cases,
  drawings,
  mobileCases,
  sideNavHref,
  heroTextClassName,
  heroTextLayout = "default",
  mobileGalleryAnchor = "bottom",
}: Zine218HeroProps) {
  const spreadHeroText = heroTextLayout === "spread" && heroTextClassName;
  return (
    <section
      className="relative h-dvh w-full bg-portfolio-bg text-portfolio-fg lg:fixed lg:inset-0 lg:overflow-hidden"
      data-figma-node="1044:6983"
    >
      <div className="max-lg:hidden">
        <HeroGif />
      </div>

      <div className="hidden max-lg:contents">
        <MobileCasesGalleryClient items={mobileCases} imageAnchor={mobileGalleryAnchor} />
      </div>

      <div
        className={`pointer-events-none absolute inset-0 ${spreadHeroText ? "z-[5] max-lg:z-[5]" : "z-[70] max-lg:z-[20]"}`}
      >
        {spreadHeroText ? (
          <SecondHeroText fontClassName={heroTextClassName} padding={inset} />
        ) : (
          <p
            className={`pointer-events-none absolute left-0 top-0 max-w-[min(768px,calc(100vw-3rem))] font-medium leading-[0.96] tracking-[-0.03em] max-md:max-w-[calc(100vw-2*clamp(10px,1.5vw,16px))] max-lg:text-[clamp(28px,8vw,96px)] lg:text-[clamp(24px,5.2vw,52px)] ${heroTextClassName ?? ""}`}
            style={{
              padding: inset,
            }}
          >
            Hi. I&apos;m a visual researcher. I&apos;m always rushing to explore the world
            through the dialogue between the hand, the{" "}
            <span className="pointer-events-none max-lg:opacity-100">mind</span>, and the way we
            perceive.
          </p>
        )}

        <div className="pointer-events-auto max-lg:hidden">
          <HomeGalleries cases={cases} drawings={drawings} />
        </div>
      </div>

      <MobileHomeControls />
      <PageSideNavHotspot href={sideNavHref} />
    </section>
  );
}
