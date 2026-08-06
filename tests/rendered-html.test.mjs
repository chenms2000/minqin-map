import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished Minqin atlas", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /民勤中医药生态文化数字地图/);
  assert.match(html, /在沙与水之间/);
  assert.match(html, /实践足迹/);
  assert.match(html, /绿洲水脉/);
  assert.match(html, /药材产业/);
  assert.match(html, /人物故事/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships all curated media and no private contact details", async () => {
  const content = await readFile(new URL("../app/content.ts", import.meta.url), "utf8");
  const experience = await readFile(new URL("../app/experience.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(`${content}\n${experience}`, /\b1[3-9]\d{9}\b/);
  assert.doesNotMatch(`${content}\n${experience}`, /@(?:163|qq|bucm)\.com/i);
  assert.match(content, /村级近似定位/);
  assert.match(content, /不提供医疗建议|不提供用药建议/);

  const paths = [...content.matchAll(/src: "(\/media\/[^"?]+)"/g)].map((match) => match[1]);
  assert.ok(paths.length >= 20, `expected at least 20 media references, found ${paths.length}`);
  await Promise.all([...new Set(paths)].map((item) => access(new URL(`public${item}`, root))));
});

test("map content has unique ids and valid coordinate ranges", async () => {
  const content = await readFile(new URL("../app/content.ts", import.meta.url), "utf8");
  const ids = [...content.matchAll(/^\s+id: "([^"]+)",$/gm)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, "content ids must be unique");
  const coordinates = [...content.matchAll(/coordinates: \[([\d.]+), ([\d.]+)\]/g)].map((match) => [Number(match[1]), Number(match[2])]);
  assert.ok(coordinates.length >= 7);
  for (const [longitude, latitude] of coordinates) {
    assert.ok(longitude >= 102 && longitude <= 105, `longitude out of Minqin/Hexi scope: ${longitude}`);
    assert.ok(latitude >= 37 && latitude <= 40, `latitude out of Minqin/Hexi scope: ${latitude}`);
  }
});
