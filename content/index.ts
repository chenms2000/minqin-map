export * from "./types";
export { publicAsset, siteBasePath } from "./public-assets";
export { sources } from "./sources";
export { media } from "./media";
export { backgroundMusicLicense, backgroundTracks } from "./audio";
export { storyPoints } from "./story-points";
export { timelineCategories, timelineEvents } from "./field-timeline";
export { fieldTracks } from "./field-tracks";
export { waterTimeline, waterStages } from "./water-stages";
export { herbs, relationshipEdges } from "./resources";
export { exhibitScenes, tourChapters } from "./exhibit-scenes";
export { chapterEvidenceById, chapterFramesById, sourceUsageById } from "./evidence-index";

import { media } from "./media";
import { sources } from "./sources";
import { storyPoints } from "./story-points";

export const mediaById = new Map(media.map((item) => [item.id, item]));
export const sourceById = new Map(sources.map((item) => [item.id, item]));
export const storyPointById = new Map(storyPoints.map((item) => [item.id, item]));
