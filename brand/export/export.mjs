#!/usr/bin/env node
/**
 * Regenerate every brand PNG / ICO from the SVG masters in brand/.
 *
 * Usage (from the repo root): pnpm brand:export
 *
 * The SVG files are the source of truth. This script only produces raster
 * exports, including the generated copies that Next.js requires under
 * apps/web/src/app/ and apps/web/public/.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { copyFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const brandDir = resolve(scriptDir, "..");
const repoDir = resolve(brandDir, "..");
const iconDir = join(brandDir, "icon");
const socialDir = join(brandDir, "social");
const exportDir = join(brandDir, "export");
const webAppDir = join(repoDir, "apps", "web", "src", "app");
const webPublicDir = join(repoDir, "apps", "web", "public");

for (const dir of [exportDir, webAppDir, webPublicDir]) {
  mkdirSync(dir, { recursive: true });
}

const png = { compressionLevel: 9 };

async function render(svgName, width, height = width) {
  const svgPath = join(iconDir, svgName);
  return sharp(readFileSync(svgPath))
    .resize(width, height, { fit: "fill" })
    .png(png)
    .toBuffer();
}

async function writePng(svgName, filename, size) {
  const buffer = await render(svgName, size);
  writeFileSync(join(exportDir, filename), buffer);
  return buffer;
}

/**
 * Build a modern PNG-in-ICO file. Windows Vista+, every current browser and
 * Next.js read this fine.
 */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  const entries = Buffer.alloc(16 * images.length);
  let offset = 6 + 16 * images.length;

  images.forEach(({ size, buffer }, index) => {
    const at = index * 16;
    const dimension = size >= 256 ? 0 : size;
    entries.writeUInt8(dimension, at);
    entries.writeUInt8(dimension, at + 1);
    entries.writeUInt8(0, at + 2); // colour count
    entries.writeUInt8(0, at + 3); // reserved
    entries.writeUInt16LE(1, at + 4); // colour planes
    entries.writeUInt16LE(32, at + 6); // bits per pixel
    entries.writeUInt32LE(buffer.length, at + 8);
    entries.writeUInt32LE(offset, at + 12);
    offset += buffer.length;
  });

  return Buffer.concat([header, entries, ...images.map((i) => i.buffer)]);
}

async function copy(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  await copyFile(from, to);
}

/**
 * Render a full-path SVG (social artwork lives in brand/social, not
 * brand/icon) with the same options as render().
 */
async function renderFile(svgPath, width, height = width) {
  if (!existsSync(svgPath)) {
    throw new Error(`Missing source SVG: ${svgPath}`);
  }
  return sharp(readFileSync(svgPath))
    .resize(width, height, { fit: "fill" })
    .png(png)
    .toBuffer();
}

console.log("Rendering brand PNGs from SVG masters…");

const favicon16 = await writePng("favicon-16.svg", "favicon-16.png", 16);
const favicon32 = await writePng("favicon-32.svg", "favicon-32.png", 32);
writeFileSync(
  join(exportDir, "favicon.ico"),
  buildIco([
    { size: 16, buffer: favicon16 },
    { size: 32, buffer: favicon32 },
  ]),
);

await writePng("filled-sibling.svg", "apple-icon-180.png", 180);
await writePng("app-icon.svg", "app-icon-192.png", 192);
await writePng("app-icon.svg", "app-icon-512.png", 512);
await writePng("maskable-512.svg", "maskable-512.png", 512);
await writePng("master.svg", "logo-512.png", 512);

const avatar = await renderFile(join(socialDir, "avatar-400.svg"), 400, 400);
writeFileSync(join(exportDir, "avatar-400.png"), avatar);
writeFileSync(join(socialDir, "avatar-400.png"), avatar);

const og = await renderFile(join(socialDir, "og-1200x630.svg"), 1200, 630);
writeFileSync(join(exportDir, "og-1200x630.png"), og);
writeFileSync(join(socialDir, "og-1200x630.png"), og);

console.log("Syncing generated copies into apps/web…");

// Next.js special files. Edit the SVG masters, then re-run this script.
await copy(join(iconDir, "favicon.svg"), join(webAppDir, "icon.svg"));
await copy(join(exportDir, "favicon.ico"), join(webAppDir, "favicon.ico"));
await copy(
  join(exportDir, "apple-icon-180.png"),
  join(webAppDir, "apple-icon.png"),
);

// Public assets used by Clerk, the web manifest and legacy iOS home screens.
await copy(join(exportDir, "logo-512.png"), join(webPublicDir, "logo.png"));
await copy(
  join(exportDir, "app-icon-192.png"),
  join(webPublicDir, "icon-192.png"),
);
await copy(
  join(exportDir, "app-icon-512.png"),
  join(webPublicDir, "icon-512.png"),
);
await copy(
  join(exportDir, "maskable-512.png"),
  join(webPublicDir, "maskable-512.png"),
);
await copy(
  join(exportDir, "apple-icon-180.png"),
  join(webPublicDir, "apple-touch-icon.png"),
);

console.log("Done. Generated files:");
console.log("  brand/export/*.png, brand/export/favicon.ico");
console.log("  brand/social/avatar-400.png, brand/social/og-1200x630.png");
console.log("  apps/web/src/app/{icon.svg,favicon.ico,apple-icon.png}");
console.log(
  "  apps/web/public/{logo.png,apple-touch-icon.png,icon-192.png,icon-512.png,maskable-512.png}",
);
