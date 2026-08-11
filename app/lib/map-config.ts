import { layers, namedFlavor } from "@protomaps/basemaps";
import type { FeatureCollection, LineString } from "geojson";
import type { StoryLayer } from "@/content";

export const layerMeta: Record<StoryLayer, { label: string; en: string }> = {
  practice: { label: "实践足迹", en: "Field notes" },
  water: { label: "绿洲水脉", en: "Oasis water" },
  herbs: { label: "药材产业", en: "Herbal resources" },
  people: { label: "人物故事", en: "People" },
};

export const mapBounds: [[number, number], [number, number]] = [[102.45, 37.8], [103.75, 39.35]];
export const defaultView = { center: [103.16, 38.72] as [number, number], zoom: 9.15, pitch: 38, bearing: -12 };
export const localArchivePath = "/maps/minqin-2026.pmtiles";
export const localArchiveName = "minqin-2026.pmtiles";

export const contextLabels = [
  { name: "武威市 / 凉州", coordinates: [102.63488, 37.92782] as [number, number], kind: "city" },
  { name: "民勤县", coordinates: [103.09493, 38.6268] as [number, number], kind: "city" },
  { name: "薛百镇", coordinates: [103.01974, 38.54682] as [number, number], kind: "town" },
  { name: "大滩镇", coordinates: [103.24651, 38.76667] as [number, number], kind: "town" },
  { name: "泉山镇", coordinates: [103.3065, 38.86036] as [number, number], kind: "town" },
  { name: "收成镇", coordinates: [103.60322, 38.90018] as [number, number], kind: "town" },
  { name: "西渠镇", coordinates: [103.54082, 38.97829] as [number, number], kind: "town" },
  { name: "东湖镇", coordinates: [103.67343, 38.9498] as [number, number], kind: "town" },
  { name: "红崖山水库", coordinates: [103.04, 38.42] as [number, number], kind: "water" },
  { name: "青土湖", coordinates: [103.56, 39.12] as [number, number], kind: "water" },
];

export const practiceRoute: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: [{ type: "Feature", properties: { note: "叙事路径，非导航路线" }, geometry: { type: "LineString", coordinates: [[102.6378, 37.9283], [102.92, 38.24], [103.0938, 38.6247], [103.500018, 38.73236]] } }],
};

export const waterRoute: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: [{ type: "Feature", properties: { note: "水脉关系示意" }, geometry: { type: "LineString", coordinates: [[103.04, 38.42], [103.0938, 38.6247], [103.29, 38.82], [103.56, 39.12]] } }],
};

export function localMapStyle(tileUrl: string) {
  const light = namedFlavor("light");
  const atlasFlavor = {
    ...light,
    background: "#bfa36b", earth: "#e1d2aa", sand: "#d5bb80", water: "#4f9eae",
    park_a: "#a5b77d", park_b: "#8ea66a", wood_a: "#9ead79", wood_b: "#78915f",
    scrub_a: "#b7bb83", scrub_b: "#9ca26c", boundaries: "#876d47", buildings: "#b69d75",
    highway_casing_early: "#8c6747", highway_casing_late: "#8c6747", major_casing_early: "#9b7855",
    major_casing_late: "#9b7855", minor_casing: "#aa8c67", highway: "#fff4d5", major: "#f8e7be",
    minor_a: "#c7ab7b", minor_b: "#ead7ab", roads_label_major: "#4d3f2d", roads_label_major_halo: "#f4e7c7",
    city_label: "#263f32", city_label_halo: "#f4e7c7",
    landcover: light.landcover ? { ...light.landcover, barren: "#cfb981", farmland: "#becb8d", forest: "#819966", grassland: "#adb881", scrub: "#b4b47b", urban_area: "#c8b993" } : undefined,
  };
  return {
    version: 8 as const,
    sources: { protomaps: { type: "vector" as const, url: `pmtiles://${tileUrl}`, attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>' } },
    layers: layers("protomaps", atlasFlavor),
  };
}
