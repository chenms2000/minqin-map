"use client";

/* eslint-disable @next/next/no-img-element */

import type { RefObject } from "react";
import { storyPoints, tourChapters, type MediaAsset, type SourceRef, type StoryLayer, type StoryPoint, type TourChapter } from "@/content";
import { layerMeta } from "@/app/lib/map-config";
import { accuracyClass } from "@/app/lib/formatters";

type InteractiveMapProps = {
  sectionRef: RefObject<HTMLElement | null>;
  frameRef: RefObject<HTMLDivElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  activeLayer: StoryLayer;
  activePoints: StoryPoint[];
  selected: StoryPoint | null;
  selectedMedia: MediaAsset[];
  selectedSources: SourceRef[];
  mapReady: boolean;
  mapFallback: boolean;
  mapProgress: number;
  storyMode: boolean;
  storyChapter: TourChapter;
  onLayerChange: (layer: StoryLayer) => void;
  onPointActivate: (pointId: string) => void;
  onCloseStory: () => void;
  onResetMap: () => void;
  onToggleFullscreen: () => void;
};

export function InteractiveMap({ sectionRef, frameRef, containerRef, closeButtonRef, activeLayer, activePoints, selected, selectedMedia, selectedSources, mapReady, mapFallback, mapProgress, storyMode, storyChapter, onLayerChange, onPointActivate, onCloseStory, onResetMap, onToggleFullscreen }: InteractiveMapProps) {
  return <section className={`map-section ${storyMode ? "is-story-stage" : ""}`} id="map" ref={sectionRef} tabIndex={-1} aria-labelledby="map-title">
    <div className="map-header">
      <div><div className="section-index light">02 / 数字地图</div><p className="eyebrow light">A LIVING ATLAS OF MINQIN</p><h2 id="map-title">选择一层，进入民勤。</h2></div>
      <p>底图来自网站自带的民勤区域 PMTiles。团队实践、公开资料与项目计划分别标记；任何近似点位都不作为导航坐标。</p>
    </div>
    <div className="layer-tabs" role="tablist" aria-label="地图图层">
      {(Object.keys(layerMeta) as StoryLayer[]).map((key) => <button key={key} role="tab" aria-selected={activeLayer === key} className={activeLayer === key ? "active" : ""} onClick={() => onLayerChange(key)}><span>{layerMeta[key].label}<small>{layerMeta[key].en}</small></span><b>{activePointsForLayer(key)} POINTS</b></button>)}
    </div>
    <div className="map-frame" ref={frameRef}>
      {storyMode && <div className="story-map-status" aria-live="polite"><span>STORY {String(storyChapter.order).padStart(2, "0")} / {String(tourChapters.length).padStart(2, "0")}</span><strong>{storyChapter.title}</strong><small>{storyChapter.eyebrow}</small></div>}
      <div className="map-corner map-corner-top">MINQIN / LOCAL PMTILES</div>
      <div className="map-corner map-corner-bottom">拖动 · 缩放 · 倾斜 · 点击点位</div>
      <div className="map-data-badge">本地离线底图 · OSM 2026.08.05</div>
      {!mapReady && !mapFallback && <div className="map-loading" role="status"><span>正在加载民勤离线地图</span><div><i style={{ width: `${mapProgress}%` }} /></div><b>{mapProgress}%</b></div>}
      <div ref={containerRef} className={`map-canvas ${mapFallback ? "is-hidden" : ""}`} aria-label="民勤互动地图" />
      {mapFallback && <div className="fallback-map" role="img" aria-label="底图文件失败时的民勤示意沙盘">
        <div className="fallback-sand sand-a" /><div className="fallback-sand sand-b" /><div className="fallback-oasis">民勤故事仍可浏览</div><div className="fallback-water">石羊河水脉</div>
        {activePoints.slice(0, 3).map((point, index) => <button key={point.id} className={`fallback-node node-${index + 1}`} onClick={() => onPointActivate(point.id)}><span>{String(index + 1).padStart(2, "0")}</span>{point.title}</button>)}
        <p>地图文件未能读取，已切换为本地示意沙盘；文字、影像和资料来源不受影响。</p>
      </div>}
      <div className="map-tools" aria-label="地图辅助操作"><button onClick={onResetMap}>重置视角</button><button onClick={onToggleFullscreen}>全屏地图</button></div>
      <div className="map-legend" aria-label="地图图例"><strong>图例与定位精度</strong><span><i className="legend-field" />团队实践</span><span><i className="legend-reference" />公开资料</span><span><i className="legend-approx" />县域 / 村级近似</span><span><i className="legend-gps" />GPS 实拍点</span><span><i className="legend-gps-track" />影像 GPS 采样线</span><small>红色虚线：叙事路径，非导航路线<br />采样线：非完整轨迹、非导航路线</small></div>
      <div className="point-list" aria-label="当前图层全部点位">{activePoints.map((point, index) => <button key={point.id} onClick={() => onPointActivate(point.id)} className={selected?.id === point.id ? "selected" : ""}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{point.title}</strong><small>{point.contentOrigin} · {point.accuracy}</small></div></button>)}</div>
      <aside className={`story-drawer ${selected ? "open" : ""}`} aria-hidden={!selected} aria-label="地图故事卡">
        {selected && <><button ref={closeButtonRef} className="drawer-close" onClick={onCloseStory} aria-label="关闭故事卡">×</button><div className="drawer-scroll">
          <p className="eyebrow">{selected.eyebrow}</p><h3>{selected.title}</h3>
          <div className="story-meta"><span className={accuracyClass(selected.accuracy)}>{selected.accuracy}</span><span className="origin">{selected.contentOrigin}</span><time>{selected.date}</time></div>
          <p className="evidence-line"><b>{selected.evidenceStatus}</b>{selected.locationNote}</p><p className="story-summary">{selected.summary}</p><p className="story-summary-en">{selected.summaryEn}</p>
          {selected.evidenceGroups && selected.evidenceGroups.length > 0 ? <div className="point-evidence" aria-label="现场证据分组">
            <div className="point-evidence-heading"><span>THREE THREADS / ONE PLACE</span><strong>同一地点，三项现场记录</strong></div>
            {selected.evidenceGroups.map((group) => {
              const groupMedia = group.mediaIds.map((id) => selectedMedia.find((asset) => asset.id === id)).filter((asset): asset is MediaAsset => asset !== undefined);
              return <article className="evidence-group" id={`evidence-${group.id}`} key={group.id}>
                <header><span>{group.label}</span><h4>{group.title}</h4><p>{group.summary}</p></header>
                <p className="evidence-boundary">内容边界 / {group.boundary}</p>
                {groupMedia.length > 0 && <div className="story-media evidence-media">{groupMedia.map((asset) => <figure key={asset.id}>{asset.type === "image" ? <img src={asset.src} alt={asset.alt} loading="lazy" /> : <video src={asset.src} poster={asset.poster} controls preload="metadata" aria-label={asset.alt}><track kind="captions" src="/media/shared/ambient-zh.vtt" srcLang="zh" label="中文说明" default /></video>}<figcaption><span>{asset.timeLabel ?? asset.capturedAt}</span>{asset.caption}</figcaption></figure>)}</div>}
              </article>;
            })}
          </div> : selectedMedia.length > 0 && <div className="story-media">{selectedMedia.map((asset) => <figure key={asset.id}>{asset.type === "image" ? <img src={asset.src} alt={asset.alt} loading="lazy" /> : <video src={asset.src} poster={asset.poster} controls preload="metadata" aria-label={asset.alt}><track kind="captions" src="/media/shared/ambient-zh.vtt" srcLang="zh" label="中文说明" default /></video>}<figcaption><span>{asset.timeLabel ?? asset.capturedAt}</span>{asset.caption}</figcaption></figure>)}</div>}
          {selectedSources.length > 0 && <div className="drawer-sources"><span>资料来源</span>{selectedSources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.publisher} · {source.title} ↗</a>)}</div>}
        </div></>}
      </aside>
    </div>
  </section>;
}

function activePointsForLayer(layer: StoryLayer) {
  return storyPoints.filter((point) => point.layer === layer).length;
}
