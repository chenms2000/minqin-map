"use client";

import { useEffect, useRef, useState } from "react";
import { AttributionControl, Map as MapLibreMap, Marker, NavigationControl, Popup, ScaleControl, addProtocol, removeProtocol } from "maplibre-gl";
import { FileSource, PMTiles, Protocol, TileType } from "pmtiles";
import { fieldTracks, publicAsset, storyPointById, type StoryLayer, type StoryPoint, type WaterStage } from "@/content";
import { accuracyClass } from "@/app/lib/formatters";
import { cartographicPalette, cartographicTuning, contextLabels, defaultView, hillshadeInsertionBeforeId, historyContextLabels, localArchiveName, localArchivePath, localMapStyle, localSurfaceArchivePath, localSurfaceFocusArchivePath, localTerrainArchiveName, localTerrainArchivePath, mapBounds, practiceRoute, surfaceAttribution, surfaceFocusAttribution, surfaceFocusLayerId, surfaceFocusRasterPaint, surfaceFocusSourceId, surfaceInsertionBeforeId, surfaceLayerId, surfaceRasterPaint, surfaceSourceId, terrainAttribution, terrainHillshadeLayerId, terrainHillshadePaint, terrainSourceId, waterRoute, zoomExpression, type MapPresentationMode } from "@/app/lib/map-config";

type UseMinqinMapOptions = {
  activeLayer: StoryLayer;
  activePoints: StoryPoint[];
  mapSelectedPointId: string | null;
  presentationMode: MapPresentationMode;
  historyStage: WaterStage | null;
  toolPortals: readonly MapToolPortal[];
  onPointActivate: (pointId: string) => void;
  onToolActivate: (module: MapToolPortal["module"]) => void;
};

export type MapToolPortal = {
  id: string;
  label: string;
  module: "water" | "resources";
  pointId: string;
};

type PointMarkerEntry = { marker: Marker; element: HTMLButtonElement };

export function useMinqinMap({ activeLayer, activePoints, mapSelectedPointId, presentationMode, historyStage, toolPortals, onPointActivate, onToolActivate }: UseMinqinMapOptions) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<MapLibreMap | null>(null);
  const contextMarkers = useRef<Marker[]>([]);
  const historyMarkers = useRef<Marker[]>([]);
  const historyNotice = useRef<HTMLDivElement | null>(null);
  const pointMarkers = useRef<Map<string, PointMarkerEntry>>(new Map());
  const toolMarkers = useRef<Map<string, Marker>>(new Map());
  const activationRef = useRef(onPointActivate);
  const toolActivationRef = useRef(onToolActivate);
  const presentationModeRef = useRef(presentationMode);
  const [mapFallback, setMapFallback] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapProgress, setMapProgress] = useState(4);

  useEffect(() => {
    activationRef.current = onPointActivate;
  }, [onPointActivate]);

  useEffect(() => {
    toolActivationRef.current = onToolActivate;
  }, [onToolActivate]);

  useEffect(() => {
    presentationModeRef.current = presentationMode;
    const map = mapInstance.current;
    if (map?.getLayer(terrainHillshadeLayerId)) {
      map.setPaintProperty(terrainHillshadeLayerId, "hillshade-exaggeration", terrainHillshadePaint(presentationMode)["hillshade-exaggeration"]);
    }
    if (map?.getLayer(surfaceLayerId)) {
      map.setPaintProperty(surfaceLayerId, "raster-opacity", surfaceRasterPaint(presentationMode)["raster-opacity"]);
    }
    if (map?.getLayer(surfaceFocusLayerId)) {
      map.setPaintProperty(surfaceFocusLayerId, "raster-opacity", surfaceFocusRasterPaint(presentationMode)["raster-opacity"]);
    }
  }, [mapReady, presentationMode]);

  useEffect(() => {
    const container = mapContainer.current;
    const map = mapInstance.current;
    if (!container || !map || !mapReady) return;

    let resizeFrame = 0;
    const resizeMap = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => map.resize());
    };
    const resizeObserver = new ResizeObserver(resizeMap);
    resizeObserver.observe(container);
    window.addEventListener("resize", resizeMap);
    resizeMap();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resizeMap);
      window.cancelAnimationFrame(resizeFrame);
    };
  }, [mapReady]);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    const container: HTMLDivElement = mapContainer.current;
    const pointMarkerRegistry = pointMarkers.current;
    const toolMarkerRegistry = toolMarkers.current;
    const protocol = new Protocol();
    const abortController = new AbortController();
    let map: MapLibreMap | null = null;
    let protocolRegistered = false;
    let disposed = false;
    let loaded = false;
    const fallbackTimer = window.setTimeout(() => { if (!loaded) setMapFallback(true); }, 12000);

    async function addSurfaceEnhancement(activeMap: MapLibreMap) {
      container.dataset.surfaceState = "loading";
      try {
        const surfacePath = new URLSearchParams(window.location.search).get("surface") === "missing"
          ? publicAsset("/maps/__missing-minqin-surface.pmtiles")
          : localSurfaceArchivePath;
        const surfaceUrl = new URL(surfacePath, window.location.href).href;
        const surfaceArchive = new PMTiles(surfaceUrl);
        const header = await surfaceArchive.getHeader();
        if (header.tileType !== TileType.Jpeg) throw new Error("Surface PMTiles archive must contain JPEG raster tiles");
        if (disposed) return;
        protocol.add(surfaceArchive);
        activeMap.addSource(surfaceSourceId, {
          type: "raster",
          url: `pmtiles://${surfaceUrl}`,
          attribution: surfaceAttribution,
          tileSize: cartographicTuning.surface.tileSize,
          minzoom: cartographicTuning.surface.sourceMinZoom,
          maxzoom: cartographicTuning.surface.nativeMaxZoom,
        });
        activeMap.addLayer({
          id: surfaceLayerId,
          type: "raster",
          source: surfaceSourceId,
          minzoom: cartographicTuning.surface.sourceMinZoom,
          paint: surfaceRasterPaint(presentationModeRef.current),
        }, surfaceInsertionBeforeId(activeMap.getStyle().layers));
        container.dataset.surfaceState = "ready";
      } catch {
        if (abortController.signal.aborted || disposed) return;
        container.dataset.surfaceState = "unavailable";
      }
    }

    async function addTerrainEnhancement(activeMap: MapLibreMap) {
      container.dataset.terrainState = "loading";
      try {
        const terrainPath = new URLSearchParams(window.location.search).get("terrain") === "missing"
          ? publicAsset("/maps/__missing-minqin-terrain.pmtiles")
          : localTerrainArchivePath;
        const response = await fetch(terrainPath, { cache: "force-cache", signal: abortController.signal });
        if (!response.ok) throw new Error(`Terrain PMTiles request failed: ${response.status}`);
        const archiveBlob = await response.blob();
        if (archiveBlob.size < 1024) throw new Error("Terrain PMTiles archive is incomplete");
        const terrainArchive = new PMTiles(new FileSource(new File([archiveBlob], localTerrainArchiveName, { type: "application/octet-stream" })));
        const header = await terrainArchive.getHeader();
        if (header.tileType !== TileType.Png) throw new Error("Terrain PMTiles archive must contain PNG DEM tiles");
        if (disposed) return;
        protocol.add(terrainArchive);
        activeMap.addSource(terrainSourceId, {
          type: "raster-dem",
          url: `pmtiles://${localTerrainArchiveName}`,
          attribution: terrainAttribution,
          encoding: "terrarium",
          tileSize: cartographicTuning.terrain.tileSize,
          minzoom: cartographicTuning.terrain.sourceMinZoom,
          maxzoom: cartographicTuning.terrain.nativeMaxZoom,
        });
        const beforeId = hillshadeInsertionBeforeId(activeMap.getStyle().layers);
        activeMap.addLayer({
          id: terrainHillshadeLayerId,
          type: "hillshade",
          source: terrainSourceId,
          minzoom: cartographicTuning.terrain.sourceMinZoom,
          paint: terrainHillshadePaint(presentationModeRef.current),
        }, beforeId);
        container.dataset.terrainState = "ready";
      } catch {
        if (abortController.signal.aborted || disposed) return;
        container.dataset.terrainState = "unavailable";
      }
    }

    async function addSurfaceFocusEnhancement(activeMap: MapLibreMap) {
      container.dataset.focusState = "loading";
      try {
        const focusPath = new URLSearchParams(window.location.search).get("focus") === "missing"
          ? publicAsset("/maps/__missing-minqin-surface-focus.pmtiles")
          : localSurfaceFocusArchivePath;
        const focusUrl = new URL(focusPath, window.location.href).href;
        const focusArchive = new PMTiles(focusUrl);
        const header = await focusArchive.getHeader();
        if (header.tileType !== TileType.Png) throw new Error("Focus surface PMTiles archive must contain PNG raster tiles with alpha transparency");
        if (disposed) return;
        protocol.add(focusArchive);
        activeMap.addSource(surfaceFocusSourceId, {
          type: "raster",
          url: `pmtiles://${focusUrl}`,
          attribution: surfaceFocusAttribution,
          tileSize: cartographicTuning.surfaceFocus.tileSize,
          minzoom: cartographicTuning.surfaceFocus.sourceMinZoom,
          maxzoom: cartographicTuning.surfaceFocus.nativeMaxZoom,
        });
        activeMap.addLayer({
          id: surfaceFocusLayerId,
          type: "raster",
          source: surfaceFocusSourceId,
          minzoom: cartographicTuning.surfaceFocus.sourceMinZoom,
          paint: surfaceFocusRasterPaint(presentationModeRef.current),
        }, surfaceInsertionBeforeId(activeMap.getStyle().layers));
        container.dataset.focusState = "ready";
      } catch {
        if (abortController.signal.aborted || disposed) return;
        container.dataset.focusState = "unavailable";
      }
    }

    async function initializeMap() {
      try {
        if (new URLSearchParams(window.location.search).get("map") === "fallback") throw new Error("Fallback preview requested");
        const response = await fetch(localArchivePath, { cache: "force-cache", signal: abortController.signal });
        if (!response.ok) throw new Error(`PMTiles request failed: ${response.status}`);
        const total = Number(response.headers.get("content-length")) || 0;
        let archiveBlob: Blob;
        if (response.body) {
          const reader = response.body.getReader();
          const chunks: Uint8Array[] = [];
          let received = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              received += value.length;
              setMapProgress(total ? Math.min(92, Math.round((received / total) * 92)) : Math.min(92, 15 + chunks.length * 8));
            }
          }
          archiveBlob = new Blob(chunks as BlobPart[], { type: "application/octet-stream" });
        } else {
          archiveBlob = await response.blob();
        }
        if (archiveBlob.size < 1024) throw new Error("PMTiles archive is incomplete");
        const archive = new PMTiles(new FileSource(new File([archiveBlob], localArchiveName, { type: "application/octet-stream" })));
        await archive.getHeader();
        if (disposed) return;
        protocol.add(archive);
        addProtocol("pmtiles", protocol.tile);
        protocolRegistered = true;
        map = new MapLibreMap({ container, style: localMapStyle(localArchiveName), ...defaultView, attributionControl: false, minZoom: 7.2, maxZoom: 14, maxPitch: 68, maxBounds: mapBounds });
        mapInstance.current = map;
        map.addControl(new NavigationControl({ visualizePitch: true }), "bottom-right");
        map.addControl(new ScaleControl({ maxWidth: 110, unit: "metric" }), "bottom-left");
        map.addControl(new AttributionControl({ compact: true }), "bottom-left");
        map.once("load", () => {
          if (!map || disposed) return;
          loaded = true;
          window.clearTimeout(fallbackTimer);
          setMapFallback(false);
          setMapProgress(100);
          map.addSource("practice-route", { type: "geojson", data: practiceRoute });
          map.addLayer({ id: "practice-route-halo", type: "line", source: "practice-route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": cartographicPalette.routes.practiceHalo, "line-width": zoomExpression(cartographicTuning.routes.practiceHalo.width), "line-opacity": zoomExpression(cartographicTuning.routes.practiceHalo.opacity) } });
          map.addLayer({ id: "practice-route-line", type: "line", source: "practice-route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": cartographicPalette.routes.practice, "line-width": zoomExpression(cartographicTuning.routes.practice.width), "line-opacity": zoomExpression(cartographicTuning.routes.practice.opacity), "line-dasharray": [1.2, 2.4] } });
          fieldTracks.forEach((track) => {
            const sourceId = `field-track-${track.id}`;
            const layerId = `${sourceId}-line`;
            map?.addSource(sourceId, { type: "geojson", data: { type: "Feature", properties: { label: track.label, notice: track.notice }, geometry: { type: "LineString", coordinates: track.coordinates } } });
            map?.addLayer({ id: layerId, type: "line", source: sourceId, layout: { visibility: "visible", "line-cap": "round", "line-join": "round" }, paint: { "line-color": track.color, "line-width": zoomExpression(cartographicTuning.routes.field.width), "line-opacity": zoomExpression(cartographicTuning.routes.field.opacity), "line-dasharray": [0.25, 1.4] } });
            map?.on("mouseenter", layerId, () => { if (map) map.getCanvas().style.cursor = "pointer"; });
            map?.on("mouseleave", layerId, () => { if (map) map.getCanvas().style.cursor = ""; });
            map?.on("click", layerId, (event) => {
              if (!map) return;
              const content = document.createElement("div");
              const title = document.createElement("strong");
              const note = document.createElement("small");
              title.textContent = track.label;
              note.textContent = track.notice;
              content.className = "track-popup";
              content.append(title, note);
              new Popup({ closeButton: false, offset: 8 }).setLngLat(event.lngLat).setDOMContent(content).addTo(map);
            });
          });
          map.addSource("water-route", { type: "geojson", data: waterRoute });
          map.addLayer({ id: "water-route-line", type: "line", source: "water-route", layout: { visibility: "none", "line-cap": "round", "line-join": "round" }, paint: { "line-color": cartographicPalette.routes.water, "line-width": zoomExpression(cartographicTuning.routes.water.width), "line-opacity": zoomExpression(cartographicTuning.routes.water.opacity) } });
          setMapReady(true);
          window.setTimeout(() => {
            if (!map || disposed) return;
            void addSurfaceEnhancement(map)
              .then(() => map && !disposed ? addSurfaceFocusEnhancement(map) : undefined)
              .then(() => map && !disposed ? addTerrainEnhancement(map) : undefined);
          }, 0);
        });
        map.on("error", () => { if (!loaded) setMapFallback(true); });
      } catch {
        if (abortController.signal.aborted || disposed) return;
        window.clearTimeout(fallbackTimer);
        setMapFallback(true);
      }
    }

    void initializeMap();
    return () => {
      disposed = true;
      abortController.abort();
      window.clearTimeout(fallbackTimer);
      contextMarkers.current.forEach((marker) => marker.remove());
      contextMarkers.current = [];
      historyMarkers.current.forEach((marker) => marker.remove());
      historyMarkers.current = [];
      historyNotice.current?.remove();
      historyNotice.current = null;
      pointMarkerRegistry.forEach(({ marker }) => marker.remove());
      pointMarkerRegistry.clear();
      toolMarkerRegistry.forEach((marker) => marker.remove());
      toolMarkerRegistry.clear();
      map?.remove();
      if (protocolRegistered) removeProtocol("pmtiles");
      delete container.dataset.terrainState;
      delete container.dataset.surfaceState;
      delete container.dataset.focusState;
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    const contextElements: Array<{ element: HTMLDivElement; minZoom: number; fullZoom: number }> = [];
    contextLabels.forEach((label) => {
      const element = document.createElement("div");
      element.className = `map-context-label ${label.kind}`;
      if (label.name === "民勤县") {
        const chinese = document.createElement("strong");
        const latin = document.createElement("small");
        chinese.textContent = "民 勤 县";
        latin.textContent = "MINQIN COUNTY";
        element.append(chinese, latin);
      } else {
        element.textContent = label.name;
      }
      element.setAttribute("aria-hidden", "true");
      contextElements.push({ element, minZoom: label.minZoom, fullZoom: label.fullZoom });
      contextMarkers.current.push(new Marker({ element, anchor: "center" }).setLngLat(label.coordinates).addTo(map));
    });
    const updateContextLabelDensity = () => {
      const zoom = map.getZoom();
      contextElements.forEach(({ element, minZoom, fullZoom }) => {
        const opacity = Math.max(0, Math.min(1, (zoom - minZoom) / (fullZoom - minZoom)));
        element.style.setProperty("--context-opacity", opacity.toFixed(2));
        element.classList.toggle("is-visible", opacity > 0.04);
      });
    };
    updateContextLabelDensity();
    map.on("zoom", updateContextLabelDensity);
    return () => {
      map.off("zoom", updateContextLabelDensity);
      contextMarkers.current.forEach((marker) => marker.remove());
      contextMarkers.current = [];
    };
  }, [mapReady]);

  useEffect(() => {
    const map = mapInstance.current;
    const container = mapContainer.current;
    if (!map || !container) return;
    historyMarkers.current.forEach((marker) => marker.remove());
    historyMarkers.current = [];
    historyNotice.current?.remove();
    historyNotice.current = null;
    delete container.dataset.historyStage;
    if (!historyStage) return;

    container.dataset.historyStage = historyStage.phase;
    historyContextLabels.forEach((label) => {
      const element = document.createElement("div");
      element.className = `map-history-region ${label.kind} phase-${historyStage.phase}`;
      element.textContent = label.name;
      element.setAttribute("aria-hidden", "true");
      historyMarkers.current.push(new Marker({ element, anchor: "center" }).setLngLat(label.coordinates).addTo(map));
    });
    const notice = document.createElement("div");
    notice.className = "map-history-boundary-note";
    notice.textContent = "区域关系示意 · 非历史沙漠边界";
    notice.setAttribute("aria-hidden", "true");
    container.append(notice);
    historyNotice.current = notice;

    return () => {
      historyMarkers.current.forEach((marker) => marker.remove());
      historyMarkers.current = [];
      notice.remove();
      if (historyNotice.current === notice) historyNotice.current = null;
      delete container.dataset.historyStage;
    };
  }, [historyStage, mapReady]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    toolMarkers.current.forEach((marker) => marker.remove());
    const markersForMode = new Map<string, Marker>();
    toolMarkers.current = markersForMode;
    if (presentationMode === "free") {
      toolPortals.forEach((portal) => {
        const anchorPoint = storyPointById.get(portal.pointId);
        if (!anchorPoint) return;
        const button = document.createElement("button");
        button.type = "button";
        button.className = `map-tool-portal-marker ${portal.module}`;
        button.setAttribute("aria-label", `打开探索工具：${portal.label}`);
        const eyebrow = document.createElement("span");
        eyebrow.className = "map-tool-portal-kicker";
        eyebrow.textContent = portal.module === "water" ? "历史工具" : "探索工具";
        const label = document.createElement("strong");
        label.textContent = portal.label;
        button.append(eyebrow, label);
        button.addEventListener("click", () => toolActivationRef.current(portal.module));
        const offset: [number, number] = portal.module === "water" ? [52, -12] : [-52, -12];
        const marker = new Marker({ element: button, anchor: "center", offset }).setLngLat(anchorPoint.coordinates).addTo(map);
        markersForMode.set(portal.id, marker);
      });
    }
    return () => {
      markersForMode.forEach((marker) => marker.remove());
      if (toolMarkers.current === markersForMode) toolMarkers.current.clear();
    };
  }, [mapReady, presentationMode, toolPortals]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    pointMarkers.current.forEach(({ marker }) => marker.remove());
    const markersForLayer = new Map<string, PointMarkerEntry>();
    pointMarkers.current = markersForLayer;
    activePoints.forEach((point) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `map-story-marker ${activeLayer} ${accuracyClass(point.accuracy)} ${point.contentOrigin === "团队实践" ? "field" : "reference"}`;
      button.style.setProperty("--marker-color", point.color);
      button.setAttribute("aria-label", `打开故事：${point.title}`);
      button.setAttribute("aria-pressed", "false");
      button.title = `${point.title}｜${point.accuracy}`;
      const label = document.createElement("span");
      label.className = "map-story-marker-label";
      label.textContent = point.title;
      label.setAttribute("aria-hidden", "true");
      button.append(label);
      button.addEventListener("click", () => activationRef.current(point.id));
      const marker = new Marker({ element: button, anchor: "center" }).setLngLat(point.coordinates).addTo(map);
      markersForLayer.set(point.id, { marker, element: button });
    });
    if (map.loaded()) {
      map.setLayoutProperty("practice-route-halo", "visibility", activeLayer === "practice" ? "visible" : "none");
      map.setLayoutProperty("practice-route-line", "visibility", activeLayer === "practice" ? "visible" : "none");
      fieldTracks.forEach((track) => {
        const layerId = `field-track-${track.id}-line`;
        if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", activeLayer === "practice" ? "visible" : "none");
      });
      map.setLayoutProperty("water-route-line", "visibility", activeLayer === "water" ? "visible" : "none");
    }
    return () => {
      markersForLayer.forEach(({ marker }) => marker.remove());
      if (pointMarkers.current === markersForLayer) pointMarkers.current.clear();
    };
  }, [activeLayer, activePoints, mapReady]);

  useEffect(() => {
    pointMarkers.current.forEach(({ element }, pointId) => {
      const isSelected = mapSelectedPointId === pointId;
      element.classList.toggle("is-selected", isSelected);
      element.classList.toggle("is-dimmed", Boolean(mapSelectedPointId) && !isSelected);
      element.setAttribute("aria-pressed", String(isSelected));
      if (isSelected) element.setAttribute("aria-current", "location");
      else element.removeAttribute("aria-current");
    });
  }, [activeLayer, activePoints, mapReady, mapSelectedPointId]);

  return { mapContainer, mapInstance, mapFallback, mapReady, mapProgress };
}
