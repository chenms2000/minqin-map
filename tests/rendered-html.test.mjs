import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html", host: "localhost" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the first formal release", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  for (const label of ["民勤中医药生态文化数字地图", "首期正式成果", "项目档案", "进入数字展框", "自由浏览", "实践足迹", "绿洲水脉", "药材产业", "人物故事", "实践影像", "资料与方法说明"]) assert.match(html, new RegExp(label));
  assert.match(html, /og:image/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships curated media, local map and social card", async () => {
  const content = await readFile(new URL("../app/content.ts", import.meta.url), "utf8");
  const experience = await readFile(new URL("../app/experience.tsx", import.meta.url), "utf8");
  assert.match(experience, /localArchivePath = "\/maps\/minqin-2026\.pmtiles"/);
  assert.match(experience, /本地离线底图/);
  assert.match(experience, /武威市 \/ 凉州/);
  assert.match(experience, /叙事路径，非导航路线/);
  assert.doesNotMatch(experience, /oasisShape|oasis-fill|oasis-outline/);
  assert.doesNotMatch(experience, /tiles\.openfreemap\.org/);
  assert.match(experience, /params\.get\("view"\) === "exhibit"/);
  assert.match(experience, /get\("map"\) === "fallback"/);
  for (const label of ["五章导览", "实践轨迹", "水脉时间机", "药材标本柜"]) assert.match(experience, new RegExp(label));

  const mediaPaths = [...content.matchAll(/(?:src|poster): "(\/media\/[^"?]+)"/g)].map((match) => match[1]);
  assert.ok(new Set(mediaPaths).size >= 20, `expected at least 20 media assets, found ${new Set(mediaPaths).size}`);
  await Promise.all([...new Set(mediaPaths)].map((item) => access(new URL(`public${item}`, root))));
  const socialCard = await stat(new URL("../public/og.png", import.meta.url));
  assert.ok(socialCard.size > 100_000 && socialCard.size < 3_000_000, "social card should be optimized for sharing");
});

test("content ids and references are internally consistent", async () => {
  const content = await readFile(new URL("../app/content.ts", import.meta.url), "utf8");
  const section = (start, end) => content.slice(content.indexOf(start), content.indexOf(end));
  const idsIn = (text) => new Set([...text.matchAll(/\bid: "([^"]+)"/g)].map((match) => match[1]));
  const sourceIds = idsIn(section("export const sources", "export const media"));
  const mediaIds = idsIn(section("export const media", "export const storyPoints"));
  const pointIds = idsIn(section("export const storyPoints", "export const herbs"));
  const allDefinitions = [...content.matchAll(/\bid: "([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(allDefinitions).size, allDefinitions.length, "all structured content ids must be unique");

  for (const [, values] of content.matchAll(/sourceIds: \[([^\]]*)\]/g)) for (const [, id] of values.matchAll(/"([^"]+)"/g)) assert.ok(sourceIds.has(id), `unknown source id: ${id}`);
  for (const [, values] of content.matchAll(/mediaIds: \[([^\]]*)\]/g)) for (const [, id] of values.matchAll(/"([^"]+)"/g)) assert.ok(mediaIds.has(id), `unknown media id: ${id}`);
  for (const [, values] of content.matchAll(/pointIds: \[([^\]]*)\]/g)) for (const [, id] of values.matchAll(/"([^"]+)"/g)) assert.ok(pointIds.has(id), `unknown story point id: ${id}`);
  for (const [, id] of content.matchAll(/leadMediaId: "([^"]+)"/g)) assert.ok(mediaIds.has(id), `unknown lead media id: ${id}`);
  for (const [, id] of content.matchAll(/(?:storyPointId|mapPointId|pointId|fromPointId|toPointId): "([^"]+)"/g)) assert.ok(pointIds.has(id), `unknown linked story point id: ${id}`);
  for (const [, id] of content.matchAll(/mediaId: "([^"]+)"/g)) assert.ok(mediaIds.has(id), `unknown timeline media id: ${id}`);
  assert.equal([...section("export const timelineEvents", "export const waterStages").matchAll(/id: "event-/g)].length, 20, "all 20 media items belong to the two-day player");
  assert.equal([...section("export const waterStages", "export const relationshipEdges").matchAll(/id: "water-/g)].length, 4, "water time machine has four stages");
  assert.equal([...section("export const relationshipEdges", "export const exhibitScenes").matchAll(/id: "relation-/g)].length, 4, "relationship presentation has four evidence-led edges");
  assert.equal([...section("export const herbs", "export const waterTimeline").matchAll(/mapPointId: /g)].length, 4, "four resource profiles link back to the map");
  assert.equal([...content.matchAll(/featured: true/g)].length, 10, "tour media count is data-driven and intentionally curated");
});

test("map archive is a lightweight valid PMTiles package", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.match(packageJson.dependencies["maplibre-gl"], /^\^?5\./);
  const archiveUrl = new URL("../public/maps/minqin-2026.pmtiles", import.meta.url);
  const archiveStat = await stat(archiveUrl);
  assert.ok(archiveStat.size > 500_000);
  assert.ok(archiveStat.size < 10_000_000);
  const archive = await readFile(archiveUrl);
  assert.equal(archive.subarray(0, 7).toString("utf8"), "PMTiles");
});

test("coordinates stay in scope and privacy/content boundaries hold", async () => {
  const content = await readFile(new URL("../app/content.ts", import.meta.url), "utf8");
  const experience = await readFile(new URL("../app/experience.tsx", import.meta.url), "utf8");
  const output = `${content}\n${experience}`;
  const coordinates = [...content.matchAll(/coordinates: \[([\d.]+), ([\d.]+)\]/g)].map((match) => [Number(match[1]), Number(match[2])]);
  assert.ok(coordinates.length >= 10);
  for (const [longitude, latitude] of coordinates) {
    assert.ok(longitude >= 102 && longitude <= 105, `longitude out of scope: ${longitude}`);
    assert.ok(latitude >= 37 && latitude <= 40, `latitude out of scope: ${latitude}`);
  }
  assert.doesNotMatch(output, /\b1[3-9]\d{9}\b/);
  assert.doesNotMatch(output, /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
  assert.doesNotMatch(output, /用户提供地图位点|精确活动坐标|现场采访称/);
  assert.match(output, /收成镇兴隆村/);
  assert.match(output, /村级近似定位/);
  assert.match(output, /不提供企业规模和医疗功效信息|不宣传医疗功效/);
  assert.match(output, /非采访引语/);
});
