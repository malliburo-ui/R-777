#!/usr/bin/env node
/**
 * Usage: node scripts/sync-gallery.mjs cases | drawings
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GALLERY_FOLDERS = ["cases", "drawings", "mind", "cv-cube"];
const SOURCE_GIF = /\.gif$/i;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function titleFromFilename(filename) {
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  const withoutOrder = withoutExt.replace(/^\d+[-_.\s]*/, "");
  const words = withoutOrder.replace(/[-_]+/g, " ").trim();
  if (!words) return filename;
  return words.replace(/\b\w/g, (char) => char.toUpperCase());
}

function idFromFilename(filename) {
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  const withoutOrder = withoutExt.replace(/^\d+[-_.\s]*/, "");
  const slug = withoutOrder
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || withoutExt.toLowerCase();
}

function servedWebName(sourceName) {
  if (SOURCE_GIF.test(sourceName)) {
    return sourceName;
  }

  return sourceName.replace(/\.(png|jpe?g|gif)$/i, ".webp");
}

function buildAltImageMap(allSourceFiles) {
  const altImages = {};

  for (const altSource of allSourceFiles) {
    if (!/^\d+B\.(png|jpe?g|gif)$/i.test(altSource)) {
      continue;
    }

    const baseSource = altSource.replace(/B(\.(png|jpe?g|gif))$/i, "$1");
    if (!allSourceFiles.includes(baseSource)) {
      continue;
    }

    altImages[servedWebName(baseSource)] = servedWebName(altSource);
  }

  return altImages;
}

function main() {
  const folder = process.argv[2];
  if (!GALLERY_FOLDERS.includes(folder)) {
    console.error(`Usage: node scripts/sync-gallery.mjs <${GALLERY_FOLDERS.join("|")}>`);
    process.exit(1);
  }

  const imagesDir = path.join(ROOT, "public", folder, "images");
  const manifestPath = path.join(ROOT, "public", folder, `${folder}.json`);
  const metaPath = path.join(ROOT, "public", folder, `${folder}.meta.json`);
  const webDir = path.join(ROOT, "public", folder, "web");

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  let meta = {};
  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch {
      console.warn(`⚠ Could not parse ${folder}.meta.json`);
    }
  }

  const allSourceFiles = fs
    .readdirSync(imagesDir)
    .filter((name) => !name.startsWith("."));

  const sourceFiles = allSourceFiles
    .filter((name) => /^\d+\.(png|jpe?g|gif)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (sourceFiles.length === 0) {
    fs.writeFileSync(manifestPath, `${JSON.stringify({ items: [] }, null, 2)}\n`, "utf8");
    console.log(`No PNG/GIF sources in public/${folder}/images/ — wrote empty manifest`);
    process.exit(0);
  }

  const items = sourceFiles.map((sourceName) => {
    const servedName = servedWebName(sourceName);
    const override = meta[sourceName] ?? meta[servedName] ?? {};
    return {
      id: override.id ?? idFromFilename(sourceName),
      title: override.title ?? titleFromFilename(sourceName),
      image: override.image ?? servedName,
    };
  });

  const altImages = buildAltImageMap(allSourceFiles);
  const manifest = { items, ...(Object.keys(altImages).length > 0 ? { altImages } : {}) };

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  if (!fs.existsSync(webDir)) {
    console.warn(`⚠ public/${folder}/web/ not found — run: npm run gallery:optimize`);
  }

  console.log(`✓ ${items.length} item(s) → public/${folder}/${folder}.json (served from web/)`);
  items.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.title} (${item.image})`);
  });

  if (Object.keys(altImages).length > 0) {
    console.log(`✓ ${Object.keys(altImages).length} blue-background variant(s)`);
    Object.entries(altImages).forEach(([base, alt]) => {
      console.log(`  ${base} → ${alt}`);
    });
  }
}

main();
