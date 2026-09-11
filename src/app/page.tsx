import { HomePageView } from "@/components/home/HomePageView";
import { loadGalleryManifest, loadMobileCasesManifest } from "@/lib/loadGalleryManifest";

export default function Home() {
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
      sideNavHref="/second"
    />
  );
}
