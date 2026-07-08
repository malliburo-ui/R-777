#!/usr/bin/env node
/**
 * Build WebP previews from PNG sources in public/{cases|drawings}/images/.
 * Usage: node scripts/optimize-gallery.mjs [cases|drawings|all]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const GALLERY_FOLDERS = ["cases", "drawings", "mind", "cv-cube"];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const MAX_EDGE = 1600;
const WEBP_QUALITY = 88;

const SOURCE_RASTER = /\.(png|jpe?g)$/i;
const SOURCE_GIF = /\.gif$/i;
const SOURCE_NAME = /^\d+\.(png|jpe?g|gif)$/i;

async function optimizeFolder(folder) {
  const sourceDir = path.join(ROOT, "public", folder, "images");
  const webDir = path.join(ROOT, "public", folder, "web");

  if (!fs.existsSync(sourceDir)) {
    console.warn(`⚠ Skipping ${folder}: no images/ folder`);
    return { folder, count: 0, savedBytes: 0 };
  }

  fs.mkdirSync(webDir, { recursive: true });

  const sources = fs
    .readdirSync(sourceDir)
    .filter((name) => SOURCE_NAME.test(name) && !name.startsWith("."))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (sources.length === 0) {
    console.log(`No PNG/GIF sources in public/${folder}/images/`);
    return { folder, count: 0, savedBytes: 0 };
  }

  const activeWebNames = new Set();

  let savedBytes = 0;

  for (const sourceName of sources) {
    const sourcePath = path.join(sourceDir, sourceName);
    const isGif = SOURCE_GIF.test(sourceName);
    const webName = sourceName.replace(/\.(png|jpe?g|gif)$/i, ".webp");
    const webPath = path.join(webDir, webName);
    activeWebNames.add(webName);

    if (isGif) {
      await sharp(sourcePath, { animated: true, pages: -1 })
        .webp({
          quality: WEBP_QUALITY,
          alphaQuality: 100,
          effort: 4,
        })
        .toFile(webPath);

      const sourceSize = fs.statSync(sourcePath).size;
      const webSize = fs.statSync(webPath).size;
      savedBytes += Math.max(0, sourceSize - webSize);

      console.log(
        `  ${sourceName} → web/${webName} (${formatBytes(sourceSize)} → ${formatBytes(webSize)}, animated)`,
      );
      continue;
    }

    await sharp(sourcePath)
      .rotate()
      .resize(MAX_EDGE, MAX_EDGE, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: WEBP_QUALITY,
        alphaQuality: 100,
        effort: 4,
      })
      .toFile(webPath);

    const sourceSize = fs.statSync(sourcePath).size;
    const webSize = fs.statSync(webPath).size;
    savedBytes += Math.max(0, sourceSize - webSize);

    console.log(
      `  ${sourceName} → web/${webName} (${formatBytes(sourceSize)} → ${formatBytes(webSize)})`,
    );
  }

  for (const webName of fs.readdirSync(webDir)) {
    if (!activeWebNames.has(webName) && !webName.startsWith(".")) {
      fs.unlinkSync(path.join(webDir, webName));
      console.log(`  removed stale web/${webName}`);
    }
  }

  return { folder, count: sources.length, savedBytes };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function main() {
  const target = process.argv[2] ?? "all";
  const folders =
    target === "all"
      ? GALLERY_FOLDERS
      : GALLERY_FOLDERS.includes(target)
        ? [target]
        : null;

  if (!folders) {
    console.error(`Usage: node scripts/optimize-gallery.mjs [${GALLERY_FOLDERS.join("|")}|all]`);
    process.exit(1);
  }

  console.log(`Optimizing gallery images (max ${MAX_EDGE}px, WebP q${WEBP_QUALITY})…\n`);

  let totalSaved = 0;
  let totalCount = 0;

  for (const folder of folders) {
    console.log(`${folder.toUpperCase()}:`);
    const result = await optimizeFolder(folder);
    totalSaved += result.savedBytes;
    totalCount += result.count;
    console.log("");
  }

  console.log(`✓ ${totalCount} image(s) optimized, ~${formatBytes(totalSaved)} saved vs PNG sources`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
