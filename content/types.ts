export type StoryLayer = "practice" | "water" | "herbs" | "people";
export type ContentOrigin = "团队实践" | "公开资料" | "项目计划";
export type EvidenceStatus = "团队影像记录" | "公开资料可核" | "项目计划关注";
export type LocationAccuracy = "县域叙事点" | "村级近似定位" | "公开知识点";

export type SourceRef = {
  id: string;
  publisher: string;
  title: string;
  url: string;
  publishedAt: string;
};

export type MediaAsset = {
  id: string;
  type: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  caption: string;
  capturedAt: string;
  featured: boolean;
};

export type StoryPoint = {
  id: string;
  layer: StoryLayer;
  title: string;
  eyebrow: string;
  coordinates: [number, number];
  accuracy: LocationAccuracy;
  locationNote: string;
  date: string;
  contentOrigin: ContentOrigin;
  evidenceStatus: EvidenceStatus;
  tourChapter: string;
  summary: string;
  summaryEn: string;
  mediaIds: string[];
  sourceIds: string[];
  color: string;
};

export type ResourceSectionKey = "habitat" | "ecology" | "cultivation" | "harvest" | "processing" | "communication";

export type ResourceProfile = {
  id: string;
  name: string;
  latinLabel: string;
  tag: string;
  evidenceLabel: "公开资料可核" | "项目计划关注";
  description: string;
  descriptionEn: string;
  sourceIds: string[];
  mapPointId: string;
  sections: Record<ResourceSectionKey, string>;
};

export type HerbProfile = ResourceProfile;

export type ExhibitScene = {
  id: string;
  order: number;
  title: string;
  eyebrow: string;
  durationSeconds: number;
  layer: StoryLayer;
  mapView: { center: [number, number]; zoom: number; pitch: number; bearing: number };
  pointIds: string[];
  leadMediaId: string;
  narration: string;
  sourceIds: string[];
};

export type TourChapter = ExhibitScene;

export type TimelineCategory = "旅途" | "观察" | "劳动" | "团队记录";

export type TimelineEvent = {
  id: string;
  capturedAt: string;
  day: "2026-08-03" | "2026-08-04";
  category: TimelineCategory;
  storyPointId: string;
  mediaId: string;
  locationAccuracy: LocationAccuracy;
  note: string;
};

export type WaterStage = {
  id: string;
  year: string;
  title: string;
  metric: string;
  unit: string;
  interpretation: string;
  pointId: string;
  mapView: { center: [number, number]; zoom: number; pitch: number; bearing: number };
  sourceIds: string[];
  geometryMode: "symbolic" | "verified";
};

export type RelationshipEdge = {
  id: string;
  fromPointId: string;
  toPointId: string;
  label: string;
  explanation: string;
};

