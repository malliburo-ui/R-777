import fs from "node:fs";
import path from "node:path";

import type { GalleryManifest } from "@/lib/gallery";

export function loadGalleryManifest(folder: "cases" | "drawings"): GalleryManifest {
  const manifestPath = path.join(process.cwd(), `public/${folder}/${folder}.json`);

  try {
    const raw = fs.readFileSync(manifestPath, "utf8");
    const data = JSON.parse(raw) as GalleryManifest;

    if (!Array.isArray(data.items)) {
      return { items: [] };
    }

    return data;
  } catch {
    return { items: [] };
  }
}
