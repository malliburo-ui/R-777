"use client";

import { SideScrollGallery } from "@/components/home/SideScrollGallery";
import type { GalleryEntry } from "@/lib/gallery";

type HomeGalleriesProps = {
  cases: GalleryEntry[];
  drawings: GalleryEntry[];
};

export function HomeGalleries({ cases, drawings }: HomeGalleriesProps) {
  return (
    <>
      <SideScrollGallery
        side="left"
        sectionLabel="CASES"
        items={cases}
        imageBasePath="/cases/web"
        previewAnchor="bottom-left"
      />

      <SideScrollGallery
        side="right"
        sectionLabel="DRAWINGS"
        items={drawings}
        imageBasePath="/drawings/web"
        previewAnchor="top-right"
        previewFit="natural"
      />
    </>
  );
}
