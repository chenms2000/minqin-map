import { layers, namedFlavor } from "@protomaps/basemaps";
import type { FeatureCollection, LineString } from "geojson";
import type { StoryLayer } from "@/content";

type ZoomExpression = ["interpolate", ["linear"], ["zoom"], ...number[]];

export const cartographicPalette = {
  terrain: {
    background: "#d8c28d", earth: "#eadfbd", sand: "#dcc58d", water: "#62a7b3",
    parkA: "#afbd86", parkB: "#96a973", woodA: "#a1b37b", woodB: "#829866",
    scrubA: "#bdc18f", scrubB: "#a8ad7d", barren: "#d8c695", farmland: "#c7cf9b",
    forest: "#8fa371", grassland: "#b7c08c", scrub: "#bfc092", urban: "#d1c5a7",
  },
  roads: {
    boundary: "#9d8b69", building: "#bda87f", highwayCasing: "#9b866c",
    majorCasing: "#aa9579", minorCasing: "#c4b18c", highway: "#fff8e8",
    major: "#f4e8cc", minorA: "#d4c49f", minorB: "#e7dab9",
    label: "#574b39", labelHalo: "#f4ecd7",
  },
  labels: { city: "#284536", halo: "#f4ecd7" },
  routes: { practice: "#ad4d3d", practiceHalo: "#fff4dc", water: "#228aa1" },
} as const;

export const cartographicTuning = {
  context: {
    city: { minZoom: 7.1, fullZoom: 8 },
    water: { minZoom: 7.4, fullZoom: 8.6 },
    town: { minZoom: 9.7, fullZoom: 10.7 },
  },
  roads: {
    highway: { minZoom: 7.2, opacity: [7.2, 0.28, 9, 0.52, 11, 0.7, 14, 0.82] },
    major: { minZoom: 7.6, opacity: [7.6, 0.12, 9, 0.3, 11, 0.5, 14, 0.64] },
    minor: { minZoom: 9.35, opacity: [9.35, 0, 10.2, 0.12, 11.5, 0.28, 14, 0.42] },
    service: { minZoom: 11.6, opacity: [11.6, 0, 12.4, 0.1, 14, 0.22] },
    rail: { minZoom: 10, opacity: [10, 0.08, 12, 0.18, 14, 0.3] },
    casingFactor: 0.58,
  },
  routes: {
    practiceHalo: { width: [7.2, 2.2, 9, 3.2, 11, 4.5, 14, 5.8], opacity: [7.2, 0.1, 9, 0.18, 11, 0.26, 14, 0.34] },
    practice: { width: [7.2, 0.8, 9, 1.15, 11, 1.55, 14, 2], opacity: [7.2, 0.26, 9, 0.38, 11, 0.52, 14, 0.64] },
    field: { width: [7.2, 0.9, 9, 1.25, 11, 1.9, 14, 2.7], opacity: [7.2, 0.24, 9, 0.36, 11, 0.55, 14, 0.72] },
    water: { width: [7.2, 1.2, 9, 2, 11, 3.2, 14, 4.6], opacity: [7.2, 0.24, 9, 0.4, 11, 0.62, 14, 0.78] },
  },
} as const;

export function zoomExpression(stops: readonly number[]): ZoomExpression {
  return ["interpolate", ["linear"], ["zoom"], ...stops];
}

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
  { name: "武威市 / 凉州", coordinates: [102.63488, 37.92782] as [number, number], kind: "city", ...cartographicTuning.context.city },
  { name: "民勤县", coordinates: [103.09493, 38.6268] as [number, number], kind: "city", ...cartographicTuning.context.city },
  { name: "薛百镇", coordinates: [103.01974, 38.54682] as [number, number], kind: "town", ...cartographicTuning.context.town },
  { name: "大滩镇", coordinates: [103.24651, 38.76667] as [number, number], kind: "town", ...cartographicTuning.context.town },
  { name: "泉山镇", coordinates: [103.3065, 38.86036] as [number, number], kind: "town", ...cartographicTuning.context.town },
  { name: "收成镇", coordinates: [103.60322, 38.90018] as [number, number], kind: "town", ...cartographicTuning.context.town },
  { name: "西渠镇", coordinates: [103.54082, 38.97829] as [number, number], kind: "town", ...cartographicTuning.context.town },
  { name: "东湖镇", coordinates: [103.67343, 38.9498] as [number, number], kind: "town", ...cartographicTuning.context.town },
  { name: "红崖山水库", coordinates: [103.04, 38.42] as [number, number], kind: "water", ...cartographicTuning.context.water },
  { name: "青土湖", coordinates: [103.56, 39.12] as [number, number], kind: "water", ...cartographicTuning.context.water },
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
  const terrain = cartographicPalette.terrain;
  const roadColors = cartographicPalette.roads;
  const atlasFlavor = {
    ...light,
    background: terrain.background, earth: terrain.earth, sand: terrain.sand, water: terrain.water,
    park_a: terrain.parkA, park_b: terrain.parkB, wood_a: terrain.woodA, wood_b: terrain.woodB,
    scrub_a: terrain.scrubA, scrub_b: terrain.scrubB, boundaries: roadColors.boundary, buildings: roadColors.building,
    highway_casing_early: roadColors.highwayCasing, highway_casing_late: roadColors.highwayCasing,
    major_casing_early: roadColors.majorCasing, major_casing_late: roadColors.majorCasing, minor_casing: roadColors.minorCasing,
    highway: roadColors.highway, major: roadColors.major, minor_a: roadColors.minorA, minor_b: roadColors.minorB,
    roads_label_major: roadColors.label, roads_label_major_halo: roadColors.labelHalo,
    city_label: cartographicPalette.labels.city, city_label_halo: cartographicPalette.labels.halo,
    landcover: light.landcover ? { ...light.landcover, barren: terrain.barren, farmland: terrain.farmland, forest: terrain.forest, grassland: terrain.grassland, scrub: terrain.scrub, urban_area: terrain.urban } : undefined,
  };
  const atlasLayers = layers("protomaps", atlasFlavor).map((layer) => {
    if (layer.type === "fill") {
      if (layer.id === "landcover") return { ...layer, paint: { ...layer.paint, "fill-opacity": zoomExpression([7.2, 0.54, 10, 0.6, 14, 0.66]) } };
      if (layer.id === "landuse_park" || layer.id === "landuse_urban_green") return { ...layer, paint: { ...layer.paint, "fill-opacity": zoomExpression([7.2, 0.3, 10, 0.42, 14, 0.5]) } };
      if (layer.id.startsWith("landuse_")) return { ...layer, minzoom: Math.max(layer.minzoom ?? 0, 10.8), paint: { ...layer.paint, "fill-opacity": zoomExpression([10.8, 0, 12, 0.16, 14, 0.28]) } };
      if (layer.id === "buildings") return { ...layer, minzoom: 12, paint: { ...layer.paint, "fill-opacity": zoomExpression([12, 0.04, 13, 0.28, 14, 0.44]) } };
      return layer;
    }
    if (layer.type !== "line") return layer;
    if (layer.id.startsWith("boundaries")) return { ...layer, paint: { ...layer.paint, "line-opacity": zoomExpression([7.2, 0.1, 10, 0.14, 14, 0.2]) } };
    if (!layer.id.startsWith("roads_")) return layer;

    const isCasing = layer.id.includes("casing");
    const roadClass = /other|service|taxiway|pier/.test(layer.id) ? "service"
      : /minor|link/.test(layer.id) ? "minor"
        : layer.id.includes("major") ? "major"
          : layer.id.includes("highway") ? "highway"
            : layer.id.includes("rail") ? "rail" : null;
    if (!roadClass) return layer;
    const tuning = cartographicTuning.roads[roadClass];
    const opacityStops = tuning.opacity.map((value, index) => index % 2 === 1 && isCasing ? value * cartographicTuning.roads.casingFactor : value);
    return { ...layer, minzoom: Math.max(layer.minzoom ?? 0, tuning.minZoom), paint: { ...layer.paint, "line-opacity": zoomExpression(opacityStops) } };
  });
  return {
    version: 8 as const,
    sources: { protomaps: { type: "vector" as const, url: `pmtiles://${tileUrl}`, attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>' } },
    layers: atlasLayers,
  };
}
