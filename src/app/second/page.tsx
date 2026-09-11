import { HomePageView } from "@/components/home/HomePageView";
import { carvingFont } from "@/lib/carvingFont";
import { loadGalleryManifest, loadMobileCasesManifest } from "@/lib/loadGalleryManifest";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Second — Visual researcher",
};

export default function SecondPage() {
  const { items: cases, altImages: casesAltImages } = loadGalleryManifest("cases");
  const { items: drawings, altImages: drawingsAltImages } = loadGalleryManifest("drawings");
  const { items: mobileCases } = loadMobileCasesManifest();

  return (
    <HomePageView
      cases={cases}
      casesAltImages={casesAltImages}
      drawings={drawings}
      drawingsAltImages={drawingsAltImages}
      mobileCases={mobileCases}
      sideNavHref="/"
      heroTextClassName={carvingFont.className}
      heroTextLayout="spread"
      mobileGalleryAnchor="center"
    />
  );
}
