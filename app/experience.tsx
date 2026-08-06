"use client";

/* Local field media is already resized and is served directly from the private site. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { AttributionControl, Map as MapLibreMap, Marker, NavigationControl, ScaleControl, addProtocol, removeProtocol } from "maplibre-gl";
import { layers, namedFlavor } from "@protomaps/basemaps";
import { FileSource, PMTiles, Protocol } from "pmtiles";
import type { FeatureCollection, LineString } from "geojson";
import {
  herbs,
  media,
  mediaById,
  sourceById,
  sources,
  storyPoints,
  tourChapters,
  waterTimeline,
  type StoryLayer,
} from "./content";

const layerMeta: Record<StoryLayer, { label: string; en: string }> = {
  practice: { label: "实践足迹", en: "Field notes" },
  water: { label: "绿洲水脉", en: "Oasis water" },
  herbs: { label: "药材产业", en: "Herbal resources" },
  people: { label: "人物故事", en: "People" },
};

const mapBounds: [[number, number], [number, number]] = [[102.45, 37.8], [103.75, 39.35]];
const defaultView = { center: [103.16, 38.72] as [number, number], zoom: 9.15, pitch: 38, bearing: -12 };
const localArchivePath = "/maps/minqin-2026.pmtiles";
const localArchiveName = "minqin-2026.pmtiles";
const contextLabels = [
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

const practiceRoute: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: [{ type: "Feature", properties: { note: "叙事路径，非导航路线" }, geometry: { type: "LineString", coordinates: [[102.6378, 37.9283], [102.92, 38.24], [103.0938, 38.6247], [103.59, 38.88]] } }],
};

const waterRoute: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: [{ type: "Feature", properties: { note: "水脉关系示意" }, geometry: { type: "LineString", coordinates: [[103.04, 38.42], [103.0938, 38.6247], [103.29, 38.82], [103.56, 39.12]] } }],
};

function localMapStyle(tileUrl: string) {
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

function accuracyClass(accuracy: string) {
  if (accuracy === "公开知识点") return "knowledge";
  if (accuracy === "县域叙事点") return "county";
  return "approximate";
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function Experience() {
  const [activeLayer, setActiveLayer] = useState<StoryLayer>("practice");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapFallback, setMapFallback] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapProgress, setMapProgress] = useState(4);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [tourMode, setTourMode] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapFrame = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<MapLibreMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const closeButton = useRef<HTMLButtonElement>(null);
  const mapSection = useRef<HTMLElement>(null);
  const tourPanel = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const activePoints = useMemo(() => storyPoints.filter((point) => point.layer === activeLayer), [activeLayer]);
  const selected = storyPoints.find((point) => point.id === selectedId) ?? null;
  const selectedMedia = selected?.mediaIds.map((id) => mediaById.get(id)).filter(Boolean) ?? [];
  const selectedSources = selected?.sourceIds.map((id) => sourceById.get(id)).filter(Boolean) ?? [];
  const chapter = tourChapters[tourIndex];
  const chapterMedia = mediaById.get(chapter.leadMediaId);
  const fieldDates = new Set(storyPoints.filter((point) => point.contentOrigin === "团队实践").map((point) => point.date));
  const visitedPoints = storyPoints.filter((point) => point.contentOrigin === "团队实践").length;
  const publicPoints = storyPoints.filter((point) => point.contentOrigin === "公开资料").length;
  const featuredMediaCount = media.filter((asset) => asset.featured).length;
  const mediaDays = [
    { key: "2026-08-03", label: "8月3日", title: "进入民勤 · 荒漠观察" },
    { key: "2026-08-04", label: "8月4日", title: "公益林养护 · 青年记录" },
  ];

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
            if (value) { chunks.push(value); received += value.length; setMapProgress(total ? Math.min(92, Math.round((received / total) * 92)) : Math.min(92, 15 + chunks.length * 8)); }
          }
          archiveBlob = new Blob(chunks as BlobPart[], { type: "application/octet-stream" });
        } else {
          archiveBlob = await response.blob();
        }
        if (archiveBlob.size < 1024) throw new Error("PMTiles archive is incomplete");
        const archiveFile = new File([archiveBlob], localArchiveName, { type: "application/octet-stream" });
        const archive = new PMTiles(new FileSource(archiveFile));
        await archive.getHeader();
        if (disposed || !mapContainer.current) return;
        protocol.add(archive);
        addProtocol("pmtiles", protocol.tile);
        protocolRegistered = true;
        map = new MapLibreMap({
          container: mapContainer.current,
          style: localMapStyle(localArchiveName),
          ...defaultView,
          attributionControl: false,
          minZoom: 7.2,
          maxZoom: 13,
          maxPitch: 68,
          maxBounds: mapBounds,
        });
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
      button.addEventListener("click", () => setSelectedId(point.id));
      markers.current.push(new Marker({ element: button, anchor: "bottom" }).setLngLat(point.coordinates).addTo(map));
    });
    if (map.loaded()) {
      map.setLayoutProperty("practice-route-line", "visibility", activeLayer === "practice" ? "visible" : "none");
      map.setLayoutProperty("water-route-line", "visibility", activeLayer === "water" ? "visible" : "none");
    }
  }, [activeLayer, activePoints, mapReady]);

  useEffect(() => {
    if (!selected) return;
    previousFocus.current = document.activeElement as HTMLElement;
    closeButton.current?.focus();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    mapInstance.current?.easeTo({ center: selected.coordinates, zoom: selected.layer === "water" ? 8.6 : 9.3, duration: reduced ? 0 : 800, offset: window.innerWidth < 680 ? [0, -120] : [-150, 0] });
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") closeStory(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  useEffect(() => {
    if (!tourMode) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      mapInstance.current?.resize();
      mapInstance.current?.easeTo({ ...chapter.mapView, duration: reduced ? 0 : 850 });
      tourPanel.current?.focus();
    }, 80);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goToChapter(tourIndex + 1);
      if (event.key === "ArrowLeft") goToChapter(tourIndex - 1);
      if (event.key === "Escape") endTour();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { window.clearTimeout(timer); window.removeEventListener("keydown", onKeyDown); };
  }, [chapter, tourIndex, tourMode]);

  function closeStory() {
    setSelectedId(null);
    window.setTimeout(() => (previousFocus.current ?? mapSection.current)?.focus(), 0);
  }

  function enterMap() {
    mapSection.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function startTour() {
    previousFocus.current = document.activeElement as HTMLElement;
    setTourIndex(0);
    setActiveLayer(tourChapters[0].layer);
    setSelectedId(null);
    setTourMode(true);
  }

  function goToChapter(nextIndex: number) {
    const safeIndex = Math.max(0, Math.min(tourChapters.length - 1, nextIndex));
    setTourIndex(safeIndex);
    setActiveLayer(tourChapters[safeIndex].layer);
    setSelectedId(null);
  }

  function endTour() {
    setTourMode(false);
    window.setTimeout(() => { mapInstance.current?.resize(); previousFocus.current?.focus(); }, 90);
  }

  function resetMap() {
    mapInstance.current?.easeTo({ ...defaultView, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700 });
  }

  async function toggleFullscreen() {
    if (!mapFrame.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await mapFrame.current.requestFullscreen();
    window.setTimeout(() => mapInstance.current?.resize(), 100);
  }

  return (
    <main className={tourMode ? "tour-mode" : ""}>
      <header className="site-nav" aria-label="主导航">
        <a className="brand" href="#top" aria-label="返回首页"><span className="brand-mark">绿</span><span><strong>绿洲药韵</strong><small>MINQIN FIELD ATLAS</small></span></a>
        <nav><a href="#dossier">项目档案</a><a href="#map">数字地图</a><a href="#field-media">实践影像</a><a href="#sources">资料来源</a></nav>
        <span className="nav-date">首期正式成果 · 2026</span>
      </header>

      <section className="hero" id="top">
        <img className="hero-image" src="/media/banner-team.webp" alt="实践团在民勤荒漠中举起队旗" />
        <div className="hero-wash" /><div className="weather-grid" aria-hidden="true" />
        <div className="hero-kicker"><span>河西走廊 · 石羊河下游</span><span>首期正式成果 / 2026.08.07</span></div>
        <div className="hero-content">
          <p className="super-title">守护河西绿洲</p>
          <h1>在沙与水之间，<br />读懂一座绿洲。</h1>
          <p className="hero-lead">民勤生态治理背景下中医药资源利用与“一带一路”绿色传播实践</p>
          <div className="hero-actions">
            <button className="primary-action" onClick={startTour}>开始5分钟导览 <span>→</span></button>
            <button className="secondary-action" onClick={enterMap}>自由探索地图</button>
            <span className="team-label">北京中医药大学生命科学学院<br />绿洲药韵·丝路智传实践团</span>
          </div>
        </div>
        <div className="hero-readout" aria-label="项目数据概览">
          <div><strong>{String(fieldDates.size).padStart(2, "0")}</strong><span>实践日<br />FIELD DAYS</span></div>
          <div><strong>{String(visitedPoints).padStart(2, "0")}</strong><span>团队足迹<br />FIELD POINTS</span></div>
          <div><strong>{String(media.length).padStart(2, "0")}</strong><span>影像素材<br />MEDIA ASSETS</span></div>
        </div>
      </section>

      <section className="dossier" id="dossier" aria-labelledby="dossier-title">
        <div className="section-index">00 / 项目档案</div>
        <div className="dossier-heading"><p className="eyebrow">PROJECT DOSSIER</p><h2 id="dossier-title">一份可追溯、<br />可继续生长的数字成果。</h2></div>
        <div className="dossier-card">
          <dl>
            <div><dt>项目</dt><dd>民勤生态治理背景下中医药资源利用与“一带一路”绿色传播实践</dd></div>
            <div><dt>团队</dt><dd>北京中医药大学生命科学学院<br />绿洲药韵·丝路智传实践团</dd></div>
            <div><dt>实践时间</dt><dd>2026年8月3—4日（首期素材）</dd></div>
            <div><dt>方法</dt><dd>实地观察、劳动记录、影像采集、公开资料核验与数字地图叙事</dd></div>
          </dl>
          <div className="dossier-stats">
            <article><strong>{visitedPoints}</strong><span>团队实践点</span></article>
            <article><strong>{publicPoints}</strong><span>公开知识点</span></article>
            <article><strong>{featuredMediaCount}</strong><span>导览精选影像</span></article>
            <article><strong>{sources.length}</strong><span>公开资料来源</span></article>
          </div>
          <p className="boundary-note"><b>内容边界</b> 团队到访与公开知识点分开统计；无GPS位置只到县域或村级；未鉴定植物不擅自命名；医学内容只作资源、生态与产业介绍。</p>
        </div>
      </section>

      <section className="hexi-intro" aria-labelledby="hexi-title">
        <div className="section-index">01 / 河西入境</div>
        <div><p className="eyebrow">FROM SILK ROAD TO GREEN CORRIDOR</p><h2 id="hexi-title">古丝路打开通道，<br />今天的青年续写绿色通道。</h2></div>
        <div className="hexi-copy">
          <p>公元前139年，张骞出使西域；河西走廊随后成为连接东西方文明的重要通道。凉州，即今天的武威，是走廊东端的重要城市。</p>
          <p className="note"><span>说明</span>这是文化背景，不等同于本次实践行程。地图虚线统一标记为“叙事路径，非导航路线”。</p>
          <a href={sourceById.get("hexi-history")?.url} target="_blank" rel="noreferrer">阅读历史资料 ↗</a>
        </div>
      </section>

      <section className="map-section" id="map" ref={mapSection} tabIndex={-1} aria-labelledby="map-title">
        <div className="map-header">
          <div><div className="section-index light">02 / 数字地图</div><p className="eyebrow light">A LIVING ATLAS OF MINQIN</p><h2 id="map-title">选择一层，进入民勤。</h2></div>
          <p>底图来自网站自带的民勤区域 PMTiles。团队实践、公开资料与项目计划分别标记；任何近似点位都不作为导航坐标。</p>
        </div>
        <div className="layer-tabs" role="tablist" aria-label="地图图层">
          {(Object.keys(layerMeta) as StoryLayer[]).map((key) => {
            const count = storyPoints.filter((point) => point.layer === key).length;
            return <button key={key} role="tab" aria-selected={activeLayer === key} className={activeLayer === key ? "active" : ""} onClick={() => { setActiveLayer(key); setSelectedId(null); }}><span>{layerMeta[key].label}<small>{layerMeta[key].en}</small></span><b>{count} POINTS</b></button>;
          })}
        </div>
        <div className="map-frame" ref={mapFrame}>
          <div className="map-corner map-corner-top">MINQIN / LOCAL PMTILES</div>
          <div className="map-corner map-corner-bottom">拖动 · 缩放 · 倾斜 · 点击点位</div>
          <div className="map-data-badge">本地离线底图 · OSM 2026.08.05</div>
          {!mapReady && !mapFallback && <div className="map-loading" role="status"><span>正在加载民勤离线地图</span><div><i style={{ width: `${mapProgress}%` }} /></div><b>{mapProgress}%</b></div>}
          <div ref={mapContainer} className={`map-canvas ${mapFallback ? "is-hidden" : ""}`} aria-label="民勤互动地图" />
          {mapFallback && (
            <div className="fallback-map" role="img" aria-label="底图文件失败时的民勤示意沙盘">
              <div className="fallback-sand sand-a" /><div className="fallback-sand sand-b" /><div className="fallback-oasis">民勤故事仍可浏览</div><div className="fallback-water">石羊河水脉</div>
              {activePoints.slice(0, 3).map((point, index) => <button key={point.id} className={`fallback-node node-${index + 1}`} onClick={() => setSelectedId(point.id)}><span>{String(index + 1).padStart(2, "0")}</span>{point.title}</button>)}
              <p>地图文件未能读取，已切换为本地示意沙盘；文字、影像和资料来源不受影响。</p>
            </div>
          )}
          <div className="map-tools" aria-label="地图辅助操作"><button onClick={resetMap}>重置视角</button><button onClick={toggleFullscreen}>全屏地图</button></div>
          <div className="map-legend" aria-label="地图图例">
            <strong>图例与定位精度</strong><span><i className="legend-field" />团队实践</span><span><i className="legend-reference" />公开资料</span><span><i className="legend-approx" />县域 / 村级近似</span><small>虚线：叙事路径，非导航路线</small>
          </div>
          <div className="point-list" aria-label="当前图层全部点位">
            {activePoints.map((point, index) => <button key={point.id} onClick={() => setSelectedId(point.id)} className={selectedId === point.id ? "selected" : ""}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{point.title}</strong><small>{point.contentOrigin} · {point.accuracy}</small></div></button>)}
          </div>
          <aside className={`story-drawer ${selected ? "open" : ""}`} aria-hidden={!selected} aria-label="地图故事卡">
            {selected && <><button ref={closeButton} className="drawer-close" onClick={closeStory} aria-label="关闭故事卡">×</button><div className="drawer-scroll">
              <p className="eyebrow">{selected.eyebrow}</p><h3>{selected.title}</h3>
              <div className="story-meta"><span className={accuracyClass(selected.accuracy)}>{selected.accuracy}</span><span className="origin">{selected.contentOrigin}</span><time>{selected.date}</time></div>
              <p className="evidence-line"><b>{selected.evidenceStatus}</b>{selected.locationNote}</p>
              <p className="story-summary">{selected.summary}</p><p className="story-summary-en">{selected.summaryEn}</p>
              {selectedMedia.length > 0 && <div className="story-media">{selectedMedia.map((asset) => asset && <figure key={asset.id}>{asset.type === "image" ? <img src={asset.src} alt={asset.alt} loading="lazy" /> : <video src={asset.src} poster={asset.poster} controls preload="metadata" aria-label={asset.alt}><track kind="captions" src="/media/ambient-zh.vtt" srcLang="zh" label="中文说明" default /></video>}<figcaption><span>{asset.capturedAt}</span>{asset.caption}</figcaption></figure>)}</div>}
              {selectedSources.length > 0 && <div className="drawer-sources"><span>资料来源</span>{selectedSources.map((source) => source && <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.publisher} · {source.title} ↗</a>)}</div>}
            </div></>}
          </aside>
        </div>
      </section>

      <section className="field-media" id="field-media" aria-labelledby="media-title">
        <div className="section-index">03 / 实践影像</div>
        <div className="media-heading"><div><p className="eyebrow">TWO DAYS IN THE FIELD</p><h2 id="media-title">两天，不止两组照片。</h2></div><p>精选影像先呈现完整叙事，视频均由用户点击后播放，不自动播放。展开后可查看首期全部20项素材。</p></div>
        <div className="media-days">
          {mediaDays.map((day) => {
            const assets = media.filter((asset) => asset.capturedAt.startsWith(day.key) && (showAllMedia || asset.featured));
            return <article key={day.key} className="media-day"><div className="media-day-title"><strong>{day.label}</strong><span>{day.title}</span></div><div className="media-grid">{assets.map((asset) => <figure key={asset.id}>{asset.type === "image" ? <img src={asset.src} alt={asset.alt} loading="lazy" /> : <video src={asset.src} poster={asset.poster} controls preload="none" aria-label={asset.alt}><track kind="captions" src="/media/ambient-zh.vtt" srcLang="zh" label="中文说明" default /></video>}<figcaption><time>{asset.capturedAt.slice(11)}</time><p>{asset.caption}</p>{asset.featured && <b>导览精选</b>}</figcaption></figure>)}</div></article>;
          })}
        </div>
        <button className="gallery-toggle" onClick={() => setShowAllMedia((value) => !value)} aria-expanded={showAllMedia}>{showAllMedia ? "收起完整素材" : `查看全部 ${media.length} 项素材`}</button>
      </section>

      <section className="water-story" id="water-story" aria-labelledby="water-title">
        <div className="section-index">04 / 绿洲水脉</div>
        <div className="water-title-block"><p className="eyebrow">WATER WRITES THE OASIS</p><h2 id="water-title">青土湖，记录一座绿洲的呼吸。</h2><p>这不是“实时增长曲线”，而是公开资料中的四个历史切片。每一个数字都保留对应年份与来源。</p></div>
        <div className="timeline">{waterTimeline.map((item, index) => <article key={item.year}><div className="timeline-year"><span>{index + 1}</span><strong>{item.year}</strong></div><h3>{item.title}</h3><p>{item.note}</p><a href={sourceById.get(item.sourceId)?.url} target="_blank" rel="noreferrer">查看来源 ↗</a></article>)}</div>
      </section>

      <section className="herb-story" id="herb-story" aria-labelledby="herb-title">
        <div className="herb-heading"><div className="section-index light">05 / 药材产业</div><p className="eyebrow light">FROM DESERT RESOURCE TO RESPONSIBLE STORY</p><h2 id="herb-title">认识资源，<br />不夸大功效。</h2><p>证据标签区分公开可核信息与项目计划关注。首期不把计划设想写成已经完成的走访成果。</p></div>
        <div className="herb-grid">{herbs.map((herb, index) => <article key={herb.id}><div className="herb-number">0{index + 1}</div><span className={`herb-evidence ${herb.evidenceLabel === "项目计划关注" ? "planned" : "verified"}`}>{herb.evidenceLabel}</span><span className="herb-tag">{herb.tag}</span><h3>{herb.name}</h3><em>{herb.latinLabel}</em><p>{herb.description}</p><small>{herb.descriptionEn}</small>{herb.sourceIds.map((id) => { const source = sourceById.get(id); return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer">资料 ↗</a> : null; })}</article>)}</div>
        <div className="chain" aria-label="药材产业链示意">{[["种植", "CULTIVATION"], ["采收", "HARVEST"], ["初加工", "PRIMARY PROCESSING"], ["产品", "PRODUCT"], ["传播与市场", "COMMUNICATION"]].map(([zh, en], index) => <div key={zh}><span>{String(index + 1).padStart(2, "0")}</span><strong>{zh}</strong><small>{en}</small></div>)}</div>
      </section>

      <section className="closing-story" aria-labelledby="closing-title">
        <img src="/media/volunteer-signs.webp" alt="公益林基地里志愿者留下的手绘牌" loading="lazy" />
        <div className="closing-copy"><div className="section-index light">06 / 青年守护</div><p className="eyebrow light">ONE TREE, MANY HANDS</p><h2 id="closing-title">地图上的一个点，<br />是现实中的一段长期维护。</h2><p>种下一棵树只是开始。补水、养护、记录与传播，才让一次社会实践进入更长的时间尺度。</p><blockquote>我们记录的不是一个完成式，而是一座绿洲仍在继续的故事。</blockquote><span>— 实践地图编辑说明（非采访引语）</span><button className="closing-tour" onClick={startTour}>以5分钟导览重看全篇 →</button></div>
      </section>

      <footer id="sources">
        <div className="footer-brand"><span className="brand-mark">绿</span><div><strong>民勤中医药生态文化数字地图</strong><small>首期正式成果 · 绿洲药韵·丝路智传实践团</small></div></div>
        <div className="footer-sources"><h2>资料来源</h2>{sources.map((source, index) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span>{String(index + 1).padStart(2, "0")}</span><div>{source.title}<small>{source.publisher} · {source.publishedAt}</small></div><b>↗</b></a>)}</div>
        <div className="method-note"><strong>资料与方法说明</strong><p>团队照片与视频摄于2026年8月3—4日；公开资料用于历史、生态、科研、人物与产业背景。公开知识点不计入团队到访，近似坐标不作导航用途。网站底图为本地 PMTiles，底图失败时文字与影像仍可浏览。</p></div>
        <div className="footer-note"><p>隐私与医学边界：不展示手机号、学号、邮箱；不使用未经证实采访引语；不作药物疗效宣传。</p><p>版本：首期正式成果 · 更新于 2026.08.07</p></div>
      </footer>

      {tourMode && <aside className="tour-panel" ref={tourPanel} tabIndex={-1} aria-label="五章导览" aria-live="polite">
        <div className="tour-top"><span>5 MIN GUIDED TOUR</span><button onClick={endTour} aria-label="退出导览">退出 ×</button></div>
        <div className="tour-progress" aria-label={`第${tourIndex + 1}章，共${tourChapters.length}章`}>{tourChapters.map((item, index) => <button key={item.id} className={index === tourIndex ? "active" : ""} onClick={() => goToChapter(index)} aria-label={`跳至第${index + 1}章 ${item.title}`}><i /></button>)}</div>
        {chapterMedia && <figure className="tour-media">{chapterMedia.type === "image" ? <img src={chapterMedia.src} alt={chapterMedia.alt} /> : <img src={chapterMedia.poster} alt={chapterMedia.alt} />}<figcaption>{chapterMedia.caption}</figcaption></figure>}
        <div className="tour-copy"><p>{String(chapter.order).padStart(2, "0")} / {tourChapters.length} · 建议 {formatDuration(chapter.durationSeconds)}</p><span>{chapter.eyebrow}</span><h2>{chapter.title}</h2><p>{chapter.narration}</p><small>关联点位：{chapter.pointIds.map((id) => storyPoints.find((point) => point.id === id)?.title).filter(Boolean).join(" / ")}</small></div>
        <div className="tour-controls"><button onClick={() => goToChapter(tourIndex - 1)} disabled={tourIndex === 0}>← 上一章</button><span>键盘 ← → 切换 · Esc 退出</span>{tourIndex < tourChapters.length - 1 ? <button onClick={() => goToChapter(tourIndex + 1)}>下一章 →</button> : <button onClick={endTour}>完成导览 ✓</button>}</div>
      </aside>}
    </main>
  );
}
