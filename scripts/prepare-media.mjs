import { mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";

const sourceRoot = path.resolve("..", "民勤活动照片");
const yssRoot = path.resolve("..", "民勤暑期实践照片-yss");
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

const newPhotos = [
  ["8.3 摘白刺果", "IMG_0924.jpg", "2026-08-03/fruit-sunset-team.webp"],
  ["8.3 摘白刺果", "IMG_0928.jpg", "2026-08-03/fruit-picking.webp"],
  ["8.3 摘白刺果", "IMG_0933.jpg", "2026-08-03/fruit-bearing-shrub.webp"],
  ["8.3 摘白刺果", "IMG_0940.jpg", "2026-08-03/fruit-collection.webp"],
  ["8.3 摘白刺果", "IMG_0967.jpg", "2026-08-03/fruit-drying.webp"],
  ["8.3晚 中暑科普", "IMG_0972.jpg", "2026-08-03/heat-science-presenter.webp"],
  ["8.3晚 中暑科普", "IMG_0985.jpg", "2026-08-03/heat-science-audience.webp"],
  ["8.3晚 中暑科普", "IMG_1006.jpg", "2026-08-03/heat-science-slides.webp"],
  ["8.3晚 中暑科普", "IMG_1038.jpg", "2026-08-03/heat-science-demo.webp"],
  ["8.4 浇水维护", "IMG_1085.jpg", "2026-08-04/watering-truck.webp"],
  ["8.4 浇水维护", "IMG_1092.jpg", "2026-08-04/watering-hose-team.webp"],
  ["8.4 浇水维护", "IMG_1100.jpg", "2026-08-04/watering-field-walk.webp"],
  ["8.4 浇水维护", "IMG_1111.jpg", "2026-08-04/watering-shrub-detail.webp"],
  ["8.4 浇水维护", "IMG_1119.jpg", "2026-08-04/watering-action.webp"],
  ["基地环境照片", "IMG_0911.jpg", "2026-08-03/base-dune-installation.webp", 2200],
  ["基地环境照片", "IMG_1127.jpg", "2026-08-04/volunteer-sign-field.webp", 2200],
  ["基地环境照片", "IMG_1154.jpg", "2026-08-04/forest-technical-board.webp"],
  ["基地环境照片", "IMG_1202.jpg", "2026-08-04/sunset-flags-base.webp", 2200],
];

const newVideos = [
  ["8.3 摘白刺果", "IMG_0925.MOV", "2026-08-03/fruit-field.mp4", 0, 5],
  ["8.3晚 中暑科普", "IMG_0989.MOV", "2026-08-03/heat-science.mp4", 1, 14],
  ["8.3晚 直播卖瓜", "76070.MP4", "2026-08-03/live-melon.mp4", 0, 14, "crop=iw:trunc(ih*0.32/2)*2:0:trunc(ih*0.25/2)*2,scale=960:-2"],
  ["8.4 浇水维护", "IMG_1097.MOV", "2026-08-04/water-flow.mp4", 7, 14],
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

for (const [folder, sourceName, outputName, maxWidth = 1600] of newPhotos) {
  const source = path.join(yssRoot, folder, sourceName);
  const output = path.join(outputRoot, outputName);
  await mkdir(path.dirname(output), { recursive: true });
  await sharp(source)
    .rotate()
    .resize({ width: maxWidth, height: 1500, fit: "inside", withoutEnlargement: true })
    .webp({ quality: maxWidth > 1600 ? 84 : 80, effort: 5 })
    .toFile(output);
}

const liveStillSource = path.join(yssRoot, "8.3晚 直播卖瓜", "76067.JPG");
await sharp(liveStillSource)
  .extract({ left: 0, top: 700, width: 1280, height: 1050 })
  .resize({ width: 1280, withoutEnlargement: true })
  .webp({ quality: 82, effort: 5 })
  .toFile(path.join(outputRoot, "2026-08-03", "live-melon-still.webp"));

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

for (const [folder, sourceName, outputName, start, duration, videoFilter = "scale=960:-2"] of newVideos) {
  const source = path.join(yssRoot, folder, sourceName);
  const output = path.join(outputRoot, outputName);
  await mkdir(path.dirname(output), { recursive: true });
  await rm(output, { force: true });
  const result = spawnSync(ffmpegPath, [
    "-hide_banner", "-loglevel", "error", "-ss", String(start), "-i", source,
    "-t", String(duration), "-vf", videoFilter, "-c:v", "libx264",
    "-preset", "medium", "-crf", "29", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", "-map_metadata", "-1", "-an", "-y", output,
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

console.log(`Prepared ${photos.length + newPhotos.length + 1} photos and ${videos.length + newVideos.length} short videos in ${outputRoot}`);
