import Link from "next/link";

import { CvCubeScene } from "@/components/cv/CvCubeScene";
import { loadGalleryManifest } from "@/lib/loadGalleryManifest";

export default function CvPage() {
  const { items } = loadGalleryManifest("cv-cube");

  return (
    <main className="fixed inset-0 h-dvh w-full overflow-hidden bg-portfolio-bg">
      <Link
        href="/"
        aria-label="Back to home"
        className="absolute left-0 top-0 z-20 block size-[100px]"
      />
      <CvCubeScene items={items} />
    </main>
  );
}
