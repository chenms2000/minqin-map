import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(".");
const contentRoot = path.join(root, "content");
const dataFiles = [
  "sources.ts",
  "media.ts",
  "story-points.ts",
  "resources.ts",
  "field-timeline.ts",
  "field-tracks.ts",
  "water-stages.ts",
  "exhibit-scenes.ts",
];

const entries = await Promise.all(dataFiles.map(async (name) => [name, await readFile(path.join(contentRoot, name), "utf8")]));
const contentByFile = new Map(entries);
const allContent = entries.map(([, text]) => text).join("\n");
const idsIn = (text) => [...text.matchAll(/\bid:\s*"([^"]+)"/g)].map((match) => match[1]);
const idSet = (name) => new Set(idsIn(contentByFile.get(name) ?? ""));
const sourceIds = idSet("sources.ts");
const mediaIds = idSet("media.ts");
const pointIds = idSet("story-points.ts");
const allDefinitions = entries.flatMap(([name, text]) => idsIn(text).map((id) => ({ id, name })));

if (sourceIds.size < 16) throw new Error(`公开来源至少需要 16 项，当前为 ${sourceIds.size} 项`);
for (const line of (contentByFile.get("sources.ts") ?? "").split("\n").filter((item) => item.includes('{ id: "'))) {
  for (const field of ["kind", "topics", "summary"]) if (!line.includes(`${field}:`)) throw new Error(`来源元数据缺失 ${field}：${line.match(/id: "([^"]+)"/)?.[1] ?? "unknown"}`);
  const summary = line.match(/summary:\s*"([^"]+)"/)?.[1] ?? "";
  if (summary.length < 45) throw new Error(`来源摘要过短：${line.match(/id: "([^"]+)"/)?.[1] ?? "unknown"}`);
  if (summary.startsWith("支撑")) throw new Error(`来源摘要不应使用内部审核语气：${line.match(/id: "([^"]+)"/)?.[1] ?? "unknown"}`);
}

const duplicates = allDefinitions.filter((item, index) => allDefinitions.findIndex((candidate) => candidate.id === item.id) !== index);
if (duplicates.length) throw new Error(`重复内容 ID：${[...new Set(duplicates.map((item) => item.id))].join("、")}`);

function assertReferences(pattern, knownIds, label) {
  for (const match of allContent.matchAll(pattern)) {
    const id = match[1];
    if (!knownIds.has(id)) throw new Error(`${label}引用不存在：${id}`);
  }
}

const referencedSourceIds = new Set();
for (const match of allContent.matchAll(/sourceIds:\s*\[([^\]]*)\]/g)) {
  for (const idMatch of match[1].matchAll(/"([^"]+)"/g)) {
    if (!sourceIds.has(idMatch[1])) throw new Error(`来源引用不存在：${idMatch[1]}`);
    referencedSourceIds.add(idMatch[1]);
  }
}
for (const sourceId of sourceIds) if (!referencedSourceIds.has(sourceId)) throw new Error(`来源缺少实际使用关系：${sourceId}`);
for (const match of allContent.matchAll(/mediaIds:\s*\[([^\]]*)\]/g)) {
  for (const idMatch of match[1].matchAll(/"([^"]+)"/g)) {
    if (!mediaIds.has(idMatch[1])) throw new Error(`媒体引用不存在：${idMatch[1]}`);
  }
}
for (const match of allContent.matchAll(/pointIds:\s*\[([^\]]*)\]/g)) {
  for (const idMatch of match[1].matchAll(/"([^"]+)"/g)) {
    if (!pointIds.has(idMatch[1])) throw new Error(`点位引用不存在：${idMatch[1]}`);
  }
}
assertReferences(/leadMediaId:\s*"([^"]+)"/g, mediaIds, "主媒体");
assertReferences(/sourceId:\s*"([^"]+)"/g, sourceIds, "来源");
assertReferences(/mediaId:\s*"([^"]+)"/g, mediaIds, "时间线媒体");
assertReferences(/(?:storyPointId|mapPointId|pointId|fromPointId|toPointId):\s*"([^"]+)"/g, pointIds, "点位");

const mediaPaths = [...allContent.matchAll(/(?:src|poster):\s*"(\/media\/[^"]+)"/g)].map((match) => match[1]);
if (new Set(mediaPaths).size < 20) throw new Error(`媒体文件不足：仅发现 ${new Set(mediaPaths).size} 个路径`);
for (const mediaPath of new Set(mediaPaths)) {
  const target = path.resolve(root, "public", mediaPath.slice(1));
  if (!target.startsWith(path.join(root, "public") + path.sep)) throw new Error(`媒体路径越界：${mediaPath}`);
  await access(target);
}

const coordinates = [...allContent.matchAll(/coordinates:\s*\[([\d.]+),\s*([\d.]+)\]/g)].map((match) => [Number(match[1]), Number(match[2])]);
if (coordinates.length < 10) throw new Error(`点位坐标不足：仅发现 ${coordinates.length} 组`);
for (const [longitude, latitude] of coordinates) {
  if (longitude < 102 || longitude > 105 || latitude < 37 || latitude > 40) throw new Error(`坐标超出民勤项目范围：[${longitude}, ${latitude}]`);
}

const expectedCounts = [
  ["field-timeline.ts", /\bid:\s*"event-/g, 43, "实践时间线"],
  ["field-tracks.ts", /\bid:\s*"track-/g, 2, "GPS采样线"],
  ["water-stages.ts", /\bid:\s*"water-/g, 4, "水脉阶段"],
  ["resources.ts", /\bid:\s*"relation-/g, 4, "关系边"],
];
for (const [file, pattern, expected, label] of expectedCounts) {
  const actual = [...(contentByFile.get(file) ?? "").matchAll(pattern)].length;
  if (actual !== expected) throw new Error(`${label}应为 ${expected} 项，当前为 ${actual} 项`);
}
const featuredCount = [...(contentByFile.get("media.ts") ?? "").matchAll(/featured:\s*true/g)].length;
if (mediaIds.size !== 43) throw new Error(`媒体条目应为 43 项，当前为 ${mediaIds.size} 项`);
if (featuredCount !== 18) throw new Error(`导览精选媒体应为 18 项，当前为 ${featuredCount} 项`);
for (const line of (contentByFile.get("media.ts") ?? "").split("\n").filter((item) => item.includes('type: "video"'))) {
  if (!/durationSeconds:\s*[\d.]+/.test(line)) throw new Error(`视频缺少真实时长：${line.match(/id: "([^"]+)"/)?.[1] ?? "unknown"}`);
}

const trackContent = contentByFile.get("field-tracks.ts") ?? "";
for (const block of trackContent.split(/\n\s*},\n/).filter((item) => item.includes('id: "track-'))) {
  const samples = [...block.matchAll(/\[(103\.[\d]+),\s*(38\.[\d]+)\]/g)].map((match) => [Number(match[1]), Number(match[2])]);
  if (samples.length < 2) throw new Error("GPS采样线至少需要两个坐标样本");
  for (const [longitude, latitude] of samples) {
    if (longitude < 102 || longitude > 105 || latitude < 37 || latitude > 40) throw new Error(`GPS采样线坐标越界：[${longitude}, ${latitude}]`);
  }
  if (!block.includes("非完整轨迹、非导航路线")) throw new Error("GPS采样线缺少非导航声明");
}

async function sourceFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await sourceFiles(fullPath));
    else if (/\.(?:ts|tsx)$/.test(entry.name)) found.push(fullPath);
  }
  return found;
}

const scanFiles = [...await sourceFiles(contentRoot), ...await sourceFiles(path.join(root, "app"))];
const publishedText = (await Promise.all(scanFiles.map((file) => readFile(file, "utf8")))).join("\n");
const forbidden = [
  [/\b1[3-9]\d{9}\b/, "手机号"],
  [/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/, "邮箱"],
  [/用户提供地图位点|精确活动坐标|现场采访称/, "未经核验的定位或采访表述"],
];
for (const [pattern, label] of forbidden) if (pattern.test(publishedText)) throw new Error(`隐私与内容边界检查失败：发现${label}`);
for (const required of ["收成镇兴隆村", "村级近似定位", "GPS实拍点", "非完整轨迹、非导航路线"]) {
  if (!publishedText.includes(required)) throw new Error(`内容边界说明缺失：${required}`);
}
const storyPointContent = contentByFile.get("story-points.ts") ?? "";
if (!/boundary:\s*"[^"]*(?:医学|诊断|治疗|用药)[^"]*"/.test(storyPointContent)) throw new Error("内容边界说明缺失：医学活动边界");
if (!/boundary:\s*"[^"]*(?:隐私|账号|订单|销量)[^"]*"/.test(storyPointContent)) throw new Error("内容边界说明缺失：平台隐私边界");
if (/白刺果[^"\n]*(?:待专业核验|待核验)|名称待专业核验/.test(publishedText)) throw new Error("白刺果已确认，不应继续显示待核验表述");
if (!publishedText.includes('title: "白刺果采摘观察"')) throw new Error("白刺果确认名称缺失");
if (!publishedText.includes("哈密瓜")) throw new Error("直播农产品应标记为哈密瓜");
const resourceContent = contentByFile.get("resources.ts") ?? "";
for (const placeholder of ["项目计划关注", "待调研问题", "等待后续公开资料", "尚无团队基地调研数据"]) {
  if (resourceContent.includes(placeholder)) throw new Error(`药材标本仍含占位表述：${placeholder}`);
}
for (const required of ["minqin-herb-harvest-2020", "cynomorium-cas", "cynomorium-genetics-2018", "/media/resources/licorice.jpg", "/media/resources/cistanche.jpg", "/media/resources/cynomorium.jpg", "/media/resources/isatis.jpg"]) {
  if (!allContent.includes(required)) throw new Error(`药材实证内容缺失：${required}`);
}

const archive = path.join(root, "public", "maps", "minqin-2026.pmtiles");
const archiveStat = await stat(archive);
if (archiveStat.size >= 10_000_000) throw new Error(`PMTiles 超过 10MB：${archiveStat.size} bytes`);

console.log(`内容校验通过：${sourceIds.size} 个来源、${mediaIds.size} 个媒体条目、${pointIds.size} 个点位、${coordinates.length} 组坐标。`);
