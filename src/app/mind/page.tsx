import { MindHero } from "@/components/home/MindHero";
import { ScrollLock } from "@/components/ScrollLock";
import { loadGalleryManifest } from "@/lib/loadGalleryManifest";

export default function MindPage() {
  const { items: drawings } = loadGalleryManifest("mind");

  return (
    <>
      <ScrollLock />
      <main className="fixed inset-0 h-dvh w-full overflow-hidden overscroll-none">
        <MindHero drawings={drawings} />
      </main>
    </>
  );
}
