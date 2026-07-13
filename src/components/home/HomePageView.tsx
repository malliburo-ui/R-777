import { Zine218Hero } from "@/components/home/Zine218Hero";
import { ScrollLock } from "@/components/ScrollLock";
import type { GalleryEntry } from "@/lib/gallery";

type HomePageViewProps = {
  cases: GalleryEntry[];
  drawings: GalleryEntry[];
  mobileCases: GalleryEntry[];
  sideNavHref: string;
  heroTextClassName?: string;
  heroTextLayout?: "default" | "spread";
};

export function HomePageView({
  cases,
  drawings,
  mobileCases,
  sideNavHref,
  heroTextClassName,
  heroTextLayout = "default",
}: HomePageViewProps) {
  return (
    <>
      <ScrollLock />
      <main className="relative min-h-dvh w-full overscroll-none lg:fixed lg:inset-0 lg:h-dvh lg:overflow-hidden">
        <Zine218Hero
          cases={cases}
          drawings={drawings}
          mobileCases={mobileCases}
          sideNavHref={sideNavHref}
          heroTextClassName={heroTextClassName}
          heroTextLayout={heroTextLayout}
        />
      </main>
    </>
  );
}
