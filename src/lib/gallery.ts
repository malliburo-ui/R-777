export type GalleryEntry = {
  id: string;
  title: string;
  image: string;
};

export type GalleryAltImageMap = Record<string, string>;

export type GalleryManifest = {
  items: GalleryEntry[];
  altImages?: GalleryAltImageMap;
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

export function resolveAltGalleryImage(
  filename: string,
  altBackgroundActive: boolean,
  altImageMap?: GalleryAltImageMap,
) {
  if (!altBackgroundActive || !altImageMap) {
    return filename;
  }

  return altImageMap[filename] ?? filename;
}
