import { tourChapters } from "./exhibit-scenes";
import { media } from "./media";
import { herbs } from "./resources";
import { sources } from "./sources";
import { storyPoints } from "./story-points";
import type { ChapterEvidence, EvidenceUsage, TourFrame } from "./types";
import { waterStages } from "./water-stages";

const unique = (ids: string[]) => [...new Set(ids)];
const storyPointById = new Map(storyPoints.map((point) => [point.id, point]));
const mediaById = new Map(media.map((asset) => [asset.id, asset]));
const sourceById = new Map(sources.map((source) => [source.id, source]));
const TEXT_FRAME_SECONDS = 4;
const SOURCE_FRAME_SECONDS = 5.5;
const IMAGE_FRAME_SECONDS = 9;
const usedTourMediaIds = new Set<string>();

function frameDurationSeconds(mediaId?: string) {
  const asset = mediaById.get(mediaId ?? "");
  if (asset?.type === "video") return asset.durationSeconds ?? TEXT_FRAME_SECONDS;
  return asset?.type === "image" ? IMAGE_FRAME_SECONDS : TEXT_FRAME_SECONDS;
}

function claimTourMedia(ids: string[], type?: "image" | "video") {
  const mediaId = ids.find((id) => !usedTourMediaIds.has(id) && (!type || mediaById.get(id)?.type === type));
  if (mediaId) usedTourMediaIds.add(mediaId);
  return mediaId;
}

export const chapterEvidenceById = new Map<string, ChapterEvidence>(tourChapters.map((chapter) => {
  const points = chapter.pointIds.map((id) => storyPointById.get(id)).filter((point) => point !== undefined);
  const relatedWaterStages = waterStages.filter((stage) => chapter.pointIds.includes(stage.pointId));
  const relatedResources = herbs.filter((resource) => chapter.pointIds.includes(resource.mapPointId));
  return [chapter.id, {
    chapterId: chapter.id,
    directSourceIds: chapter.sourceIds ?? [],
    pointIds: chapter.pointIds,
    leadMediaId: chapter.leadMediaId,
    sourceIds: unique([
      ...(chapter.sourceIds ?? []),
      ...points.flatMap((point) => point.sourceIds ?? []),
      ...relatedWaterStages.flatMap((stage) => stage.sourceIds ?? []),
      ...relatedResources.flatMap((resource) => resource.sourceIds ?? []),
    ]),
    mediaIds: unique([chapter.leadMediaId, ...points.flatMap((point) => point.mediaIds)]),
  }];
}));

export const sourceUsageById = new Map<string, EvidenceUsage[]>(sources.map((source) => {
  const usages: EvidenceUsage[] = [];
  for (const chapter of tourChapters) if ((chapter.sourceIds ?? []).includes(source.id)) usages.push({ type: "chapter", id: chapter.id, label: chapter.title });
  for (const point of storyPoints) if ((point.sourceIds ?? []).includes(source.id)) usages.push({ type: "storyPoint", id: point.id, label: point.title });
  for (const stage of waterStages) if ((stage.sourceIds ?? []).includes(source.id)) usages.push({ type: "waterStage", id: stage.id, label: `水脉 ${stage.year}` });
  for (const resource of herbs) if ((resource.sourceIds ?? []).includes(source.id)) usages.push({ type: "resource", id: resource.id, label: resource.name });
  return [source.id, usages];
}));

export const chapterFramesById = new Map<string, TourFrame[]>(tourChapters.map((chapter) => {
  const evidence = chapterEvidenceById.get(chapter.id);
  const chapterPoints = chapter.pointIds.map((id) => storyPointById.get(id)).filter((point) => point !== undefined);
  const evidenceMediaIds = evidence?.mediaIds ?? [];
  const introMediaId = claimTourMedia([chapter.leadMediaId], "image")
    ?? claimTourMedia(evidenceMediaIds, "image")
    ?? claimTourMedia(evidenceMediaIds, "video");
  const frames: TourFrame[] = [{
    id: `${chapter.id}-intro`,
    kind: "intro",
    eyebrow: chapter.eyebrow,
    title: chapter.title,
    body: chapter.narration,
    mediaId: introMediaId,
    durationSeconds: frameDurationSeconds(introMediaId),
  }];

  for (const point of chapterPoints) {
    const pointMediaId = claimTourMedia(point.mediaIds.filter((id) => mediaById.get(id)?.featured), "image")
      ?? claimTourMedia(point.mediaIds, "image");
    frames.push({
      id: `${chapter.id}-point-${point.id}`,
      kind: "point",
      eyebrow: `${point.eyebrow} · ${point.accuracy}`,
      title: point.title,
      body: point.summary,
      pointId: point.id,
      mediaId: pointMediaId,
      durationSeconds: frameDurationSeconds(pointMediaId),
    });
  }

  for (const mediaId of evidence?.mediaIds ?? []) {
    if (mediaId === chapter.leadMediaId) continue;
    const asset = mediaById.get(mediaId);
    if (!asset || usedTourMediaIds.has(mediaId) || asset.type !== "video") continue;
    usedTourMediaIds.add(mediaId);
    const point = chapterPoints.find((item) => item.mediaIds.includes(mediaId));
    frames.push({
      id: `${chapter.id}-media-${mediaId}`,
      kind: "media",
      eyebrow: asset.type === "video" ? "现场视频 · 静音播放一次" : "现场影像 · 自动放映",
      title: point?.title ?? chapter.title,
      body: asset.caption,
      mediaId,
      pointId: point?.id,
      durationSeconds: frameDurationSeconds(mediaId),
    });
  }

  for (const sourceId of evidence?.sourceIds ?? []) {
    const source = sourceById.get(sourceId);
    if (!source) continue;
    const pointId = chapterPoints.find((point) => point.sourceIds.includes(sourceId))?.id
      ?? waterStages.find((stage) => chapter.pointIds.includes(stage.pointId) && stage.sourceIds.includes(sourceId))?.pointId
      ?? herbs.find((resource) => chapter.pointIds.includes(resource.mapPointId) && resource.sourceIds.includes(sourceId))?.mapPointId;
    frames.push({
      id: `${chapter.id}-source-${sourceId}`,
      kind: "source",
      eyebrow: `${source.publisher} · ${source.publishedAt}`,
      title: source.title,
      body: source.summary ?? "本条公开资料为当前章节提供背景依据。",
      sourceId,
      pointId,
      durationSeconds: SOURCE_FRAME_SECONDS,
    });
  }

  return [chapter.id, frames];
}));
