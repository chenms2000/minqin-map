"use client";

import { useEffect, useRef, useState } from "react";
import { AttributionControl, Map as MapLibreMap, Marker, NavigationControl, Popup, ScaleControl, addProtocol, removeProtocol } from "maplibre-gl";
import { FileSource, PMTiles, Protocol } from "pmtiles";
import { fieldTracks, type StoryLayer, type StoryPoint } from "@/content";
import { accuracyClass } from "@/app/lib/formatters";
import { contextLabels, defaultView, localArchiveName, localArchivePath, localMapStyle, mapBounds, practiceRoute, waterRoute } from "@/app/lib/map-config";

type UseMinqinMapOptions = {
  activeLayer: StoryLayer;
  activePoints: StoryPoint[];
  onPointActivate: (pointId: string) => void;
};

export function useMinqinMap({ activeLayer, activePoints, onPointActivate }: UseMinqinMapOptions) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<MapLibreMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const activationRef = useRef(onPointActivate);
  const [mapFallback, setMapFallback] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapProgress, setMapProgress] = useState(4);

  useEffect(() => {
    activationRef.current = onPointActivate;
  }, [onPointActivate]);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    const protocol = new Protocol();
    const abortController = new AbortController();
    let map: MapLibreMap | null = null;
    let protocolRegistered = false;
    let disposed = false;
    let loaded = false;
    const fallbackTimer = window.setTimeout(() => { if (!loaded) setMapFallback(true); }, 12000);

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
        if (disposed || !mapContainer.current) return;
        protocol.add(archive);
        addProtocol("pmtiles", protocol.tile);
        protocolRegistered = true;
        map = new MapLibreMap({ container: mapContainer.current, style: localMapStyle(localArchiveName), ...defaultView, attributionControl: false, minZoom: 7.2, maxZoom: 14, maxPitch: 68, maxBounds: mapBounds });
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
          map.addLayer({ id: "practice-route-line", type: "line", source: "practice-route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#d95c3d", "line-width": 3, "line-opacity": 0.78, "line-dasharray": [1, 1.8] } });
          fieldTracks.forEach((track) => {
            const sourceId = `field-track-${track.id}`;
            const layerId = `${sourceId}-line`;
            map?.addSource(sourceId, { type: "geojson", data: { type: "Feature", properties: { label: track.label, notice: track.notice }, geometry: { type: "LineString", coordinates: track.coordinates } } });
            map?.addLayer({ id: layerId, type: "line", source: sourceId, layout: { visibility: "visible", "line-cap": "round", "line-join": "round" }, paint: { "line-color": track.color, "line-width": 4, "line-opacity": 0.9, "line-dasharray": [0.25, 1.15] } });
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
          map.addLayer({ id: "water-route-line", type: "line", source: "water-route", layout: { visibility: "none", "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#228aa1", "line-width": 5, "line-opacity": 0.8 } });
          setMapReady(true);
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
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      map?.remove();
      if (protocolRegistered) removeProtocol("pmtiles");
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
    contextLabels.forEach((label) => {
      const element = document.createElement("div");
      element.className = `map-context-label ${label.kind}`;
      element.textContent = label.name;
      element.setAttribute("aria-hidden", "true");
      markers.current.push(new Marker({ element, anchor: "center" }).setLngLat(label.coordinates).addTo(map));
    });
    activePoints.forEach((point, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `map-story-marker ${activeLayer} ${accuracyClass(point.accuracy)} ${point.contentOrigin === "团队实践" ? "field" : "reference"}`;
      button.style.setProperty("--marker-color", point.color);
      button.setAttribute("aria-label", `打开故事：${point.title}`);
      button.title = `${point.title}｜${point.accuracy}`;
      button.textContent = String(index + 1).padStart(2, "0");
      button.addEventListener("click", () => activationRef.current(point.id));
      markers.current.push(new Marker({ element: button, anchor: "bottom" }).setLngLat(point.coordinates).addTo(map));
    });
    if (map.loaded()) {
      map.setLayoutProperty("practice-route-line", "visibility", activeLayer === "practice" ? "visible" : "none");
      fieldTracks.forEach((track) => {
        const layerId = `field-track-${track.id}-line`;
        if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", activeLayer === "practice" ? "visible" : "none");
      });
      map.setLayoutProperty("water-route-line", "visibility", activeLayer === "water" ? "visible" : "none");
    }
  }, [activeLayer, activePoints, mapReady]);

  return { mapContainer, mapInstance, mapFallback, mapReady, mapProgress };
}
