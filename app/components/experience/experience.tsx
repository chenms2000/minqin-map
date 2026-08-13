"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chapterFramesById, herbs, mediaById, relationshipEdges, sourceById, storyPointById, storyPoints, timelineEvents, tourChapters, waterStages, type ResourceSectionKey, type StoryLayer, type StoryPoint, type TimelineCategory } from "@/content";
import { DigitalExhibit, type ExhibitModule, type ResourceView, type TimelineDay } from "@/app/components/exhibit/digital-exhibit";
import { InteractiveMap } from "@/app/components/map/interactive-map";
import { LongFormPage } from "@/app/components/sections/long-form-page";
import { useMinqinMap } from "@/app/hooks/use-minqin-map";
import { defaultView } from "@/app/lib/map-config";

const exhibitModules: ExhibitModule[] = ["tour", "field", "water", "resources"];
export type TourPlaybackState = "idle" | "playing" | "paused" | "completed";

const pointCameraTuning = { waterZoom: 9.2, contextZoom: 9.5, gpsZoom: 13.85, pitch: 45, bearing: -8 } as const;

function cameraForPoint(point: Pick<StoryPoint, "coordinates" | "layer" | "accuracy">, duration: number, offset?: [number, number]) {
  const zoom = point.layer === "water" ? pointCameraTuning.waterZoom : point.accuracy === "GPS实拍点" ? pointCameraTuning.gpsZoom : pointCameraTuning.contextZoom;
  return { center: point.coordinates, zoom, pitch: pointCameraTuning.pitch, bearing: pointCameraTuning.bearing, duration, ...(offset ? { offset } : {}) };
}

function chapterIndexFromId(id: string | null) {
  return id ? tourChapters.findIndex((chapter) => chapter.id === id) : -1;
}

function tourFrameIndexAt(elapsedSeconds: number, frameDurations: number[]) {
  if (frameDurations.length === 0) return 0;
  const cursor = Math.max(0, elapsedSeconds);
  let accumulated = 0;
  const index = frameDurations.findIndex((duration) => {
    accumulated += duration;
    return cursor < accumulated;
  });
  return index === -1 ? frameDurations.length - 1 : index;
}

export function Experience() {
  const [activeLayer, setActiveLayer] = useState<StoryLayer>("practice");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [tourMode, setTourMode] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [tourPlayback, setTourPlayback] = useState<TourPlaybackState>("idle");
  const [chapterElapsedSeconds, setChapterElapsedSeconds] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyMapMode, setStoryMapMode] = useState(false);
  const [storyTargetId, setStoryTargetId] = useState<string | null>(null);
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
  const drawerScroll = useRef<HTMLDivElement>(null);
  const mapSection = useRef<HTMLElement>(null);
  const tourPanel = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const chapterElapsedRef = useRef(0);
  const drawerWasOpen = useRef(false);

  const layerPoints = useMemo(() => storyPoints.filter((point) => point.layer === activeLayer), [activeLayer]);
  const selected = storyPointById.get(selectedId ?? "") ?? null;
  const selectedMedia = selected?.mediaIds.map((id) => mediaById.get(id)).filter((asset) => asset !== undefined) ?? [];
  const selectedSources = selected?.sourceIds.map((id) => sourceById.get(id)).filter((source) => source !== undefined) ?? [];
  const chapter = tourChapters[tourIndex];
  const chapterFrames = chapterFramesById.get(chapter.id) ?? [];
  const chapterDurations = useMemo(() => tourChapters.map((item) => (chapterFramesById.get(item.id) ?? []).reduce((total, frame) => total + frame.durationSeconds, 0)), []);
  const chapterDurationSeconds = chapterDurations[tourIndex] ?? 0;
  const activeTourFrameIndex = tourFrameIndexAt(chapterElapsedSeconds, chapterFrames.map((frame) => frame.durationSeconds));
  const activeTourFrame = chapterFrames[activeTourFrameIndex];
  const activeTourPoint = storyPointById.get(activeTourFrame?.pointId ?? "");
  const totalTourSeconds = chapterDurations.reduce((total, duration) => total + duration, 0);
  const totalElapsedSeconds = chapterDurations.slice(0, tourIndex).reduce((total, duration) => total + duration, 0) + chapterElapsedSeconds;
  const storyChapter = tourChapters[storyIndex];
  const storyChapterPoints = useMemo(() => storyChapter.pointIds.map((id) => storyPointById.get(id)).filter((point) => point !== undefined), [storyChapter]);
  const activePoints = storyMapMode && !tourMode ? storyChapterPoints : layerPoints;
  const filteredTimelineEvents = useMemo(() => timelineEvents.filter((event) => event.day === timelineDay && (timelineCategory === "全部" || event.category === timelineCategory)), [timelineCategory, timelineDay]);
  const timelineEvent = filteredTimelineEvents[Math.min(timelineIndex, Math.max(0, filteredTimelineEvents.length - 1))];
  const timelinePoint = timelineEvent ? storyPointById.get(timelineEvent.storyPointId) : undefined;
  const waterStage = waterStages[waterStageIndex];
  const selectedResourcePoint = storyPointById.get(herbs[resourceIndex].mapPointId);
  const mapPresentationMode = tourMode ? "tour" : storyMapMode ? "story" : "free";
  const mapSelectedPointId = !tourMode
    ? selectedId
    : exhibitModule === "tour"
      ? activeTourPoint?.id ?? null
      : exhibitModule === "field"
        ? timelinePoint?.id ?? null
        : exhibitModule === "water"
          ? waterStage.pointId
          : selectedResourcePoint?.id ?? null;

  const { mapContainer, mapInstance, mapFallback, mapReady, mapProgress } = useMinqinMap({ activeLayer, activePoints, mapSelectedPointId, presentationMode: mapPresentationMode, onPointActivate: activateMapPoint });

  useEffect(() => {
    if (!tourMode || exhibitModule !== "tour" || tourPlayback !== "playing") return;
    const durationSeconds = chapterDurationSeconds;
    const startedAt = Date.now();
    const elapsedAtStart = chapterElapsedRef.current;
    const progressTimer = window.setInterval(() => {
      const elapsed = Math.min(durationSeconds, elapsedAtStart + (Date.now() - startedAt) / 1000);
      chapterElapsedRef.current = elapsed;
      setChapterElapsedSeconds(elapsed);
    }, 250);
    const chapterDurationMs = durationSeconds * 1000;
    const remainingDurationMs = Math.max(0, chapterDurationMs - elapsedAtStart * 1000);
    const timer = window.setTimeout(() => {
      if (tourIndex === tourChapters.length - 1) {
        chapterElapsedRef.current = durationSeconds;
        setChapterElapsedSeconds(durationSeconds);
        setTourPlayback("completed");
        return;
      }
      goToChapter(tourIndex + 1);
    }, remainingDurationMs);
    return () => { window.clearInterval(progressTimer); window.clearTimeout(timer); };
    // goToChapter intentionally resets the single chapter timer through tourIndex.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterDurationSeconds, exhibitModule, tourIndex, tourMode, tourPlayback]);

  useEffect(() => {
    const openFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get("module") as ExhibitModule | null;
      const requestedChapterId = params.get("chapter");
      const requestedChapterIndex = chapterIndexFromId(requestedChapterId);
      if (params.get("view") === "exhibit") {
        const requestedModule = requested && exhibitModules.includes(requested) ? requested : "tour";
        setExhibitModule(requestedModule);
        if (requestedModule === "tour") {
          const safeIndex = requestedChapterIndex >= 0 ? requestedChapterIndex : 0;
          setTourIndex(safeIndex);
          setActiveLayer(tourChapters[safeIndex].layer);
        }
        if (requestedModule === "field") setActiveLayer("practice");
        if (requestedModule === "water") setActiveLayer("water");
        if (requestedModule === "resources") setActiveLayer("herbs");
        setSelectedId(null);
        chapterElapsedRef.current = 0;
        setChapterElapsedSeconds(0);
        setTourPlayback("idle");
        setTourMode(true);
      } else {
        chapterElapsedRef.current = 0;
        setChapterElapsedSeconds(0);
        setTourPlayback("idle");
        setTourMode(false);
        setSelectedId(null);
        if (requestedChapterIndex >= 0) {
          setStoryIndex(requestedChapterIndex);
          setStoryTargetId(requestedChapterId);
        } else {
          setStoryIndex(0);
          setStoryTargetId(null);
        }
      }
    };
    const timer = window.setTimeout(openFromUrl, 0);
    window.addEventListener("popstate", openFromUrl);
    return () => { window.clearTimeout(timer); window.removeEventListener("popstate", openFromUrl); };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      mapInstance.current?.resize();
      if (!tourMode && storyMapMode) {
        setActiveLayer(storyChapter.layer);
        setSelectedId(null);
        mapInstance.current?.easeTo({ ...storyChapter.mapView, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 850 });
      }
    }, 80);
    return () => window.clearTimeout(timer);
  }, [mapInstance, storyChapter, storyIndex, storyMapMode, tourMode]);

  useEffect(() => {
    if (!selected) {
      drawerWasOpen.current = false;
      return;
    }
    const isFirstOpen = !drawerWasOpen.current;
    drawerWasOpen.current = true;
    if (drawerScroll.current) drawerScroll.current.scrollTop = 0;
    if (isFirstOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      closeButton.current?.focus();
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    mapInstance.current?.easeTo(cameraForPoint(selected, reduced ? 0 : 800, window.innerWidth < 700 ? [0, -210] : [-280, 0]));
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
      if (exhibitModule === "tour" && activeTourPoint) {
        setActiveLayer(activeTourPoint.layer);
        mapInstance.current?.easeTo(cameraForPoint(activeTourPoint, reduced ? 0 : 850));
      } else if (exhibitModule === "tour") {
        setActiveLayer(chapter.layer);
        mapInstance.current?.easeTo({ ...chapter.mapView, duration: reduced ? 0 : 850 });
      }
      if (exhibitModule === "field" && timelinePoint) mapInstance.current?.easeTo(cameraForPoint(timelinePoint, reduced ? 0 : 700));
      if (exhibitModule === "water") mapInstance.current?.easeTo({ ...waterStage.mapView, duration: reduced ? 0 : 800 });
      if (exhibitModule === "resources" && selectedResourcePoint) mapInstance.current?.easeTo(cameraForPoint(selectedResourcePoint, reduced ? 0 : 700));
      tourPanel.current?.focus();
    }, 80);
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, video, select, textarea")) return;
      if (event.key === "Escape") endTour();
      if (event.key === "ArrowRight") stepExhibit(1);
      if (event.key === "ArrowLeft") stepExhibit(-1);
      if (event.code === "Space" && exhibitModule === "tour" && !target?.matches("button, a")) { event.preventDefault(); toggleTourPlayback(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { window.clearTimeout(timer); window.removeEventListener("keydown", onKeyDown); };
    // Keyboard handlers intentionally use the current exhibit state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTourFrame?.id, activeTourPoint, chapter, exhibitModule, selectedResourcePoint, timelinePoint, tourIndex, tourMode, tourPlayback, waterStage]);

  function updateExhibitUrl(module: ExhibitModule | null, chapterIndex = tourIndex, replace = false) {
    const url = new URL(window.location.href);
    if (module) { url.searchParams.set("view", "exhibit"); url.searchParams.set("module", module); }
    else { url.searchParams.delete("view"); url.searchParams.delete("module"); }
    if (module === "tour" || module === null) url.searchParams.set("chapter", tourChapters[chapterIndex].id);
    else url.searchParams.delete("chapter");
    window.history[replace ? "replaceState" : "pushState"]({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  const handleStoryChapterChange = useCallback((index: number) => {
    const safeIndex = Math.max(0, Math.min(tourChapters.length - 1, index));
    setStoryIndex(safeIndex);
    const url = new URL(window.location.href);
    if (url.searchParams.get("view") !== "exhibit") {
      url.searchParams.set("chapter", tourChapters[safeIndex].id);
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  const handleStoryMapModeChange = useCallback((active: boolean) => {
    setStoryMapMode(active);
  }, []);
  const handleStoryTargetHandled = useCallback(() => setStoryTargetId(null), []);

  function resetChapterProgress() {
    chapterElapsedRef.current = 0;
    setChapterElapsedSeconds(0);
  }

  function startTour(initialIndex = 0, autoplay = false) {
    const safeIndex = Math.max(0, Math.min(tourChapters.length - 1, initialIndex));
    previousFocus.current = document.activeElement as HTMLElement;
    resetChapterProgress(); setTourIndex(safeIndex); setTourPlayback(autoplay ? "playing" : "idle"); setExhibitModule("tour"); setActiveLayer(tourChapters[safeIndex].layer); setSelectedId(null); setTourMode(true); updateExhibitUrl("tour", safeIndex);
  }

  function endTour() {
    setStoryIndex(tourIndex); resetChapterProgress(); setTourPlayback("idle"); setTourMode(false); updateExhibitUrl(null, tourIndex);
    window.setTimeout(() => { mapInstance.current?.resize(); previousFocus.current?.focus(); }, 90);
  }

  function selectExhibitModule(module: ExhibitModule) {
    if (module !== "tour" && tourPlayback === "playing") setTourPlayback("paused");
    setExhibitModule(module); setSelectedId(null);
    if (module === "tour") setActiveLayer(chapter.layer);
    if (module === "field") setActiveLayer("practice");
    if (module === "water") setActiveLayer("water");
    if (module === "resources") setActiveLayer("herbs");
    updateExhibitUrl(module, tourIndex);
  }

  function goToChapter(index: number) {
    const safeIndex = Math.max(0, Math.min(tourChapters.length - 1, index));
    resetChapterProgress(); setTourIndex(safeIndex); setActiveLayer(tourChapters[safeIndex].layer); setSelectedId(null);
    updateExhibitUrl("tour", safeIndex, true);
  }

  function seekTourToPoint(pointId: string) {
    const chapterIndex = tourChapters.findIndex((item) => item.pointIds.includes(pointId));
    if (chapterIndex < 0) return;
    const targetChapter = tourChapters[chapterIndex];
    const frames = chapterFramesById.get(targetChapter.id) ?? [];
    const frameIndex = frames.findIndex((frame) => frame.kind === "point" && frame.pointId === pointId);
    if (frameIndex < 0) return;
    const elapsedSeconds = frames.slice(0, frameIndex).reduce((total, frame) => total + frame.durationSeconds, 0);
    chapterElapsedRef.current = elapsedSeconds;
    setChapterElapsedSeconds(elapsedSeconds);
    setTourIndex(chapterIndex);
    setExhibitModule("tour");
    setActiveLayer(storyPointById.get(pointId)?.layer ?? targetChapter.layer);
    setSelectedId(null);
    if (tourPlayback === "playing") setTourPlayback("paused");
    updateExhibitUrl("tour", chapterIndex, true);
  }

  function toggleTourPlayback() {
    if (tourPlayback === "playing") { setTourPlayback("paused"); return; }
    if (tourPlayback === "completed") goToChapter(0);
    setTourPlayback("playing");
  }

  function leaveTourFor(anchorId: "map" | "sources") {
    endTour();
    window.setTimeout(() => document.getElementById(anchorId)?.scrollIntoView({ block: "start" }), 140);
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
    seekTourToPoint(pointId);
  }

  function activateRelationshipPoint(pointId: string) {
    const point = storyPointById.get(pointId);
    if (!point) return;
    setActiveLayer(point.layer);
    mapInstance.current?.easeTo(cameraForPoint(point, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650));
  }

  function closeStory() { setSelectedId(null); window.setTimeout(() => (previousFocus.current ?? mapSection.current)?.focus(), 0); }
  function resetMap() { mapInstance.current?.easeTo({ ...defaultView, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700 }); }
  async function toggleFullscreen() {
    if (!mapFrame.current) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await mapFrame.current.requestFullscreen();
      window.setTimeout(() => mapInstance.current?.resize(), 100);
    } catch {
      // Embedded and automated browsers may decline Fullscreen without making the map unusable.
    }
  }

  const mapSlot = <InteractiveMap sectionRef={mapSection} frameRef={mapFrame} containerRef={mapContainer} closeButtonRef={closeButton} drawerScrollRef={drawerScroll} activeLayer={activeLayer} activePoints={activePoints} selected={selected} selectedMedia={selectedMedia} selectedSources={selectedSources} mapReady={mapReady} mapFallback={mapFallback} mapProgress={mapProgress} storyMode={storyMapMode && !tourMode} storyChapter={storyChapter} onLayerChange={(layer) => { setActiveLayer(layer); setSelectedId(null); }} onPointActivate={activateMapPoint} onCloseStory={closeStory} onResetMap={resetMap} onToggleFullscreen={toggleFullscreen} />;

  return <main className={[tourMode ? "tour-mode" : "", storyMapMode && !tourMode ? "story-map-mode" : ""].filter(Boolean).join(" ")}>
    <LongFormPage mapSlot={mapSlot} showAllMedia={showAllMedia} onToggleMedia={() => setShowAllMedia((value) => !value)} onStartExhibit={startTour} storyIndex={storyIndex} storyTargetId={storyTargetId} onStoryChapterChange={handleStoryChapterChange} onStoryMapModeChange={handleStoryMapModeChange} onStoryTargetHandled={handleStoryTargetHandled} />
    {tourMode && <DigitalExhibit panelRef={tourPanel} module={exhibitModule} tourIndex={tourIndex} tourFrameIndex={activeTourFrameIndex} playback={tourPlayback} elapsedSeconds={totalElapsedSeconds} totalSeconds={totalTourSeconds} timelineDay={timelineDay} timelineCategory={timelineCategory} timelineIndex={timelineIndex} waterStageIndex={waterStageIndex} resourceIndex={resourceIndex} resourceSection={resourceSection} resourceView={resourceView} relationshipIndex={relationshipIndex} onEnd={endTour} onSelectModule={selectExhibitModule} onGoChapter={goToChapter} onTogglePlayback={toggleTourPlayback} onExploreMap={() => leaveTourFor("map")} onViewEvidence={() => leaveTourFor("sources")} onSetTimelineDay={(day) => { setTimelineDay(day); setTimelineCategory("全部"); setTimelineIndex(0); }} onSetTimelineCategory={(category) => { setTimelineCategory(category); setTimelineIndex(0); }} onSelectTimelineEvent={selectTimelineEvent} onSelectWaterStage={selectWaterStage} onSelectResource={selectResource} onSetResourceSection={setResourceSection} onSetResourceView={setResourceView} onSetRelationshipIndex={setRelationshipIndex} onActivateRelationshipPoint={activateRelationshipPoint} onStep={stepExhibit} onRestart={() => { const shouldResume = tourPlayback === "playing"; resetChapterProgress(); setTourIndex(0); setTourPlayback(shouldResume ? "playing" : "idle"); setTimelineIndex(0); setWaterStageIndex(0); setResourceIndex(0); setRelationshipIndex(0); setExhibitModule("tour"); setActiveLayer(tourChapters[0].layer); setSelectedId(null); updateExhibitUrl("tour", 0, true); }} />}
  </main>;
}
