"use client";

import dynamic from "next/dynamic";

import type { GalleryEntry } from "@/lib/gallery";

const MobileCasesGallery = dynamic(
  () =>
    import("@/components/home/MobileCasesGallery").then(
      (module) => module.MobileCasesGallery,
    ),
  { ssr: false },
);

type MobileCasesGalleryClientProps = {
  items: GalleryEntry[];
  imageAnchor?: "bottom" | "center";
};

export function MobileCasesGalleryClient({
  items,
  imageAnchor = "bottom",
}: MobileCasesGalleryClientProps) {
  return <MobileCasesGallery items={items} imageAnchor={imageAnchor} />;
}
