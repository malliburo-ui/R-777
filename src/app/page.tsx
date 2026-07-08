import { Zine218Hero } from "@/components/home/Zine218Hero";
import { ScrollLock } from "@/components/ScrollLock";
import { loadGalleryManifest } from "@/lib/loadGalleryManifest";

export default function Home() {
  const { items: cases } = loadGalleryManifest("cases");
  const { items: drawings } = loadGalleryManifest("drawings");

  return (
    <>
      <ScrollLock />
      <main className="relative min-h-dvh w-full overscroll-none lg:fixed lg:inset-0 lg:h-dvh lg:overflow-hidden">
        <Zine218Hero cases={cases} drawings={drawings} />
      </main>
    </>
  );
}
