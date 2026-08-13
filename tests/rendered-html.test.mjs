import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html", host: "localhost" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

const contentFiles = ["types.ts", "sources.ts", "media.ts", "story-points.ts", "field-timeline.ts", "field-tracks.ts", "water-stages.ts", "resources.ts", "exhibit-scenes.ts", "evidence-index.ts", "index.ts"];
const componentFiles = [
  "components/experience/experience.tsx",
  "components/map/interactive-map.tsx",
  "components/exhibit/digital-exhibit.tsx",
  "components/exhibit/exhibit-chrome.tsx",
  "components/exhibit/tour-stage.tsx",
  "components/sections/long-form-page.tsx",
  "hooks/use-minqin-map.ts",
  "lib/map-config.ts",
];

test("server-renders the maintained 2026 practice atlas", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  for (const label of ["民勤中医药生态文化数字地图", "2026暑期实践数字成果", "项目档案", "进入数字展框", "自由浏览", "实践足迹", "绿洲水脉", "药材产业", "人物故事", "实践影像", "资料与方法说明"]) assert.match(html, new RegExp(label));
  assert.match(html, /og:image/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("server-renders the five-chapter homepage story spine", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const title of ["河西入境", "水写绿洲", "两日实践", "科技与沙产业", "青年守护"]) assert.match(html, new RegExp(title));
  for (const id of ["hexi-entry", "water-oasis", "field-days", "science-industry", "youth-guardians"]) assert.match(html, new RegExp(`data-chapter="${id}"`));
  assert.equal((html.match(/data-chapter=/g) ?? []).length, 5);
  assert.equal((html.match(/进入这一章/g) ?? []).length, 5);
  for (const action of ["开始自动导览", "进入数字展框", "自由浏览"]) assert.match(html, new RegExp(action));
  for (const archiveLabel of ["项目档案", "完整实践影像", "水脉历史切片", "药材资料", "资料与方法说明"]) assert.match(html, new RegExp(archiveLabel));

  const longForm = await readFile(new URL("../app/components/sections/long-form-page.tsx", import.meta.url), "utf8");
  assert.match(longForm, /tourChapters\.map/);
  assert.match(longForm, /mediaById\.get\(chapter\.leadMediaId\)/);
  assert.match(longForm, /onStartExhibit\(index\)/);
  assert.match(longForm, /new IntersectionObserver/);
  assert.match(longForm, /aria-current/);

  const experience = await readFile(new URL("../app/components/experience/experience.tsx", import.meta.url), "utf8");
  assert.match(experience, /params\.get\("chapter"\)/);
  assert.match(experience, /tourChapters\[chapterIndex\]\.id/);
  assert.match(experience, /history\.replaceState/);
  assert.equal((experience.match(/<InteractiveMap\b/g) ?? []).length, 1, "homepage and exhibit must share one InteractiveMap render");
});

test("keeps content, map, exhibit and page responsibilities separated", async () => {
  await Promise.all(contentFiles.map((file) => access(new URL(`../content/${file}`, import.meta.url))));
  await Promise.all(componentFiles.map((file) => access(new URL(`../app/${file}`, import.meta.url))));
  for (const file of ["base.css", "page.css", "map.css", "exhibit.css", "responsive.css"]) {
    const css = await readFile(new URL(`../app/styles/${file}`, import.meta.url), "utf8");
    assert.ok(css.length > 100, `${file} should contain its scoped styles`);
  }
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /components\/experience\/experience/);
  const index = await readFile(new URL("../content/index.ts", import.meta.url), "utf8");
  for (const moduleName of ["sources", "media", "story-points", "field-timeline", "field-tracks", "water-stages", "resources", "exhibit-scenes"]) assert.match(index, new RegExp(`\\./${moduleName}`));
});

test("ships curated dated media, local map and social card", async () => {
  const mediaContent = await readFile(new URL("../content/media.ts", import.meta.url), "utf8");
  const appSource = (await Promise.all(componentFiles.map((file) => readFile(new URL(`../app/${file}`, import.meta.url), "utf8")))).join("\n");
  assert.match(appSource, /localArchivePath = "\/maps\/minqin-2026\.pmtiles"/);
  assert.match(appSource, /本地离线底图/);
  assert.match(appSource, /武威市 \/ 凉州/);
  assert.match(appSource, /叙事路径，非导航路线/);
  assert.doesNotMatch(appSource, /oasisShape|oasis-fill|oasis-outline|tiles\.openfreemap\.org/);
  assert.match(appSource, /params\.get\("view"\) === "exhibit"/);
  assert.match(appSource, /get\("map"\) === "fallback"/);
  for (const label of ["五章导览", "实践轨迹", "水脉时间机", "药材标本柜"]) assert.match(appSource, new RegExp(label));

  const mediaPaths = [...mediaContent.matchAll(/(?:src|poster): "(\/media\/[^"?]+)"/g)].map((match) => match[1]);
  assert.ok(new Set(mediaPaths).size >= 20, `expected at least 20 media assets, found ${new Set(mediaPaths).size}`);
  assert.ok(mediaPaths.some((item) => item.startsWith("/media/2026-08-03/")));
  assert.ok(mediaPaths.some((item) => item.startsWith("/media/2026-08-04/")));
  await Promise.all([...new Set(mediaPaths)].map((item) => access(new URL(`public${item}`, root))));
  await access(new URL("../public/media/shared/ambient-zh.vtt", import.meta.url));
  const socialCard = await stat(new URL("../public/og.png", import.meta.url));
  assert.ok(socialCard.size > 100_000 && socialCard.size < 3_000_000, "social card should be optimized for sharing");
});

test("structured datasets retain the expected formal-release counts", async () => {
  const sources = await readFile(new URL("../content/sources.ts", import.meta.url), "utf8");
  const media = await readFile(new URL("../content/media.ts", import.meta.url), "utf8");
  const timeline = await readFile(new URL("../content/field-timeline.ts", import.meta.url), "utf8");
  const water = await readFile(new URL("../content/water-stages.ts", import.meta.url), "utf8");
  const resources = await readFile(new URL("../content/resources.ts", import.meta.url), "utf8");
  const scenes = await readFile(new URL("../content/exhibit-scenes.ts", import.meta.url), "utf8");
  const tracks = await readFile(new URL("../content/field-tracks.ts", import.meta.url), "utf8");
  assert.equal([...timeline.matchAll(/id: "event-/g)].length, 43);
  assert.equal([...tracks.matchAll(/id: "track-/g)].length, 2);
  assert.equal([...water.matchAll(/id: "water-/g)].length, 4);
  assert.equal([...resources.matchAll(/id: "relation-/g)].length, 4);
  assert.equal([...resources.matchAll(/mapPointId: /g)].length, 4);
  assert.equal([...resources.matchAll(/image: \{/g)].length, 4);
  assert.doesNotMatch(resources, /项目计划关注|待调研问题|等待后续公开资料|尚无团队基地调研数据/);
  assert.equal([...scenes.matchAll(/id: /g)].length, 5);
  assert.equal([...media.matchAll(/featured: true/g)].length, 18);
  assert.equal([...media.matchAll(/\{ id: /g)].length, 43);
  assert.ok([...sources.matchAll(/\{ id: /g)].length >= 16);
  assert.equal([...sources.matchAll(/kind: /g)].length, [...sources.matchAll(/\{ id: /g)].length);
  assert.equal([...sources.matchAll(/topics: /g)].length, [...sources.matchAll(/\{ id: /g)].length);
  assert.equal([...sources.matchAll(/summary: /g)].length, [...sources.matchAll(/\{ id: /g)].length);
  for (const image of ["licorice.jpg", "cistanche.jpg", "cynomorium.jpg", "isatis.jpg"]) {
    const imageStat = await stat(new URL(`../public/media/resources/${image}`, import.meta.url));
    assert.ok(imageStat.size > 100_000, `${image} should be a real, non-placeholder photograph`);
  }
});

test("base activity point presents three evidence threads without inventing coordinates", async () => {
  const points = await readFile(new URL("../content/story-points.ts", import.meta.url), "utf8");
  const map = await readFile(new URL("../app/components/map/interactive-map.tsx", import.meta.url), "utf8");
  for (const id of ["heat-prevention-education", "live-aid-attempt", "volunteer-base-evidence"]) assert.match(points, new RegExp(`id: "${id}"`));
  for (const title of ["中暑预防科普", "直播助农尝试", "志愿基地与治沙技术证据"]) assert.match(points, new RegExp(title));
  assert.equal((points.match(/coordinates: \[103\.500018, 38\.73236\]/g) ?? []).length, 1, "the three evidence threads must share the verified base point");
  assert.match(points, /boundary: "[^"]*(?:医学|诊断|治疗|用药)[^"]*"/);
  assert.match(points, /boundary: "[^"]*(?:隐私|账号|订单|销量)[^"]*"/);
  assert.match(points, /不据此虚构培训经历、人物归属或基地边界/);
  assert.match(map, /selected\.evidenceGroups\.map/);
  assert.match(map, /现场证据分组/);
});

test("map archive is a lightweight valid PMTiles package", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.match(packageJson.dependencies["maplibre-gl"], /^\^?5\./);
  const archiveUrl = new URL("../public/maps/minqin-2026.pmtiles", import.meta.url);
  const archiveStat = await stat(archiveUrl);
  assert.ok(archiveStat.size > 500_000 && archiveStat.size < 10_000_000);
  const archive = await readFile(archiveUrl);
  assert.equal(archive.subarray(0, 7).toString("utf8"), "PMTiles");
});

test("local terrain archive is a bounded, traceable raster PMTiles package", async () => {
  const archiveUrl = new URL("../public/maps/minqin-terrain-2026.pmtiles", import.meta.url);
  const provenanceUrl = new URL("../public/maps/minqin-terrain-2026.json", import.meta.url);
  const [archiveStat, archive, provenanceText] = await Promise.all([stat(archiveUrl), readFile(archiveUrl), readFile(provenanceUrl, "utf8")]);
  const provenance = JSON.parse(provenanceText);
  assert.ok(archiveStat.size > 5_000_000 && archiveStat.size < 60_000_000, "terrain archive should remain a bounded Minqin render context");
  assert.equal(archive.subarray(0, 7).toString("utf8"), "PMTiles");
  assert.equal(archive[7], 3, "terrain archive should use PMTiles v3");
  assert.equal(archive[99], 2, "terrain payload should be PNG for Terrarium decoding");
  assert.deepEqual([archive[100], archive[101]], [7, 12]);
  assert.equal(provenance.provider, "Mapzen, a Linux Foundation project, via the AWS Open Data Registry");
  assert.equal(provenance.acquiredAt, "2026-08-13");
  assert.deepEqual(provenance.mapBounds, [102.45, 37.8, 103.75, 39.35]);
  assert.deepEqual(provenance.cropBounds, provenance.renderContextBounds);
  assert.ok(provenance.safetyMarginDegrees >= 0.3);
  assert.ok(provenance.tileCount > 595);
  assert.ok(provenance.sourceDatasets.some((dataset) => /SRTM 1 Arc-Second Global/.test(dataset.name)));
  assert.ok(provenance.imagerySourcesReportedByTiles.some((source) => source.startsWith("srtm/")));
  assert.match(provenance.archiveEncoding, /PMTiles v3 raster archive/);
});

test("local Sentinel-2 surface archive is traceable, bounded and raster encoded", async () => {
  const archiveUrl = new URL("../public/maps/minqin-surface-2026.pmtiles", import.meta.url);
  const provenanceUrl = new URL("../public/maps/minqin-surface-2026.json", import.meta.url);
  const [archiveStat, archive, provenanceText] = await Promise.all([stat(archiveUrl), readFile(archiveUrl), readFile(provenanceUrl, "utf8")]);
  const provenance = JSON.parse(provenanceText);
  assert.ok(archiveStat.size > 2_000_000 && archiveStat.size < 60_000_000, "surface archive should remain a focused Minqin crop");
  assert.equal(archive.subarray(0, 7).toString("utf8"), "PMTiles");
  assert.equal(archive[7], 3, "surface archive should use PMTiles v3");
  assert.equal(archive[99], 3, "surface payload should be JPEG raster tiles");
  assert.deepEqual([archive[100], archive[101]], [7, 13]);
  assert.match(provenance.provider, /Copernicus.+Element 84.+AWS Open Data/);
  assert.equal(provenance.dataset, "Sentinel-2 Collection 1 Level-2A Cloud-Optimized GeoTIFFs");
  assert.equal(provenance.redistributionNotice, "Contains modified Copernicus Sentinel data 2026");
  assert.equal(provenance.acquiredAt, "2026-08-13");
  assert.equal(provenance.sceneDate, "2026-08-06");
  assert.deepEqual(provenance.mapBounds, [102.45, 37.8, 103.75, 39.35]);
  assert.notDeepEqual(provenance.cropBounds, provenance.renderContextBounds, "tracked main surface still records the unresolved render-context coverage gap");
  assert.equal(provenance.scope, "full");
  assert.deepEqual(provenance.bands, ["B04 red", "B03 green", "B02 blue"]);
  assert.ok(provenance.scenes.length >= 4);
  assert.ok(provenance.processing.some((step) => /warm low-saturation color grade/.test(step)));
  assert.match(provenance.archiveEncoding, /PMTiles v3 raster archive/);
});

test("local map keeps one offline MapLibre entry and its route semantics", async () => {
  const experience = await readFile(new URL("../app/components/experience/experience.tsx", import.meta.url), "utf8");
  const hook = await readFile(new URL("../app/hooks/use-minqin-map.ts", import.meta.url), "utf8");
  const map = await readFile(new URL("../app/components/map/interactive-map.tsx", import.meta.url), "utf8");
  const config = await readFile(new URL("../app/lib/map-config.ts", import.meta.url), "utf8");
  const responsive = await readFile(new URL("../app/styles/responsive.css", import.meta.url), "utf8");
  const mapSource = `${experience}\n${hook}\n${map}\n${config}`;
  assert.equal((experience.match(/<InteractiveMap\b/g) ?? []).length, 1);
  assert.equal((hook.match(/new MapLibreMap\(/g) ?? []).length, 1);
  assert.match(config, /pmtiles:\/\//);
  assert.match(config, /localTerrainArchivePath = "\/maps\/minqin-terrain-2026\.pmtiles"/);
  assert.match(config, /localSurfaceArchivePath = "\/maps\/minqin-surface-2026\.pmtiles"/);
  assert.match(config, /localSurfaceFocusArchivePath = "\/maps\/minqin-surface-focus-2026\.pmtiles"/);
  assert.match(mapSource, /叙事路径，非导航路线/);
  assert.match(mapSource, /影像 GPS 采样线/);
  assert.match(mapSource, /非完整轨迹、非导航路线/);
  assert.match(experience, /matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
  assert.match(experience, /async function toggleFullscreen\(\)[\s\S]*requestFullscreen\(\)[\s\S]*catch/);
  assert.match(responsive, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(mapSource, /api\.mapbox\.com|maps\.google|tile\.openstreetmap|tiles\.stadiamaps|basemaps\.cartocdn|tiles\.openfreemap/i);
});

test("hillshade progressively enhances the base map without enabling terrain or fallback coupling", async () => {
  const experience = await readFile(new URL("../app/components/experience/experience.tsx", import.meta.url), "utf8");
  const hook = await readFile(new URL("../app/hooks/use-minqin-map.ts", import.meta.url), "utf8");
  const config = await readFile(new URL("../app/lib/map-config.ts", import.meta.url), "utf8");
  const mapSource = `${experience}\n${hook}\n${config}`;
  const enhancement = hook.match(/async function addTerrainEnhancement[\s\S]*?\n {4}}\n\n {4}async function addSurfaceFocusEnhancement/)?.[0] ?? "";
  assert.ok(enhancement.length > 0, "terrain enhancement should remain an isolated loading stage");
  assert.match(hook, /setMapReady\(true\);[\s\S]*addSurfaceEnhancement\(map\)[\s\S]*addSurfaceFocusEnhancement\(map\)[\s\S]*addTerrainEnhancement\(map\)/);
  assert.match(enhancement, /type: "raster-dem"/);
  assert.match(enhancement, /encoding: "terrarium"/);
  assert.match(enhancement, /type: "hillshade"/);
  assert.match(enhancement, /terrainState = "unavailable"/);
  assert.doesNotMatch(enhancement, /setMapFallback/);
  assert.doesNotMatch(mapSource, /\.setTerrain\s*\(/);
  assert.equal((hook.match(/new MapLibreMap\(/g) ?? []).length, 1);
  assert.equal((experience.match(/<InteractiveMap\b/g) ?? []).length, 1);
  assert.match(config, /reliefShadow/);
  assert.match(config, /reliefHighlight/);
  assert.match(config, /reliefAccent/);
  for (const mode of ["free", "story", "tour"]) assert.match(config, new RegExp(`${mode}: \\[7\\.2,`));
  assert.match(config, /hillshadeInsertionBeforeId/);
  assert.match(config, /landcoverIndex >= 0 \? styleLayers\[landcoverIndex\]\?\.id/);
  assert.match(experience, /presentationMode: mapPresentationMode/);
  assert.match(config, /© OpenStreetMap contributors/);
  assert.match(config, /SRTM \/ GMTED2010 courtesy of USGS/);
  assert.doesNotMatch(mapSource, /https?:\/\/[^"'`]*(?:\{z\}|\.png|\.webp|\.jpg)/i, "runtime map source must not contain an online tile endpoint");
});

test("surface texture progressively enhances vector cartography without coupling failures", async () => {
  const hook = await readFile(new URL("../app/hooks/use-minqin-map.ts", import.meta.url), "utf8");
  const config = await readFile(new URL("../app/lib/map-config.ts", import.meta.url), "utf8");
  const mapCss = await readFile(new URL("../app/styles/map.css", import.meta.url), "utf8");
  const enhancement = hook.match(/async function addSurfaceEnhancement[\s\S]*?\n {4}}\n\n {4}async function addTerrainEnhancement/)?.[0] ?? "";
  assert.ok(enhancement.length > 0, "surface enhancement should remain an isolated loading stage");
  assert.match(enhancement, /new PMTiles\(surfaceUrl\)/, "surface should use HTTP Range rather than loading the full archive into memory");
  assert.match(enhancement, /type: "raster"/);
  assert.match(enhancement, /surfaceState = "unavailable"/);
  assert.doesNotMatch(enhancement, /setMapFallback|response\.blob|new File/);
  assert.match(config, /surfaceRasterPaint/);
  assert.match(config, /surfaceInsertionBeforeId/);
  assert.match(config, /Contains modified Copernicus Sentinel data 2026/);
  for (const mode of ["free", "story", "tour"]) assert.match(config, new RegExp(`${mode}: \\[7\\.2,`));
  assert.match(config, /layer\.id === "landcover"[\s\S]*fill-opacity/);
  assert.match(config, /water: \{ width:[\s\S]*opacity:/);
  assert.match(mapCss, /map-context-label[\s\S]*background: transparent/);
  assert.match(mapCss, /MINQIN COUNTY|map-context-label\.city small/);
  assert.doesNotMatch(`${hook}\n${config}`, /https?:\/\/[^"'`]*(?:\{z\}|\.png|\.webp|\.jpg)/i, "runtime surface source must remain local");
  assert.doesNotMatch(`${hook}\n${config}`, /\.setTerrain\s*\(/);
});

test("local map establishes zoom-aware cartographic and selected-marker hierarchy", async () => {
  const config = await readFile(new URL("../app/lib/map-config.ts", import.meta.url), "utf8");
  const hook = await readFile(new URL("../app/hooks/use-minqin-map.ts", import.meta.url), "utf8");
  assert.match(config, /cartographicPalette/);
  assert.match(config, /cartographicTuning/);
  assert.match(config, /layer\.id === "landcover"/);
  assert.match(config, /"fill-opacity": zoomExpression/);
  for (const roadClass of ["highway", "major", "minor", "service"]) assert.match(config, new RegExp(`${roadClass}: \\{ minZoom:`));
  assert.match(config, /layer\.id === "buildings"/);
  assert.match(config, /"line-opacity": zoomExpression\(opacityStops\)/);
  for (const route of ["practiceHalo", "practice", "field", "water"]) assert.match(hook, new RegExp(`cartographicTuning\\.routes\\.${route}\\.(?:width|opacity)`));
  assert.match(hook, /map\.on\("zoom", updateContextLabelDensity\)/);
  assert.match(hook, /mapSelectedPointId === pointId/);
  assert.match(hook, /pointMarkers\.current/);
  assert.match(hook, /is-selected/);
  assert.match(hook, /aria-current/);
});

test("map selection, tour seek and drawer replacement share one stable point identity", async () => {
  const experience = await readFile(new URL("../app/components/experience/experience.tsx", import.meta.url), "utf8");
  const hook = await readFile(new URL("../app/hooks/use-minqin-map.ts", import.meta.url), "utf8");
  const map = await readFile(new URL("../app/components/map/interactive-map.tsx", import.meta.url), "utf8");
  const mapCss = await readFile(new URL("../app/styles/map.css", import.meta.url), "utf8");
  assert.match(experience, /const mapSelectedPointId = !tourMode/);
  for (const selection of ["activeTourPoint", "timelinePoint", "waterStage.pointId", "selectedResourcePoint"]) assert.match(experience, new RegExp(selection.replace(".", "\\.")));
  const seek = experience.match(/function seekTourToPoint[\s\S]*?\n {2}}/)?.[0] ?? "";
  assert.match(seek, /chapterFramesById\.get/);
  assert.match(seek, /frame\.kind === "point"/);
  assert.match(seek, /durationSeconds/);
  assert.match(seek, /chapterElapsedRef\.current = elapsedSeconds/);
  assert.match(seek, /setTourPlayback\("paused"\)/);
  assert.match(experience, /seekTourToPoint\(pointId\)/);
  assert.match(experience, /drawerScroll\.current\.scrollTop = 0/);
  assert.match(experience, /isFirstOpen/);
  assert.match(map, /drawerScrollRef/);
  assert.doesNotMatch(hook, /\[activeLayer, activePoints, mapReady, mapSelectedPointId\][\s\S]*new Marker/);
  assert.match(hook, /Map<string, PointMarkerEntry>/);
  assert.match(hook, /label\.className = "map-story-marker-label"/);
  assert.match(hook, /label\.textContent = point\.title/);
  assert.match(mapCss, /\.map-story-marker-label[^}]*pointer-events: none/);
  assert.match(mapCss, /\.story-drawer\.open[^}]*pointer-events: auto/);
  assert.match(mapCss, /\.drawer-scroll[^}]*touch-action: pan-y[^}]*pointer-events: auto/);
  assert.doesNotMatch(mapCss, /\.story-drawer\.open \.drawer-scroll[^}]*pointer-events: none/);
});

test("GPS focus raster is local, traceable and independently degradable", async () => {
  const archiveUrl = new URL("../public/maps/minqin-surface-focus-2026.pmtiles", import.meta.url);
  const provenanceUrl = new URL("../public/maps/minqin-surface-focus-2026.json", import.meta.url);
  const [archive, provenanceText, hook, config, experience] = await Promise.all([
    readFile(archiveUrl),
    readFile(provenanceUrl, "utf8"),
    readFile(new URL("../app/hooks/use-minqin-map.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/map-config.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/experience/experience.tsx", import.meta.url), "utf8"),
  ]);
  const provenance = JSON.parse(provenanceText);
  assert.equal(archive.subarray(0, 7).toString("utf8"), "PMTiles");
  assert.deepEqual([archive[99], archive[100], archive[101]], [2, 12, 14]);
  assert.equal(provenance.scope, "focus");
  assert.equal(provenance.workingResolution, "10 metres per pixel");
  assert.match(provenance.focusBoundsDerivedFrom, /GPS实拍点/);
  assert.equal(provenance.focusBufferKilometres, 2.5);
  assert.equal(provenance.alphaTransparency, true);
  assert.ok(provenance.edgeFeatherMetres > 0);
  assert.match(provenance.archiveEncoding, /PNG alpha/);
  assert.match(provenance.colorGradeBaseline, /base surface pipeline/);
  const enhancement = hook.match(/async function addSurfaceFocusEnhancement[\s\S]*?\n {4}}/)?.[0] ?? "";
  assert.match(enhancement, /get\("focus"\) === "missing"/);
  assert.match(enhancement, /new PMTiles\(focusUrl\)/);
  assert.match(enhancement, /TileType\.Png/);
  assert.match(enhancement, /focusState = "unavailable"/);
  assert.doesNotMatch(enhancement, /setMapFallback|response\.blob|new File/);
  assert.match(config, /surfaceFocus:[\s\S]*sourceMinZoom: 12[\s\S]*nativeMaxZoom: 14/);
  assert.match(experience, /gpsZoom: 13\.85/);
  assert.match(experience, /point\.accuracy === "GPS实拍点" \? pointCameraTuning\.gpsZoom : pointCameraTuning\.contextZoom/);
});

test("render context is wider than interaction bounds and shared by surface and terrain preparation", async () => {
  const config = await readFile(new URL("../app/lib/map-config.ts", import.meta.url), "utf8");
  const surfaceScript = await readFile(new URL("../scripts/prepare-map-surface.py", import.meta.url), "utf8");
  const terrainScript = await readFile(new URL("../scripts/prepare-map-terrain.py", import.meta.url), "utf8");
  assert.match(config, /INTERACTION_BOUNDS/);
  assert.match(config, /RENDER_CONTEXT_BOUNDS/);
  assert.match(config, /102\.12890625/);
  assert.match(surfaceScript, /RENDER_CONTEXT_BOUNDS = \[102\.12890625/);
  assert.match(terrainScript, /RENDER_CONTEXT_BOUNDS = \[102\.12890625/);
  assert.match(surfaceScript, /refusing solid-color fill/);
  assert.doesNotMatch(surfaceScript, /rgb\[~valid\] =/);
});

test("guided tour derives its timeline from unique frame media durations", async () => {
  const experience = await readFile(new URL("../app/components/experience/experience.tsx", import.meta.url), "utf8");
  const exhibit = (await Promise.all(["digital-exhibit.tsx", "exhibit-chrome.tsx", "tour-stage.tsx"].map((name) => readFile(new URL(`../app/components/exhibit/${name}`, import.meta.url), "utf8")))).join("\n");
  const evidence = await readFile(new URL("../content/evidence-index.ts", import.meta.url), "utf8");
  assert.match(evidence, /TEXT_FRAME_SECONDS = 4/);
  assert.match(evidence, /SOURCE_FRAME_SECONDS = 5\.5/);
  assert.match(evidence, /IMAGE_FRAME_SECONDS = 9/);
  assert.match(evidence, /asset\.durationSeconds/);
  assert.match(evidence, /usedTourMediaIds/);
  const frameCounts = { image: 9, text: 7, source: 20 };
  const videoSeconds = 81.283;
  const totalSeconds = frameCounts.image * 9 + frameCounts.text * 4 + frameCounts.source * 5.5 + videoSeconds;
  assert.ok(totalSeconds >= 295 && totalSeconds <= 310, `tour should remain within the five-minute target, received ${totalSeconds}`);
  assert.match(experience, /"idle" \| "playing" \| "paused" \| "completed"/);
  assert.match(experience, /frame\.durationSeconds/);
  assert.match(experience, /}, 250\)/);
  assert.match(experience, /setTourPlayback\("completed"\)/);
  for (const label of ["自动播放", "暂停", "继续", "五章导览已完成"]) assert.match(exhibit, new RegExp(label));
});

test("derives bidirectional chapter and source evidence indexes", async () => {
  const evidence = await readFile(new URL("../content/evidence-index.ts", import.meta.url), "utf8");
  const index = await readFile(new URL("../content/index.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/components/sections/long-form-page.tsx", import.meta.url), "utf8");
  assert.match(evidence, /chapterEvidenceById/);
  assert.match(evidence, /sourceUsageById/);
  for (const collection of ["tourChapters", "storyPoints", "waterStages", "herbs"]) assert.match(evidence, new RegExp(`for \\(const .* of ${collection}\\)|${collection}\\.(?:map|filter)`));
  assert.match(index, /evidence-index/);
  assert.match(page, /资料来源与反向索引/);
  assert.match(page, /支撑：/);
});

test("homepage starts continuous playback and exposes a complete keyboard and exit loop", async () => {
  const experience = await readFile(new URL("../app/components/experience/experience.tsx", import.meta.url), "utf8");
  const exhibit = (await Promise.all(["digital-exhibit.tsx", "exhibit-chrome.tsx"].map((name) => readFile(new URL(`../app/components/exhibit/${name}`, import.meta.url), "utf8")))).join("\n");
  const page = await readFile(new URL("../app/components/sections/long-form-page.tsx", import.meta.url), "utf8");
  assert.match(page, /onStartExhibit\(0, true\)/);
  assert.match(page, /开始自动导览/);
  assert.match(experience, /event\.code === "Space"/);
  assert.match(experience, /window\.setInterval/);
  assert.match(experience, /totalTourSeconds/);
  assert.match(exhibit, /tour-total-progress/);
  for (const action of ["自由探索地图", "查看资料依据"]) assert.match(exhibit, new RegExp(action));
});

test("continuous tour rotates map points, media, video and source text as derived frames", async () => {
  const evidence = await readFile(new URL("../content/evidence-index.ts", import.meta.url), "utf8");
  const experience = await readFile(new URL("../app/components/experience/experience.tsx", import.meta.url), "utf8");
  const exhibit = (await Promise.all(["digital-exhibit.tsx", "tour-stage.tsx"].map((name) => readFile(new URL(`../app/components/exhibit/${name}`, import.meta.url), "utf8")))).join("\n");
  assert.match(evidence, /chapterFramesById/);
  for (const kind of ["intro", "point", "media", "source"]) assert.match(evidence, new RegExp(`kind: "${kind}"`));
  assert.match(evidence, /asset\.type !== "video"/);
  assert.match(experience, /activeTourFrameIndex/);
  assert.match(evidence, /claimTourMedia/);
  assert.match(experience, /cameraForTourFrame/);
  assert.match(experience, /lastTourCameraKeyRef/);
  assert.match(experience, /frame\?\.kind === "intro"/);
  assert.match(experience, /chapter:\$\{chapter\.id\}/);
  assert.match(experience, /point:\$\{point\.id\}/);
  const scenes = await readFile(new URL("../content/exhibit-scenes.ts", import.meta.url), "utf8");
  assert.match(scenes, /id: "field-days"[\s\S]*?zoom: 11\.45/);
  assert.match(exhibit, /autoPlay=\{isPlaying\}/);
  assert.match(exhibit, /muted playsInline preload/);
  assert.doesNotMatch(exhibit, /playsInline loop/);
  assert.doesNotMatch(exhibit, /见视频下方文字|自动分镜 · AUTO STORYBOARD/);
});

test("the single map resizes with its container across story, free, and tour layouts", async () => {
  const mapHook = await readFile(new URL("../app/hooks/use-minqin-map.ts", import.meta.url), "utf8");
  assert.match(mapHook, /new ResizeObserver\(resizeMap\)/);
  assert.match(mapHook, /resizeObserver\.observe\(container\)/);
  assert.match(mapHook, /requestAnimationFrame\(\(\) => map\.resize\(\)\)/);
  assert.match(mapHook, /resizeObserver\.disconnect\(\)/);
});

test("museum-documentary UI derives exhibit labels and keeps one persistent control layer", async () => {
  const types = await readFile(new URL("../content/types.ts", import.meta.url), "utf8");
  const stage = await readFile(new URL("../app/components/exhibit/tour-stage.tsx", import.meta.url), "utf8");
  const chrome = await readFile(new URL("../app/components/exhibit/exhibit-chrome.tsx", import.meta.url), "utf8");
  const exhibit = await readFile(new URL("../app/components/exhibit/digital-exhibit.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/styles/exhibit.css", import.meta.url), "utf8");
  assert.match(types, /"media" \| "source" \| "data" \| "specimen"/);
  assert.match(stage, /deriveExhibitVisualType/);
  assert.match(stage, /data-visual-type/);
  for (const label of ["资料展签", "查看原文", "探索工具", "剩余", "上一页", "下一页"]) assert.match(`${stage}\n${chrome}`, new RegExp(label));
  assert.match(exhibit, /TourPlaybackBar/);
  assert.doesNotMatch(exhibit, /tour-controls exhibit-controls/);
  assert.match(css, /grid-template-columns: auto auto minmax\(120px, 1fr\) auto/);
});

test("confirmed field labels use white thorn fruit and Hami melon consistently", async () => {
  const published = await Promise.all(["story-points.ts", "media.ts", "field-timeline.ts", "exhibit-scenes.ts"].map((name) => readFile(new URL(`../content/${name}`, import.meta.url), "utf8")));
  const text = published.join("\n");
  assert.match(text, /白刺果采摘观察/);
  assert.match(text, /哈密瓜/);
  assert.doesNotMatch(text, /待专业核验|待核验|当地西瓜|人物与西瓜/);
});

test("maintenance documentation covers the content workflows", async () => {
  const structure = await readFile(new URL("../docs/PROJECT_STRUCTURE.md", import.meta.url), "utf8");
  const guide = await readFile(new URL("../docs/CONTENT_UPDATE_GUIDE.md", import.meta.url), "utf8");
  for (const label of ["content/", "public/media/", "PMTiles", "样式边界"]) assert.match(structure, new RegExp(label));
  for (const label of ["添加照片或视频", "添加地图点位", "添加公开来源", "添加水脉阶段", "添加药材档案", "发布前检查"]) assert.match(guide, new RegExp(label));
});
