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

const contentFiles = ["types.ts", "sources.ts", "media.ts", "story-points.ts", "field-timeline.ts", "field-tracks.ts", "water-stages.ts", "resources.ts", "exhibit-scenes.ts", "index.ts"];
const componentFiles = [
  "components/experience/experience.tsx",
  "components/map/interactive-map.tsx",
  "components/exhibit/digital-exhibit.tsx",
  "components/sections/long-form-page.tsx",
  "hooks/use-minqin-map.ts",
  "lib/map-config.ts",
];

test("server-renders the first formal release", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  for (const label of ["民勤中医药生态文化数字地图", "首期正式成果", "项目档案", "进入数字展框", "自由浏览", "实践足迹", "绿洲水脉", "药材产业", "人物故事", "实践影像", "资料与方法说明"]) assert.match(html, new RegExp(label));
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
  for (const action of ["进入数字展框", "自由浏览"]) assert.match(html, new RegExp(action));
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
  assert.equal([...scenes.matchAll(/id: /g)].length, 5);
  assert.equal([...media.matchAll(/featured: true/g)].length, 18);
  assert.equal([...media.matchAll(/\{ id: /g)].length, 43);
});

test("base activity point presents three evidence threads without inventing coordinates", async () => {
  const points = await readFile(new URL("../content/story-points.ts", import.meta.url), "utf8");
  const map = await readFile(new URL("../app/components/map/interactive-map.tsx", import.meta.url), "utf8");
  for (const id of ["heat-prevention-education", "live-aid-attempt", "volunteer-base-evidence"]) assert.match(points, new RegExp(`id: "${id}"`));
  for (const title of ["中暑预防科普", "直播助农尝试", "志愿基地与治沙技术证据"]) assert.match(points, new RegExp(title));
  assert.equal((points.match(/coordinates: \[103\.500018, 38\.73236\]/g) ?? []).length, 1, "the three evidence threads must share the verified base point");
  assert.match(points, /不构成医学诊断、治疗或用药建议/);
  assert.match(points, /不展示账号、评论、订单、销量或平台数据/);
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

test("local map style establishes land and road hierarchy", async () => {
  const config = await readFile(new URL("../app/lib/map-config.ts", import.meta.url), "utf8");
  const hook = await readFile(new URL("../app/hooks/use-minqin-map.ts", import.meta.url), "utf8");
  assert.match(config, /layer\.id === "landcover"/);
  assert.match(config, /other\|service\|taxiway\|pier/);
  assert.match(config, /minor\|link/);
  assert.match(config, /"line-opacity": opacity/);
  assert.match(hook, /practice-route-halo/);
  assert.match(hook, /"line-width": 2\.2/);
});

test("maintenance documentation covers the content workflows", async () => {
  const structure = await readFile(new URL("../docs/PROJECT_STRUCTURE.md", import.meta.url), "utf8");
  const guide = await readFile(new URL("../docs/CONTENT_UPDATE_GUIDE.md", import.meta.url), "utf8");
  for (const label of ["content/", "public/media/", "PMTiles", "样式边界"]) assert.match(structure, new RegExp(label));
  for (const label of ["添加照片或视频", "添加地图点位", "添加公开来源", "添加水脉阶段", "添加药材档案", "发布前检查"]) assert.match(guide, new RegExp(label));
});
