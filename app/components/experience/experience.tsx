"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { herbs, mediaById, relationshipEdges, sourceById, storyPointById, storyPoints, timelineEvents, tourChapters, waterStages, type ResourceSectionKey, type StoryLayer, type TimelineCategory } from "@/content";
import { DigitalExhibit, type ExhibitModule, type ResourceView, type TimelineDay } from "@/app/components/exhibit/digital-exhibit";
import { InteractiveMap } from "@/app/components/map/interactive-map";
import { LongFormPage } from "@/app/components/sections/long-form-page";
import { useMinqinMap } from "@/app/hooks/use-minqin-map";
import { defaultView } from "@/app/lib/map-config";

const exhibitModules: ExhibitModule[] = ["tour", "field", "water", "resources"];

export function Experience() {
  const [activeLayer, setActiveLayer] = useState<StoryLayer>("practice");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [tourMode, setTourMode] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [exhibitModule, setExhibitModule] = useState<ExhibitModule>("tour");
  const [timelineDay, setTimelineDay] = useState<TimelineDay>("2026-08-03");
  const [timelineCategory, setTimelineCategory] = useState<TimelineCategory | "全部">("全部");
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [waterStageIndex, setWaterStageIndex] = useState(0);
  const [resourceIndex, setResourceIndex] = useState(0);
  const [resourceSection, setResourceSection] = useState<ResourceSectionKey>("habitat");
  const [resourceView, setResourceView] = useState<ResourceView>("specimen");
  const [relationshipIndex, setRelationshipIndex] = useState(0);

  const mapFrame = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const mapSection = useRef<HTMLElement>(null);
  const tourPanel = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const activePoints = useMemo(() => storyPoints.filter((point) => point.layer === activeLayer), [activeLayer]);
  const selected = storyPointById.get(selectedId ?? "") ?? null;
  const selectedMedia = selected?.mediaIds.map((id) => mediaById.get(id)).filter((asset) => asset !== undefined) ?? [];
  const selectedSources = selected?.sourceIds.map((id) => sourceById.get(id)).filter((source) => source !== undefined) ?? [];
  const chapter = tourChapters[tourIndex];
  const filteredTimelineEvents = useMemo(() => timelineEvents.filter((event) => event.day === timelineDay && (timelineCategory === "全部" || event.category === timelineCategory)), [timelineCategory, timelineDay]);
  const timelineEvent = filteredTimelineEvents[Math.min(timelineIndex, Math.max(0, filteredTimelineEvents.length - 1))];
  const timelinePoint = timelineEvent ? storyPointById.get(timelineEvent.storyPointId) : undefined;
  const waterStage = waterStages[waterStageIndex];
  const selectedResourcePoint = storyPointById.get(herbs[resourceIndex].mapPointId);

  const { mapContainer, mapInstance, mapFallback, mapReady, mapProgress } = useMinqinMap({ activeLayer, activePoints, onPointActivate: activateMapPoint });

  useEffect(() => {
    const openFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get("module") as ExhibitModule | null;
      if (params.get("view") === "exhibit") {
        const requestedModule = requested && exhibitModules.includes(requested) ? requested : "tour";
        setExhibitModule(requestedModule);
        if (requestedModule === "field") setActiveLayer("practice");
        if (requestedModule === "water") setActiveLayer("water");
        if (requestedModule === "resources") setActiveLayer("herbs");
        setTourMode(true);
      } else setTourMode(false);
    };
    const timer = window.setTimeout(openFromUrl, 0);
    window.addEventListener("popstate", openFromUrl);
    return () => { window.clearTimeout(timer); window.removeEventListener("popstate", openFromUrl); };
  }, []);

  useEffect(() => {
    if (!selected) return;
    previousFocus.current = document.activeElement as HTMLElement;
    closeButton.current?.focus();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    mapInstance.current?.easeTo({ center: selected.coordinates, zoom: selected.layer === "water" ? 8.6 : selected.accuracy === "GPS实拍点" ? 13.15 : 9.3, duration: reduced ? 0 : 800, offset: window.innerWidth < 680 ? [0, -120] : [-150, 0] });
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") closeStory(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // closeStory follows the selected story captured by this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    if (!tourMode) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      mapInstance.current?.resize();
      if (exhibitModule === "tour") mapInstance.current?.easeTo({ ...chapter.mapView, duration: reduced ? 0 : 850 });
      if (exhibitModule === "field" && timelinePoint) mapInstance.current?.easeTo({ center: timelinePoint.coordinates, zoom: timelinePoint.accuracy === "GPS实拍点" ? 13.15 : 9.5, pitch: 48, bearing: -8, duration: reduced ? 0 : 700 });
      if (exhibitModule === "water") mapInstance.current?.easeTo({ ...waterStage.mapView, duration: reduced ? 0 : 800 });
      if (exhibitModule === "resources" && selectedResourcePoint) mapInstance.current?.easeTo({ center: selectedResourcePoint.coordinates, zoom: 9.25, pitch: 44, bearing: -7, duration: reduced ? 0 : 700 });
      tourPanel.current?.focus();
    }, 80);
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, video, select, textarea")) return;
      if (event.key === "Escape") endTour();
      if (event.key === "ArrowRight") stepExhibit(1);
      if (event.key === "ArrowLeft") stepExhibit(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { window.clearTimeout(timer); window.removeEventListener("keydown", onKeyDown); };
    // Keyboard handlers intentionally use the current exhibit state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, exhibitModule, selectedResourcePoint, timelinePoint, tourIndex, tourMode, waterStage]);

  function updateExhibitUrl(module: ExhibitModule | null) {
    const url = new URL(window.location.href);
    if (module) { url.searchParams.set("view", "exhibit"); url.searchParams.set("module", module); }
    else { url.searchParams.delete("view"); url.searchParams.delete("module"); }
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function startTour() {
    previousFocus.current = document.activeElement as HTMLElement;
    setTourIndex(0); setExhibitModule("tour"); setActiveLayer(tourChapters[0].layer); setSelectedId(null); setTourMode(true); updateExhibitUrl("tour");
  }

  function endTour() {
    setTourMode(false); updateExhibitUrl(null);
    window.setTimeout(() => { mapInstance.current?.resize(); previousFocus.current?.focus(); }, 90);
  }

  function selectExhibitModule(module: ExhibitModule) {
    setExhibitModule(module); setSelectedId(null);
    if (module === "tour") setActiveLayer(chapter.layer);
    if (module === "field") setActiveLayer("practice");
    if (module === "water") setActiveLayer("water");
    if (module === "resources") setActiveLayer("herbs");
    updateExhibitUrl(module);
  }

  function goToChapter(index: number) {
    const safeIndex = Math.max(0, Math.min(tourChapters.length - 1, index));
    setTourIndex(safeIndex); setActiveLayer(tourChapters[safeIndex].layer); setSelectedId(null);
  }

  function selectTimelineEvent(index: number) { setTimelineIndex(Math.max(0, Math.min(filteredTimelineEvents.length - 1, index))); setActiveLayer("practice"); }
  function selectWaterStage(index: number) { setWaterStageIndex(Math.max(0, Math.min(waterStages.length - 1, index))); setActiveLayer("water"); }
  function selectResource(index: number) { setResourceIndex(Math.max(0, Math.min(herbs.length - 1, index))); setActiveLayer("herbs"); }

  function stepExhibit(direction: -1 | 1) {
    if (exhibitModule === "tour") goToChapter(tourIndex + direction);
    if (exhibitModule === "field") selectTimelineEvent(timelineIndex + direction);
    if (exhibitModule === "water") selectWaterStage(waterStageIndex + direction);
    if (exhibitModule === "resources" && resourceView === "specimen") selectResource(resourceIndex + direction);
    if (exhibitModule === "resources" && resourceView === "relations") setRelationshipIndex((value) => Math.max(0, Math.min(relationshipEdges.length - 1, value + direction)));
  }

  function activateMapPoint(pointId: string) {
    if (!tourMode) { setSelectedId(pointId); return; }
    if (exhibitModule === "field") { const index = filteredTimelineEvents.findIndex((event) => event.storyPointId === pointId); if (index >= 0) selectTimelineEvent(index); return; }
    if (exhibitModule === "water") { const index = waterStages.findIndex((stage) => stage.pointId === pointId); if (index >= 0) selectWaterStage(index); return; }
    if (exhibitModule === "resources") { const index = herbs.findIndex((herb) => herb.mapPointId === pointId); if (index >= 0) selectResource(index); return; }
    const index = tourChapters.findIndex((item) => item.pointIds.includes(pointId));
    if (index >= 0) goToChapter(index);
  }

  function activateRelationshipPoint(pointId: string) {
    const point = storyPointById.get(pointId);
    if (!point) return;
    setActiveLayer(point.layer);
    mapInstance.current?.easeTo({ center: point.coordinates, zoom: 9.2, pitch: 44, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650 });
  }

  function closeStory() { setSelectedId(null); window.setTimeout(() => (previousFocus.current ?? mapSection.current)?.focus(), 0); }
  function resetMap() { mapInstance.current?.easeTo({ ...defaultView, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700 }); }
  async function toggleFullscreen() { if (!mapFrame.current) return; if (document.fullscreenElement) await document.exitFullscreen(); else await mapFrame.current.requestFullscreen(); window.setTimeout(() => mapInstance.current?.resize(), 100); }

  const mapSlot = <InteractiveMap sectionRef={mapSection} frameRef={mapFrame} containerRef={mapContainer} closeButtonRef={closeButton} activeLayer={activeLayer} activePoints={activePoints} selected={selected} selectedMedia={selectedMedia} selectedSources={selectedSources} mapReady={mapReady} mapFallback={mapFallback} mapProgress={mapProgress} onLayerChange={(layer) => { setActiveLayer(layer); setSelectedId(null); }} onPointActivate={activateMapPoint} onCloseStory={closeStory} onResetMap={resetMap} onToggleFullscreen={toggleFullscreen} />;

  return <main className={tourMode ? "tour-mode" : ""}>
    <LongFormPage mapSlot={mapSlot} showAllMedia={showAllMedia} onToggleMedia={() => setShowAllMedia((value) => !value)} onStartExhibit={startTour} onEnterMap={() => mapSection.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} />
    {tourMode && <DigitalExhibit panelRef={tourPanel} module={exhibitModule} tourIndex={tourIndex} timelineDay={timelineDay} timelineCategory={timelineCategory} timelineIndex={timelineIndex} waterStageIndex={waterStageIndex} resourceIndex={resourceIndex} resourceSection={resourceSection} resourceView={resourceView} relationshipIndex={relationshipIndex} onEnd={endTour} onSelectModule={selectExhibitModule} onGoChapter={goToChapter} onSetTimelineDay={(day) => { setTimelineDay(day); setTimelineCategory("全部"); setTimelineIndex(0); }} onSetTimelineCategory={(category) => { setTimelineCategory(category); setTimelineIndex(0); }} onSelectTimelineEvent={selectTimelineEvent} onSelectWaterStage={selectWaterStage} onSelectResource={selectResource} onSetResourceSection={setResourceSection} onSetResourceView={setResourceView} onSetRelationshipIndex={setRelationshipIndex} onActivateRelationshipPoint={activateRelationshipPoint} onStep={stepExhibit} onRestart={() => { setTourIndex(0); setTimelineIndex(0); setWaterStageIndex(0); setResourceIndex(0); setRelationshipIndex(0); selectExhibitModule("tour"); }} />}
  </main>;
}

