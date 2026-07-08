import { Zine218Hero } from "@/components/home/Zine218Hero";
import { ScrollLock } from "@/components/ScrollLock";
import { loadGalleryManifest } from "@/lib/loadGalleryManifest";

export default function Home() {
  const { items: cases } = loadGalleryManifest("cases");
  const { items: drawings } = loadGalleryManifest("drawings");

  return (
    <>
      <ScrollLock />
      <main className="relative h-dvh w-full overflow-hidden overscroll-none max-lg:fixed max-lg:inset-0 lg:fixed lg:inset-0">
        <Zine218Hero cases={cases} drawings={drawings} />
      </main>
    </>
  );
}
