import { layers, namedFlavor } from "@protomaps/basemaps";
import type { FeatureCollection, LineString } from "geojson";
import type { StoryLayer } from "@/content";
import { publicAsset } from "@/content/public-assets";

type ZoomExpression = ["interpolate", ["linear"], ["zoom"], ...number[]];
export type MapPresentationMode = "free" | "story" | "tour";

export const cartographicPalette = {
  terrain: {
    background: "#d8c28d", earth: "#eadfbd", sand: "#dcc58d", water: "#62a7b3",
    parkA: "#afbd86", parkB: "#96a973", woodA: "#a1b37b", woodB: "#829866",
    scrubA: "#bdc18f", scrubB: "#a8ad7d", barren: "#d8c695", farmland: "#c7cf9b",
    forest: "#8fa371", grassland: "#b7c08c", scrub: "#bfc092", urban: "#d1c5a7",
    reliefShadow: "#77694f", reliefHighlight: "#f2e7c6", reliefAccent: "#a39470",
    surfaceFallback: "#d4c59e",
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
  terrain: {
    sourceMinZoom: 7,
    nativeMaxZoom: 12,
    tileSize: 256,
    illuminationDirection: 322,
    intensity: {
      free: [7.2, 0.055, 8.4, 0.085, 10, 0.14, 11.5, 0.125, 14, 0.085],
      story: [7.2, 0.035, 8.4, 0.055, 10, 0.09, 11.5, 0.08, 14, 0.055],
      tour: [7.2, 0.022, 8.4, 0.035, 10, 0.058, 11.5, 0.05, 14, 0.034],
    },
  },
  surface: {
    sourceMinZoom: 7,
    nativeMaxZoom: 13,
    tileSize: 256,
    opacity: {
      free: [7.2, 0.34, 8.4, 0.43, 10, 0.46, 12, 0.44, 14, 0.40],
      story: [7.2, 0.22, 8.4, 0.28, 10, 0.31, 12, 0.29, 14, 0.26],
      tour: [7.2, 0.16, 8.4, 0.20, 10, 0.23, 12, 0.21, 14, 0.18],
    },
  },
  surfaceFocus: {
    sourceMinZoom: 12,
    nativeMaxZoom: 14,
    tileSize: 256,
    opacity: {
      free: [12, 0, 12.7, 0.28, 13.5, 0.58, 14, 0.66],
      story: [12, 0, 12.7, 0.2, 13.5, 0.42, 14, 0.48],
      tour: [12, 0, 12.7, 0.14, 13.5, 0.3, 14, 0.34],
    },
  },
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
    water: { width: [7.2, 0.7, 9, 1.05, 11, 1.55, 14, 2.2], opacity: [7.2, 0.14, 9, 0.22, 11, 0.34, 14, 0.46] },
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

export const INTERACTION_BOUNDS: [[number, number], [number, number]] = [[102.45, 37.8], [103.75, 39.35]];
export const RENDER_CONTEXT_BOUNDS: [[number, number], [number, number]] = [[102.12890625, 37.474858084971025], [104.0625, 39.67337039176559]];
export const mapBounds = INTERACTION_BOUNDS;
export const defaultView = { center: [103.16, 38.72] as [number, number], zoom: 9.15, pitch: 38, bearing: -12 };
export const localArchivePath = publicAsset("/maps/minqin-2026.pmtiles");
export const localArchiveName = "minqin-2026.pmtiles";
export const localTerrainArchivePath = publicAsset("/maps/minqin-terrain-2026.pmtiles");
export const localTerrainArchiveName = "minqin-terrain-2026.pmtiles";
export const terrainSourceId = "minqin-terrain-dem";
export const terrainHillshadeLayerId = "minqin-terrain-hillshade";
export const terrainAttribution = '<a href="https://registry.opendata.aws/terrain-tiles/" target="_blank">Terrain: Mapzen</a> · <a href="https://www.usgs.gov/centers/eros/science/usgs-eros-archive-digital-elevation-shuttle-radar-topography-mission-srtm-1" target="_blank">SRTM / GMTED2010 courtesy of USGS</a>';
export const localSurfaceArchivePath = publicAsset("/maps/minqin-surface-2026.pmtiles");
export const localSurfaceArchiveName = "minqin-surface-2026.pmtiles";
export const surfaceSourceId = "minqin-surface-raster";
export const surfaceLayerId = "minqin-surface-texture";
export const surfaceAttribution = '<a href="https://registry.opendata.aws/sentinel-2-l2a-cogs/" target="_blank">Contains modified Copernicus Sentinel data 2026</a> · Element 84';
export const localSurfaceFocusArchivePath = publicAsset("/maps/minqin-surface-focus-2026.pmtiles");
export const surfaceFocusSourceId = "minqin-surface-focus-raster";
export const surfaceFocusLayerId = "minqin-surface-focus-texture";
export const surfaceFocusAttribution = surfaceAttribution;

export function surfaceRasterPaint(mode: MapPresentationMode) {
  return {
    "raster-opacity": zoomExpression(cartographicTuning.surface.opacity[mode]),
    "raster-fade-duration": 180,
    "raster-resampling": "linear" as const,
  };
}

export function surfaceFocusRasterPaint(mode: MapPresentationMode) {
  return {
    "raster-opacity": zoomExpression(cartographicTuning.surfaceFocus.opacity[mode]),
    "raster-fade-duration": 140,
    "raster-resampling": "linear" as const,
  };
}

export function terrainHillshadePaint(mode: MapPresentationMode) {
  return {
    "hillshade-accent-color": cartographicPalette.terrain.reliefAccent,
    "hillshade-exaggeration": zoomExpression(cartographicTuning.terrain.intensity[mode]),
    "hillshade-highlight-color": cartographicPalette.terrain.reliefHighlight,
    "hillshade-illumination-anchor": "map" as const,
    "hillshade-illumination-direction": cartographicTuning.terrain.illuminationDirection,
    "hillshade-shadow-color": cartographicPalette.terrain.reliefShadow,
  };
}

export function hillshadeInsertionBeforeId(styleLayers: readonly { id: string }[]) {
  const landcoverIndex = styleLayers.findIndex((layer) => layer.id === "landcover");
  return landcoverIndex >= 0 ? styleLayers[landcoverIndex]?.id : undefined;
}

export function surfaceInsertionBeforeId(styleLayers: readonly { id: string }[]) {
  const landcoverIndex = styleLayers.findIndex((layer) => layer.id === "landcover");
  return landcoverIndex >= 0 ? styleLayers[landcoverIndex]?.id : undefined;
}

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

// These anchors communicate regional direction only; they are not desert polygons or historical boundaries.
export const historyContextLabels = [
  { name: "巴丹吉林沙漠南缘", coordinates: [102.72, 39.12] as [number, number], kind: "desert badain" },
  { name: "民勤绿洲", coordinates: [103.14, 38.76] as [number, number], kind: "oasis" },
  { name: "腾格里沙漠西缘", coordinates: [103.63, 38.58] as [number, number], kind: "desert tengger" },
] as const;

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
      if (layer.id === "landcover") return { ...layer, paint: { ...layer.paint, "fill-opacity": zoomExpression([7.2, 0.16, 8.5, 0.19, 10, 0.24, 14, 0.3]) } };
      if (layer.id === "landuse_park" || layer.id === "landuse_urban_green") return { ...layer, paint: { ...layer.paint, "fill-opacity": zoomExpression([7.2, 0.12, 10, 0.2, 14, 0.28]) } };
      if (layer.id.startsWith("landuse_")) return { ...layer, minzoom: Math.max(layer.minzoom ?? 0, 10.8), paint: { ...layer.paint, "fill-opacity": zoomExpression([10.8, 0, 12, 0.1, 14, 0.2]) } };
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
