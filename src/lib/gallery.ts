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
