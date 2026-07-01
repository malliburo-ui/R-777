#!/usr/bin/env node
/**
 * Scans public/projects/images/ and writes public/projects/projects.json.
 *
 * Naming: 01-my-project.png → order by prefix, title "My Project"
 * Custom titles: edit projects.meta.json (optional)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.join(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "public/projects/images");
const MANIFEST_PATH = path.join(ROOT, "public/projects/projects.json");
const META_PATH = path.join(ROOT, "public/projects/projects.meta.json");

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;

function titleFromFilename(filename) {
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  const withoutOrder = withoutExt.replace(/^\d+[-_.\s]*/, "");
  const words = withoutOrder.replace(/[-_]+/g, " ").trim();

  if (!words) {
    return filename;
  }

  return words.replace(/\b\w/g, (char) => char.toUpperCase());
}

function idFromFilename(filename) {
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  const withoutOrder = withoutExt.replace(/^\d+[-_.\s]*/, "");
  const slug = withoutOrder
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || filename.replace(/\.[^.]+$/, "").toLowerCase();
}

function loadMeta() {
  if (!fs.existsSync(META_PATH)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(META_PATH, "utf8"));
  } catch {
    console.warn("⚠ Could not parse projects.meta.json — ignoring.");
    return {};
  }
}

function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const meta = loadMeta();
  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((name) => IMAGE_EXT.test(name) && !name.startsWith("."))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (files.length === 0) {
    console.log("No images in public/projects/images/");
    console.log("Drop files like: 01-fintech.png, 02-branding.jpg");
    process.exit(0);
  }

  const projects = files.map((image) => {
    const override = meta[image] ?? {};
    const id = override.id ?? idFromFilename(image);
    const title = override.title ?? titleFromFilename(image);

    return { id, title, image };
  });

  fs.writeFileSync(
    MANIFEST_PATH,
    `${JSON.stringify({ projects }, null, 2)}\n`,
    "utf8",
  );

  console.log(`✓ ${projects.length} project(s) → public/projects/projects.json`);
  projects.forEach((project, index) => {
    console.log(`  ${index + 1}. ${project.title} (${project.image})`);
  });
}

main();
