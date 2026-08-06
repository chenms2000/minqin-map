"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AttributionControl, Map as MapLibreMap, Marker, NavigationControl } from "maplibre-gl";
import type { FeatureCollection, LineString, Polygon } from "geojson";
import {
  herbs,
  mediaById,
  sourceById,
  sources,
  storyPoints,
  waterTimeline,
  type StoryLayer,
} from "./content";

const layerMeta: Record<StoryLayer, { label: string; en: string; count: string }> = {
  practice: { label: "实践足迹", en: "Field notes", count: "2 DAYS" },
  water: { label: "绿洲水脉", en: "Oasis water", count: "4 ERAS" },
  herbs: { label: "药材产业", en: "Herbal resources", count: "4 HERBS" },
  people: { label: "人物故事", en: "People", count: "1 STORY" },
};

const practiceRoute: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [102.6378, 37.9283],
          [102.92, 38.24],
          [103.0938, 38.6247],
          [103.23, 38.835],
        ],
      },
    },
  ],
};

const waterRoute: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [103.04, 38.42],
          [103.0938, 38.6247],
          [103.29, 38.82],
          [103.56, 39.12],
        ],
      },
    },
  ],
};

const oasisShape: FeatureCollection<Polygon> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [[
          [102.89, 38.36],
          [103.18, 38.34],
          [103.41, 38.62],
          [103.49, 38.96],
          [103.34, 39.08],
          [103.06, 38.92],
          [102.91, 38.68],
          [102.89, 38.36],
        ]],
      },
    },
  ],
};

function accuracyClass(accuracy: string) {
  return accuracy === "公开知识点" ? "knowledge" : accuracy === "县域叙事点" ? "county" : "approximate";
}

export function Experience() {
  const [activeLayer, setActiveLayer] = useState<StoryLayer>("practice");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapFallback, setMapFallback] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<MapLibreMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const closeButton = useRef<HTMLButtonElement>(null);
  const mapSection = useRef<HTMLElement>(null);

  const activePoints = useMemo(
    () => storyPoints.filter((point) => point.layer === activeLayer),
    [activeLayer],
  );
  const selected = storyPoints.find((point) => point.id === selectedId) ?? null;
  const selectedMedia = selected?.mediaIds.map((id) => mediaById.get(id)).filter(Boolean) ?? [];
  const selectedSources = selected?.sourceIds.map((id) => sourceById.get(id)).filter(Boolean) ?? [];

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    let loaded = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!loaded) setMapFallback(true);
    }, 9000);

    const map = new MapLibreMap({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [103.16, 38.72],
      zoom: 8.15,
      pitch: 52,
      bearing: -18,
      attributionControl: false,
      maxPitch: 68,
    });
    mapInstance.current = map;
    map.addControl(new NavigationControl({ visualizePitch: true }), "bottom-right");
    map.addControl(new AttributionControl({ compact: true }), "bottom-left");

    map.once("load", () => {
      loaded = true;
      window.clearTimeout(fallbackTimer);
      setMapFallback(false);

      map.addSource("oasis", { type: "geojson", data: oasisShape });
      map.addLayer({
        id: "oasis-fill",
        type: "fill",
        source: "oasis",
        paint: { "fill-color": "#83a64b", "fill-opacity": 0.16 },
      });
      map.addLayer({
        id: "oasis-outline",
        type: "line",
        source: "oasis",
        paint: { "line-color": "#517942", "line-width": 2, "line-opacity": 0.48 },
      });
      map.addSource("practice-route", { type: "geojson", data: practiceRoute });
      map.addLayer({
        id: "practice-route-line",
        type: "line",
        source: "practice-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#d95c3d", "line-width": 4, "line-opacity": 0.82, "line-dasharray": [1, 1.5] },
      });
      map.addSource("water-route", { type: "geojson", data: waterRoute });
      map.addLayer({
        id: "water-route-line",
        type: "line",
        source: "water-route",
        layout: { visibility: "none", "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#228aa1", "line-width": 5, "line-opacity": 0.8 },
      });
    });

    map.on("error", (event) => {
      if (!loaded && String(event.error).toLowerCase().includes("style")) setMapFallback(true);
    });

    return () => {
      window.clearTimeout(fallbackTimer);
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    activePoints.forEach((point, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `map-story-marker ${activeLayer}`;
      button.style.setProperty("--marker-color", point.color);
      button.setAttribute("aria-label", `打开故事：${point.title}`);
      button.title = point.title;
      button.textContent = String(index + 1).padStart(2, "0");
      button.addEventListener("click", () => setSelectedId(point.id));
      markers.current.push(new Marker({ element: button, anchor: "bottom" }).setLngLat(point.coordinates).addTo(map));
    });

    if (map.loaded()) {
      map.setLayoutProperty("practice-route-line", "visibility", activeLayer === "practice" ? "visible" : "none");
      map.setLayoutProperty("water-route-line", "visibility", activeLayer === "water" ? "visible" : "none");
    }
  }, [activeLayer, activePoints]);

  useEffect(() => {
    if (!selected) return;
    closeButton.current?.focus();
    const map = mapInstance.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map?.easeTo({ center: selected.coordinates, zoom: selected.layer === "water" ? 8.5 : 9.2, duration: reduced ? 0 : 900, offset: [-140, 0] });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeStory();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  function closeStory() {
    setSelectedId(null);
    window.setTimeout(() => mapSection.current?.focus(), 0);
  }

  function enterMap() {
    mapSection.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  return (
    <main>
      <header className="site-nav" aria-label="主导航">
        <a className="brand" href="#top" aria-label="返回首页">
          <span className="brand-mark">绿</span>
          <span><strong>绿洲药韵</strong><small>MINQIN FIELD ATLAS</small></span>
        </a>
        <nav>
          <a href="#map">数字地图</a>
          <a href="#water-story">绿洲水脉</a>
          <a href="#herb-story">药材产业</a>
          <a href="#sources">资料来源</a>
        </nav>
        <span className="nav-date">2026 · 甘肃民勤</span>
      </header>

      <section className="hero" id="top">
        <img className="hero-image" src="/media/banner-team.webp" alt="实践团在民勤荒漠中举起队旗" />
        <div className="hero-wash" />
        <div className="weather-grid" aria-hidden="true" />
        <div className="hero-kicker"><span>河西走廊 · 石羊河下游</span><span>38.6°N / 103.1°E</span></div>
        <div className="hero-content">
          <p className="super-title">守护河西绿洲</p>
          <h1>在沙与水之间，<br />读懂一座绿洲。</h1>
          <p className="hero-lead">民勤生态治理背景下中医药资源利用与“一带一路”绿色传播实践</p>
          <div className="hero-actions">
            <button className="primary-action" onClick={enterMap}>进入数字地图 <span>↘</span></button>
            <span className="team-label">北京中医药大学生命科学学院<br />绿洲药韵·丝路智传实践团</span>
          </div>
        </div>
        <div className="hero-readout" aria-label="项目数据概览">
          <div><strong>02</strong><span>实践日<br />FIELD DAYS</span></div>
          <div><strong>04</strong><span>主题层<br />STORY LAYERS</span></div>
          <div><strong>20</strong><span>精选影像<br />CURATED MEDIA</span></div>
        </div>
      </section>

      <section className="hexi-intro" aria-labelledby="hexi-title">
        <div className="section-index">01 / 河西入境</div>
        <div>
          <p className="eyebrow">FROM SILK ROAD TO GREEN CORRIDOR</p>
          <h2 id="hexi-title">古丝路打开通道，<br />今天的青年续写绿色通道。</h2>
        </div>
        <div className="hexi-copy">
          <p>公元前139年，张骞出使西域；河西走廊随后成为连接东西方文明的重要通道。凉州，即今天的武威，是这条走廊东端的重要城市。</p>
          <p className="note"><span>说明</span>这段历史是项目的文化背景，不等同于本次实践行程。地图中的虚线也只承担叙事表达，不用于导航。</p>
          <a href={sources[0].url} target="_blank" rel="noreferrer">阅读历史资料 ↗</a>
        </div>
      </section>

      <section className="map-section" id="map" ref={mapSection} tabIndex={-1} aria-labelledby="map-title">
        <div className="map-header">
          <div>
            <div className="section-index light">02 / 数字地图</div>
            <p className="eyebrow light">A LIVING ATLAS OF MINQIN</p>
            <h2 id="map-title">选择一层，进入民勤。</h2>
          </div>
          <p>地图将团队实拍与公开知识分层呈现。虚线点位表示县域或村级近似定位，圆环点位表示公开知识节点。</p>
        </div>

        <div className="layer-tabs" role="tablist" aria-label="地图图层">
          {(Object.keys(layerMeta) as StoryLayer[]).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeLayer === key}
              className={activeLayer === key ? "active" : ""}
              onClick={() => { setActiveLayer(key); setSelectedId(null); }}
            >
              <span>{layerMeta[key].label}<small>{layerMeta[key].en}</small></span>
              <b>{layerMeta[key].count}</b>
            </button>
          ))}
        </div>

        <div className="map-frame">
          <div className="map-corner map-corner-top">MINQIN / 2026</div>
          <div className="map-corner map-corner-bottom">拖动 · 缩放 · 倾斜 · 点击点位</div>
          <div ref={mapContainer} className={`map-canvas ${mapFallback ? "is-hidden" : ""}`} aria-label="民勤互动地图" />
          {mapFallback && (
            <div className="fallback-map" role="img" aria-label="底图离线时的民勤示意沙盘">
              <div className="fallback-sand sand-a" /><div className="fallback-sand sand-b" />
              <div className="fallback-oasis">民勤绿洲</div>
              <div className="fallback-water">石羊河水脉</div>
              {activePoints.map((point, index) => (
                <button key={point.id} className={`fallback-node node-${index + 1}`} onClick={() => setSelectedId(point.id)}>
                  <span>{String(index + 1).padStart(2, "0")}</span>{point.title}
                </button>
              ))}
              <p>在线底图暂不可用，已切换为本地示意沙盘；所有故事内容仍可访问。</p>
            </div>
          )}
          <div className="point-list" aria-label="当前图层点位">
            {activePoints.map((point, index) => (
              <button key={point.id} onClick={() => setSelectedId(point.id)} className={selectedId === point.id ? "selected" : ""}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{point.title}</strong><small>{point.accuracy} · {point.date}</small></div>
              </button>
            ))}
          </div>

          <aside className={`story-drawer ${selected ? "open" : ""}`} aria-hidden={!selected} aria-label="地图故事卡">
            {selected && (
              <>
                <button ref={closeButton} className="drawer-close" onClick={closeStory} aria-label="关闭故事卡">×</button>
                <div className="drawer-scroll">
                  <p className="eyebrow">{selected.eyebrow}</p>
                  <h3>{selected.title}</h3>
                  <div className="story-meta"><span className={accuracyClass(selected.accuracy)}>{selected.accuracy}</span><time>{selected.date}</time></div>
                  <p className="story-summary">{selected.summary}</p>
                  <p className="story-summary-en">{selected.summaryEn}</p>
                  {selectedMedia.length > 0 && (
                    <div className="story-media">
                      {selectedMedia.map((asset) => asset && (
                        <figure key={asset.id}>
                          {asset.type === "image" ? (
                            <img src={asset.src} alt={asset.alt} loading="lazy" />
                          ) : (
                            <video src={asset.src} poster={asset.poster} controls preload="metadata" aria-label={asset.alt} />
                          )}
                          <figcaption><span>{asset.capturedAt}</span>{asset.caption}</figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                  {selectedSources.length > 0 && (
                    <div className="drawer-sources">
                      <span>资料来源</span>
                      {selectedSources.map((source) => source && <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.publisher} · {source.title} ↗</a>)}
                    </div>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      </section>

      <section className="water-story" id="water-story" aria-labelledby="water-title">
        <div className="section-index">03 / 绿洲水脉</div>
        <div className="water-title-block">
          <p className="eyebrow">WATER WRITES THE OASIS</p>
          <h2 id="water-title">青土湖，记录一座绿洲的呼吸。</h2>
          <p>每一个数字都标注年份。这里不是一条“实时增长曲线”，而是四个公开资料中的历史切片。</p>
        </div>
        <div className="timeline">
          {waterTimeline.map((item, index) => (
            <article key={item.year}>
              <div className="timeline-year"><span>{index + 1}</span><strong>{item.year}</strong></div>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
        <a className="source-link" href={sources[1].url} target="_blank" rel="noreferrer">国家林业和草原局资料 ↗</a>
      </section>

      <section className="herb-story" id="herb-story" aria-labelledby="herb-title">
        <div className="herb-heading">
          <div className="section-index light">04 / 药材产业</div>
          <p className="eyebrow light">FROM DESERT RESOURCE TO RESPONSIBLE STORY</p>
          <h2 id="herb-title">认识资源，<br />不夸大功效。</h2>
          <p>四类药材来自项目申报材料的调研范围。首版展示生态、种植和产业链框架，不提供个人用药建议。</p>
        </div>
        <div className="herb-grid">
          {herbs.map((herb, index) => (
            <article key={herb.id}>
              <div className="herb-number">0{index + 1}</div>
              <span className="herb-tag">{herb.tag}</span>
              <h3>{herb.name}</h3>
              <em>{herb.latinLabel}</em>
              <p>{herb.description}</p>
              <small>{herb.descriptionEn}</small>
            </article>
          ))}
        </div>
        <div className="chain" aria-label="药材产业链示意">
          {[
            ["种植", "CULTIVATION"], ["采收", "HARVEST"], ["初加工", "PRIMARY PROCESSING"], ["产品", "PRODUCT"], ["传播与市场", "COMMUNICATION"],
          ].map(([zh, en], index) => <div key={zh}><span>{String(index + 1).padStart(2, "0")}</span><strong>{zh}</strong><small>{en}</small></div>)}
        </div>
      </section>

      <section className="closing-story" aria-labelledby="closing-title">
        <img src="/media/volunteer-signs.webp" alt="公益林基地里志愿者留下的手绘牌" loading="lazy" />
        <div className="closing-copy">
          <div className="section-index light">05 / 久久为功</div>
          <p className="eyebrow light">ONE TREE, MANY HANDS</p>
          <h2 id="closing-title">地图上的一个点，<br />是现实中的一段长期维护。</h2>
          <p>种下一棵树只是开始。补水、养护、记录与传播，才让一次社会实践进入更长的时间尺度。</p>
          <blockquote>“我们记录的不是一个完成式，而是一座绿洲仍在继续的故事。”</blockquote>
          <span>— 实践地图编辑说明（非采访引语）</span>
        </div>
      </section>

      <footer id="sources">
        <div className="footer-brand"><span className="brand-mark">绿</span><div><strong>民勤中医药生态文化数字地图</strong><small>绿洲药韵·丝路智传实践团</small></div></div>
        <div className="footer-sources">
          <h2>资料来源</h2>
          {sources.map((source, index) => (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span>0{index + 1}</span><div>{source.title}<small>{source.publisher} · {source.publishedAt}</small></div><b>↗</b></a>
          ))}
        </div>
        <div className="footer-note">
          <p>团队照片与视频摄于2026年8月3—4日。未附GPS的现场点位均明确标注定位精度；医学内容仅作文化与资源介绍。</p>
          <p>北京中医药大学生命科学学院 · 2026暑期社会实践</p>
        </div>
      </footer>
    </main>
  );
}
