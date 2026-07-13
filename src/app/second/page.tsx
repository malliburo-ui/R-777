import { HomePageView } from "@/components/home/HomePageView";
import { carvingFont } from "@/lib/carvingFont";
import { loadGalleryManifest, loadMobileCasesManifest } from "@/lib/loadGalleryManifest";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Second — Visual researcher",
};

export default function SecondPage() {
  const { items: cases } = loadGalleryManifest("cases");
  const { items: drawings } = loadGalleryManifest("drawings");
  const { items: mobileCases } = loadMobileCasesManifest();

  return (
    <HomePageView
      cases={cases}
      drawings={drawings}
      mobileCases={mobileCases}
      sideNavHref="/"
      heroTextClassName={carvingFont.className}
    />
  );
}
