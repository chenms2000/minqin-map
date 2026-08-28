"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { chapterFramesById, herbs, mediaById, publicAsset, relationshipEdges, sourceById, storyPointById, timelineCategories, timelineEvents, tourChapters, waterStages, type ResourceSectionKey, type TimelineCategory } from "@/content";
import type { TourPlaybackState } from "@/app/components/experience/experience";
import { ExhibitHeader, ExhibitNavigationBar, ExploreMenu, TourPlaybackBar } from "@/app/components/exhibit/exhibit-chrome";
import { TourStage } from "@/app/components/exhibit/tour-stage";

export type ExhibitModule = "tour" | "field" | "water" | "resources";
export type ResourceView = "specimen" | "relations";
export type TimelineDay = "2026-08-03" | "2026-08-04";

const resourceSectionMeta: Array<{ id: ResourceSectionKey; label: string }> = [
  { id: "habitat", label: "生境" }, { id: "ecology", label: "生态关系" }, { id: "cultivation", label: "种植" },
  { id: "harvest", label: "采收与保护" }, { id: "processing", label: "加工与鉴别" }, { id: "communication", label: "来源口径" },
];

type DigitalExhibitProps = {
  panelRef: RefObject<HTMLElement | null>;
  module: ExhibitModule;
  tourIndex: number;
  tourFrameIndex: number;
  playback: TourPlaybackState;
  elapsedSeconds: number;
  totalSeconds: number;
  timelineDay: TimelineDay;
  timelineCategory: TimelineCategory | "全部";
  timelineIndex: number;
  waterStageIndex: number;
  resourceIndex: number;
  resourceSection: ResourceSectionKey;
  resourceView: ResourceView;
  relationshipIndex: number;
  onEnd: () => void;
  onSelectModule: (module: ExhibitModule) => void;
  onGoChapter: (index: number) => void;
  onTogglePlayback: () => void;
  onExploreMap: () => void;
  onViewEvidence: () => void;
  onSetTimelineDay: (day: TimelineDay) => void;
  onSetTimelineCategory: (category: TimelineCategory | "全部") => void;
  onSelectTimelineEvent: (index: number) => void;
  onSelectWaterStage: (index: number) => void;
  onSelectResource: (index: number) => void;
  onSetResourceSection: (section: ResourceSectionKey) => void;
  onSetResourceView: (view: ResourceView) => void;
  onSetRelationshipIndex: (index: number) => void;
  onActivateRelationshipPoint: (pointId: string) => void;
  onStep: (direction: -1 | 1) => void;
  onRestart: () => void;
};

export function DigitalExhibit(props: DigitalExhibitProps) {
  const { panelRef, module, tourIndex, tourFrameIndex, playback, elapsedSeconds, totalSeconds, timelineDay, timelineCategory, timelineIndex, waterStageIndex, resourceIndex, resourceSection, resourceView, relationshipIndex } = props;
  const touchStartX = useRef<number | null>(null);
  const [toolsOpen, setToolsOpen] = useState(module !== "tour");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const filteredEvents = useMemo(() => timelineEvents.filter((event) => event.day === timelineDay && (timelineCategory === "全部" || event.category === timelineCategory)), [timelineCategory, timelineDay]);
  const chapter = tourChapters[tourIndex];
  const chapterFrames = chapterFramesById.get(chapter.id) ?? [];
  const tourFrame = chapterFrames[Math.min(tourFrameIndex, Math.max(0, chapterFrames.length - 1))];
  const tourFrameMedia = mediaById.get(tourFrame?.mediaId ?? "");
  const tourFramePoint = storyPointById.get(tourFrame?.pointId ?? "");
  const tourFrameSource = sourceById.get(tourFrame?.sourceId ?? "");
  const timelineEvent = filteredEvents[Math.min(timelineIndex, Math.max(0, filteredEvents.length - 1))];
  const timelineMedia = timelineEvent ? mediaById.get(timelineEvent.mediaId) : undefined;
  const timelinePoint = timelineEvent ? storyPointById.get(timelineEvent.storyPointId) : undefined;
  const waterStage = waterStages[waterStageIndex];
  const resource = herbs[resourceIndex];
  const relationship = relationshipEdges[relationshipIndex];
  const tourProgress = Math.min(100, Math.round((elapsedSeconds / totalSeconds) * 100));
  useEffect(() => {
    if (module !== "tour") return;
    const timer = window.setTimeout(() => setToolsOpen(playback === "paused"), 0);
    return () => window.clearTimeout(timer);
  }, [module, playback]);

  function handleTouchStart(event: React.TouchEvent) { touchStartX.current = event.changedTouches[0]?.clientX ?? null; }
  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 56) props.onStep(delta < 0 ? 1 : -1);
  }

  return <aside className={`tour-panel exhibit-panel exhibit-module-${module}`} ref={panelRef} tabIndex={-1} aria-label="数字展框" aria-live="polite" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
    <ExhibitHeader module={module} tourIndex={tourIndex} onEnd={props.onEnd} />
    <ExploreMenu open={toolsOpen} module={module} tourIndex={tourIndex} onOpenChange={setToolsOpen} onSelectModule={(nextModule) => { setToolsOpen(false); props.onSelectModule(nextModule); }} onGoChapter={props.onGoChapter} onRestart={props.onRestart} />

    {module === "tour" && tourFrame && <TourStage chapter={chapter} chapterCount={tourChapters.length} frame={tourFrame} frameIndex={tourFrameIndex} frameCount={chapterFrames.length} media={tourFrameMedia} point={tourFramePoint} source={tourFrameSource} isPlaying={playback === "playing"} soundEnabled={soundEnabled} />}

    {module !== "tour" && <div className={`exhibit-stage exhibit-knowledge-stage visual-${module === "resources" ? "specimen" : "data"}`} data-visual-type={module === "resources" ? "specimen" : "data"}>

      {module === "field" && <div className="field-player">
        <div className="exhibit-heading"><p>TWO-DAY FIELD PLAYER</p><h2>两日实践轨迹</h2><span>按原始素材时间与现场主题组织两日影像记录。</span></div>
        <div className="timeline-days" role="tablist" aria-label="实践日期">{(["2026-08-03", "2026-08-04"] as const).map((day) => <button key={day} role="tab" aria-selected={timelineDay === day} className={timelineDay === day ? "active" : ""} onClick={() => props.onSetTimelineDay(day)}>{day === "2026-08-03" ? "8月3日 · 进入民勤" : "8月4日 · 公益林养护"}</button>)}</div>
        <div className="timeline-filters" aria-label="素材类别筛选">{(["全部", ...timelineCategories] as const).map((category) => { const count = timelineEvents.filter((event) => event.day === timelineDay && (category === "全部" || event.category === category)).length; return <button key={category} disabled={count === 0} className={timelineCategory === category ? "active" : ""} onClick={() => props.onSetTimelineCategory(category)}>{category} · {count}</button>; })}</div>
        {timelineEvent && timelineMedia && <><figure className="player-media">{timelineMedia.type === "image" ? <img src={timelineMedia.src} alt={timelineMedia.alt} /> : <video src={timelineMedia.src} poster={timelineMedia.poster} controls preload="metadata" aria-label={timelineMedia.alt}><track kind="captions" src={publicAsset("/media/shared/ambient-zh.vtt")} srcLang="zh" label="中文说明" default /></video>}<figcaption><time>{timelineEvent.timeLabel ?? timelineEvent.capturedAt.slice(11)}</time><b>{timelineEvent.category}</b><span>{timelineMedia.caption}</span></figcaption></figure><div className="event-readout"><strong>{timelinePoint?.title}</strong><span>{timelineEvent.locationAccuracy}</span><p>{timelineEvent.note}</p></div><label className="timeline-range"><span>{timelineIndex + 1} / {filteredEvents.length}</span><input aria-label="实践时间进度" type="range" min="0" max={Math.max(0, filteredEvents.length - 1)} value={Math.min(timelineIndex, Math.max(0, filteredEvents.length - 1))} onChange={(event) => props.onSelectTimelineEvent(Number(event.target.value))} /></label><div className="event-strip">{filteredEvents.map((event, index) => { const asset = mediaById.get(event.mediaId); const time = event.timeLabel ?? event.capturedAt.slice(11); return <button key={event.id} className={index === timelineIndex ? "active" : ""} onClick={() => props.onSelectTimelineEvent(index)} aria-label={`跳至 ${time} ${event.note}`}>{asset && <img src={asset.type === "image" ? asset.src : asset.poster} alt="" loading="lazy" />}<time>{time}</time></button>; })}</div></>}
      </div>}

      {module === "water" && <div className="water-machine">
        <div className="exhibit-heading"><p>WATER × SAND TIMELINE</p><h2>绿洲生死线</h2><span>按来源可追溯的历史切片，连接沙漠压力、水脉变化与绿洲恢复。</span></div>
        <div className="water-years" role="tablist" aria-label="水沙历史节点">{waterStages.map((stage, index) => <button key={stage.id} role="tab" aria-selected={index === waterStageIndex} className={index === waterStageIndex ? "active" : ""} onClick={() => props.onSelectWaterStage(index)}>{stage.year}</button>)}</div>
        <div className={`water-visual phase-${waterStage.phase}`} aria-label="沙漠压力、水脉变化与绿洲恢复关系示意图">
          <div className="sand-side badain"><span>沙漠压力</span><b>巴丹吉林南缘</b></div>
          <div className="oasis-core"><b>民勤绿洲</b><span>{waterStage.visualNote}</span><i aria-hidden="true" /></div>
          <div className="sand-side tengger"><span>沙漠压力</span><b>腾格里西缘</b></div>
          <small>水沙关系示意 · 非历史沙漠边界</small>
        </div>
        <div className="water-readout"><time>{waterStage.year}</time><h3>{waterStage.title}</h3><div className="water-primary-metric"><strong>{waterStage.metric}</strong><span>{waterStage.unit}</span></div>{waterStage.comparison && <div className="water-comparison" aria-label="阶段性恢复指标">{waterStage.comparison.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>}<p>{waterStage.interpretation}</p><small>资料口径：{waterStage.geometryMode === "symbolic" ? "文字资料与区域关系示意；未使用未核验沙漠边界" : "权威空间数据"}</small>{waterStage.sourceIds.map((id) => { const source = sourceById.get(id); return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.publisher} · {source.title} · {source.publishedAt} ↗</a> : null; })}</div>
        <label className="timeline-range"><span>{waterStage.year}</span><input aria-label="水沙历史进度" type="range" min="0" max={waterStages.length - 1} value={waterStageIndex} onChange={(event) => props.onSelectWaterStage(Number(event.target.value))} /></label>
      </div>}

      {module === "resources" && <div className="resource-cabinet">
        <div className="exhibit-heading"><p>DESERT RESOURCE CABINET</p><h2>药材标本柜</h2><span>真实物种图像、民勤种植记录与植物研究资料并列呈现。</span></div>
        <div className="resource-view-switch"><button className={resourceView === "specimen" ? "active" : ""} onClick={() => props.onSetResourceView("specimen")}>互动标本</button><button className={resourceView === "relations" ? "active" : ""} onClick={() => props.onSetResourceView("relations")}>关系演示</button></div>
        {resourceView === "specimen" ? <>
          <div className="specimen-tabs" role="tablist" aria-label="药材资源">{herbs.map((herb, index) => <button key={herb.id} role="tab" aria-selected={index === resourceIndex} className={index === resourceIndex ? "active" : ""} onClick={() => props.onSelectResource(index)}><span>0{index + 1}</span>{herb.name}</button>)}</div>
          <article className="specimen-sheet">
            <div className="specimen-intro">
              <figure className="specimen-portrait"><img src={resource.image.src} alt={resource.image.alt} /><figcaption><span>{resource.image.caption}</span><a href={resource.image.sourceUrl} target="_blank" rel="noreferrer">{resource.image.credit} · {resource.image.license} ↗</a></figcaption></figure>
              <div className="specimen-identity"><div className="specimen-stamp">{resource.evidenceLabel}</div><p>{resource.tag}</p><h3>{resource.name}</h3><em>{resource.latinLabel}</em><div className="specimen-facts">{resource.facts.map((fact) => <div key={fact.label}><span>{fact.label}</span><strong>{fact.value}</strong></div>)}</div></div>
            </div>
            <div className="resource-sections">{resourceSectionMeta.map((section) => <button key={section.id} className={resourceSection === section.id ? "active" : ""} onClick={() => props.onSetResourceSection(section.id)}>{section.label}</button>)}</div>
            <div className="resource-section-copy"><strong>{resourceSectionMeta.find((item) => item.id === resourceSection)?.label}</strong><p>{resource.sections[resourceSection]}</p></div>
            <div className="specimen-sources"><span>资料来源</span>{resource.sourceIds.map((id) => { const source = sourceById.get(id); return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.publisher} · {source.publishedAt} ↗</a> : null; })}</div>
            <button className="map-link" onClick={() => props.onActivateRelationshipPoint(resource.mapPointId)}>在地图中查看关联节点 →</button>
          </article>
        </> : <div className="relation-view"><div className="relation-network" aria-label="生态关系演示">{relationshipEdges.map((edge, index) => <button key={edge.id} className={index === relationshipIndex ? "active" : ""} onClick={() => props.onSetRelationshipIndex(index)}><span>{storyPointById.get(edge.fromPointId)?.title}</span><b>{edge.label}</b><span>{storyPointById.get(edge.toPointId)?.title}</span></button>)}</div><article className="relation-detail"><p>关系 {relationshipIndex + 1} / {relationshipEdges.length}</p><h3>{relationship.label}</h3><p>{relationship.explanation}</p><div><button onClick={() => props.onActivateRelationshipPoint(relationship.fromPointId)}>定位起点</button><button onClick={() => props.onActivateRelationshipPoint(relationship.toPointId)}>定位终点</button></div></article></div>}
      </div>}
    </div>}

    {module === "tour" ? <TourPlaybackBar playback={playback} soundEnabled={soundEnabled} elapsedSeconds={elapsedSeconds} totalSeconds={totalSeconds} progress={tourProgress} previousDisabled={tourIndex === 0} nextDisabled={tourIndex === tourChapters.length - 1} onToggle={() => { if (playback !== "playing") setToolsOpen(false); props.onTogglePlayback(); }} onToggleSound={() => setSoundEnabled((enabled) => !enabled)} onPrevious={() => props.onStep(-1)} onNext={() => props.onStep(1)} onExploreMap={props.onExploreMap} onViewEvidence={props.onViewEvidence} /> : <ExhibitNavigationBar label={module === "field" ? "实践影像" : module === "water" ? "水沙切片" : "药材关系"} previousDisabled={(module === "field" && timelineIndex === 0) || (module === "water" && waterStageIndex === 0) || (module === "resources" && resourceView === "specimen" && resourceIndex === 0) || (module === "resources" && resourceView === "relations" && relationshipIndex === 0)} nextDisabled={(module === "field" && timelineIndex >= filteredEvents.length - 1) || (module === "water" && waterStageIndex >= waterStages.length - 1) || (module === "resources" && resourceView === "specimen" && resourceIndex >= herbs.length - 1) || (module === "resources" && resourceView === "relations" && relationshipIndex >= relationshipEdges.length - 1)} onPrevious={() => props.onStep(-1)} onNext={() => props.onStep(1)} />}
  </aside>;
}
