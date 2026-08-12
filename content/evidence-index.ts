import { tourChapters } from "./exhibit-scenes";
import { herbs } from "./resources";
import { sources } from "./sources";
import { storyPoints } from "./story-points";
import type { ChapterEvidence, EvidenceUsage } from "./types";
import { waterStages } from "./water-stages";

const unique = (ids: string[]) => [...new Set(ids)];
const storyPointById = new Map(storyPoints.map((point) => [point.id, point]));

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
