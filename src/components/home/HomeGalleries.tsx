"use client";

import { SideScrollGallery } from "@/components/home/SideScrollGallery";
import type { GalleryAltImageMap, GalleryEntry } from "@/lib/gallery";

type HomeGalleriesProps = {
  cases: GalleryEntry[];
  casesAltImages?: GalleryAltImageMap;
  drawings: GalleryEntry[];
  drawingsAltImages?: GalleryAltImageMap;
};

export function HomeGalleries({
  cases,
  casesAltImages,
  drawings,
  drawingsAltImages,
}: HomeGalleriesProps) {
  return (
    <>
      <SideScrollGallery
        side="left"
        sectionLabel="CASES"
        items={cases}
        imageBasePath="/cases/web"
        previewAnchor="bottom-left"
        altImageMap={casesAltImages}
      />

      <SideScrollGallery
        side="right"
        sectionLabel="DRAWINGS"
        items={drawings}
        imageBasePath="/drawings/web"
        previewAnchor="top-right"
        previewFit="natural"
        altImageMap={drawingsAltImages}
      />
    </>
  );
}
