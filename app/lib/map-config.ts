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
    background: "#d8c28d", earth: "#eadfbd", sand: "#dcc58d", water: "#62a7b3",
    park_a: "#afbd86", park_b: "#96a973", wood_a: "#a1b37b", wood_b: "#829866",
    scrub_a: "#bdc18f", scrub_b: "#a8ad7d", boundaries: "#9d8b69", buildings: "#bda87f",
    highway_casing_early: "#9b866c", highway_casing_late: "#9b866c", major_casing_early: "#aa9579",
    major_casing_late: "#aa9579", minor_casing: "#c4b18c", highway: "#fff8e8", major: "#f4e8cc",
    minor_a: "#d4c49f", minor_b: "#e7dab9", roads_label_major: "#574b39", roads_label_major_halo: "#f4ecd7",
    city_label: "#284536", city_label_halo: "#f4ecd7",
    landcover: light.landcover ? { ...light.landcover, barren: "#d8c695", farmland: "#c7cf9b", forest: "#8fa371", grassland: "#b7c08c", scrub: "#bfc092", urban_area: "#d1c5a7" } : undefined,
  };
  const atlasLayers = layers("protomaps", atlasFlavor).map((layer) => {
    if (layer.type === "fill") {
      if (layer.id === "landcover") return { ...layer, paint: { ...layer.paint, "fill-opacity": 0.58 } };
      if (layer.id.startsWith("landuse_")) return { ...layer, paint: { ...layer.paint, "fill-opacity": layer.id === "landuse_park" ? 0.48 : 0.24 } };
      if (layer.id === "buildings") return { ...layer, minzoom: 12.4, paint: { ...layer.paint, "fill-opacity": 0.42 } };
      return layer;
    }
    if (layer.type !== "line") return layer;
    if (layer.id.startsWith("boundaries")) return { ...layer, paint: { ...layer.paint, "line-opacity": 0.16 } };
    if (!layer.id.startsWith("roads_")) return layer;

    const isCasing = layer.id.includes("casing");
    let minzoom = layer.minzoom;
    let opacity = 0.42;
    if (/other|service|taxiway|pier/.test(layer.id)) { minzoom = Math.max(minzoom ?? 0, 12); opacity = 0.18; }
    else if (/minor|link/.test(layer.id)) { minzoom = Math.max(minzoom ?? 0, 10.6); opacity = 0.28; }
    else if (layer.id.includes("major")) opacity = 0.54;
    else if (layer.id.includes("highway")) opacity = 0.72;
    else if (layer.id.includes("rail")) { minzoom = Math.max(minzoom ?? 0, 10); opacity = 0.24; }
    if (isCasing) opacity *= 0.68;
    return { ...layer, minzoom, paint: { ...layer.paint, "line-opacity": opacity } };
  });
  return {
    version: 8 as const,
    sources: { protomaps: { type: "vector" as const, url: `pmtiles://${tileUrl}`, attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>' } },
    layers: atlasLayers,
  };
}
