export type GalleryEntry = {
  id: string;
  title: string;
  image: string;
};

export type GalleryManifest = {
  items: GalleryEntry[];
};

export function galleryImagePath(basePath: string, filename: string) {
  return `${basePath}/${filename}`;
}

/** Animated GIF sources are served from images/, raster previews from web/. */
export function resolveGalleryAssetPath(imageBasePath: string, filename: string) {
  if (/\.gif$/i.test(filename)) {
    return `${imageBasePath.replace(/\/web$/, "/images")}/${filename}`;
  }

  return galleryImagePath(imageBasePath, filename);
}
