import { mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";

const sourceRoot = path.resolve("..", "民勤活动照片");
const outputRoot = path.resolve("public", "media");

const photos = [
  ["IMG_20260803_125204_edit_97007053134155.jpg", "2026-08-03/journey-sky.webp"],
  ["IMG_20260803_131232.jpg", "2026-08-03/journey-village.webp"],
  ["IMG_20260803_200030.jpg", "2026-08-03/desert-sunset.webp"],
  ["IMG_20260803_202338.jpg", "2026-08-03/berries-close.webp"],
  ["IMG_20260803_200448.jpg", "2026-08-03/twilight-field.webp"],
  ["IMG_20260803_204149.jpg", "2026-08-03/night-flags.webp"],
  ["IMG_20260804_075235.jpg", "2026-08-04/dawn-desert.webp"],
  ["IMG_20260804_081129.jpg", "2026-08-04/seedling.webp"],
  ["IMG_20260804_081027.jpg", "2026-08-04/team-walk.webp"],
  ["IMG_20260804_090322.jpg", "2026-08-04/irrigation-line.webp"],
  ["IMG_20260804_090648.jpg", "2026-08-04/banner-team.webp"],
  ["IMG_20260804_090242.jpg", "2026-08-04/banner-landscape.webp"],
  ["IMG_20260804_091111.jpg", "2026-08-04/sand-traces.webp"],
  ["IMG_20260804_091251.jpg", "2026-08-04/water-work.webp"],
  ["IMG_20260804_103528.jpg", "2026-08-04/volunteer-base.webp"],
  ["IMG_20260804_103538.jpg", "2026-08-04/volunteer-signs.webp"],
];

const videos = [
  ["VID_20260803_150248.mp4", "2026-08-03/road-to-minqin.mp4", 0, 12],
  ["VID_20260803_200529.mp4", "2026-08-03/desert-observation.mp4", 0, 12],
  ["VID_20260804_083737.mp4", "2026-08-04/irrigation-arrival.mp4", 0, 14],
  ["VID_20260804_083748.mp4", "2026-08-04/watering-together.mp4", 0, 14],
];

await mkdir(outputRoot, { recursive: true });

for (const [sourceName, outputName] of photos) {
  const source = path.join(sourceRoot, sourceName);
  const output = path.join(outputRoot, outputName);
  const filename = path.basename(outputName);
  await mkdir(path.dirname(output), { recursive: true });
  await sharp(source)
    .rotate()
    .resize({ width: filename === "banner-team.webp" ? 2200 : 1600, height: 1400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: filename === "banner-team.webp" ? 84 : 78, effort: 5 })
    .toFile(output);
}

for (const [sourceName, outputName, start, duration] of videos) {
  const source = path.join(sourceRoot, sourceName);
  const output = path.join(outputRoot, outputName);
  await mkdir(path.dirname(output), { recursive: true });
  await rm(output, { force: true });
  const result = spawnSync(ffmpegPath, [
    "-hide_banner", "-loglevel", "error", "-ss", String(start), "-i", source,
    "-t", String(duration), "-vf", "scale=960:-2", "-c:v", "libx264",
    "-preset", "medium", "-crf", "29", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", "-an", "-y", output,
  ], { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`ffmpeg failed for ${sourceName}`);
}

const faviconSvg = Buffer.from(`
  <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="16" fill="#183d30"/>
    <circle cx="32" cy="32" r="23" fill="none" stroke="#e5c57e" stroke-width="2"/>
    <text x="32" y="42" text-anchor="middle" font-family="serif" font-size="29" fill="#f7f2e8">绿</text>
  </svg>
`);
await sharp(faviconSvg).png().toFile(path.resolve("public", "favicon.png"));

console.log(`Prepared ${photos.length} photos and ${videos.length} short videos in ${outputRoot}`);
