#!/usr/bin/env node
/**
 * Usage: node scripts/sync-gallery.mjs cases | drawings
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;

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

function main() {
  const folder = process.argv[2];
  if (folder !== "cases" && folder !== "drawings") {
    console.error("Usage: node scripts/sync-gallery.mjs <cases|drawings>");
    process.exit(1);
  }

  const imagesDir = path.join(ROOT, "public", folder, "images");
  const manifestPath = path.join(ROOT, "public", folder, `${folder}.json`);
  const metaPath = path.join(ROOT, "public", folder, `${folder}.meta.json`);

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

  const files = fs
    .readdirSync(imagesDir)
    .filter((name) => IMAGE_EXT.test(name) && !name.startsWith("."))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (files.length === 0) {
    console.log(`No images in public/${folder}/images/`);
    process.exit(0);
  }

  const items = files.map((image) => {
    const override = meta[image] ?? {};
    return {
      id: override.id ?? idFromFilename(image),
      title: override.title ?? titleFromFilename(image),
      image,
    };
  });

  fs.writeFileSync(manifestPath, `${JSON.stringify({ items }, null, 2)}\n`, "utf8");

  console.log(`✓ ${items.length} item(s) → public/${folder}/${folder}.json`);
  items.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.title} (${item.image})`);
  });
}

main();
