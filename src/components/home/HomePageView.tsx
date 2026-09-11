import { BackgroundColorToggle } from "@/components/home/BackgroundColorToggle";
import { Zine218Hero } from "@/components/home/Zine218Hero";
import { ScrollLock } from "@/components/ScrollLock";
import type { GalleryAltImageMap, GalleryEntry } from "@/lib/gallery";

type HomePageViewProps = {
  cases: GalleryEntry[];
  casesAltImages?: GalleryAltImageMap;
  drawings: GalleryEntry[];
  drawingsAltImages?: GalleryAltImageMap;
  mobileCases: GalleryEntry[];
  sideNavHref: string;
  heroTextClassName?: string;
  heroTextLayout?: "default" | "spread";
  mobileGalleryAnchor?: "bottom" | "center";
};

export function HomePageView({
  cases,
  casesAltImages,
  drawings,
  drawingsAltImages,
  mobileCases,
  sideNavHref,
  heroTextClassName,
  heroTextLayout = "default",
  mobileGalleryAnchor = "bottom",
}: HomePageViewProps) {
  return (
    <>
      <BackgroundColorToggle />
      <ScrollLock />
      <main className="relative min-h-dvh w-full overscroll-none lg:fixed lg:inset-0 lg:h-dvh lg:overflow-hidden">
        <Zine218Hero
          cases={cases}
          casesAltImages={casesAltImages}
          drawings={drawings}
          drawingsAltImages={drawingsAltImages}
          mobileCases={mobileCases}
          sideNavHref={sideNavHref}
          heroTextClassName={heroTextClassName}
          heroTextLayout={heroTextLayout}
          mobileGalleryAnchor={mobileGalleryAnchor}
        />
      </main>
    </>
  );
}
