import type { TimelineCategory, TimelineEvent } from "./types";

export const timelineCategories: TimelineCategory[] = ["旅途", "观察", "科普", "传播", "劳动", "团队记录"];

export const timelineEvents: TimelineEvent[] = [
  { id: "event-journey-sky", capturedAt: "2026-08-03 12:52", day: "2026-08-03", category: "旅途", storyPointId: "arrival-minqin", mediaId: "journey-sky", locationAccuracy: "县域叙事点", note: "从农田与山地进入河西旱区的第一重观察。" },
  { id: "event-journey-village", capturedAt: "2026-08-03 13:12", day: "2026-08-03", category: "旅途", storyPointId: "arrival-minqin", mediaId: "journey-village", locationAccuracy: "县域叙事点", note: "记录沿途聚落、道路与地貌变化。" },
  { id: "event-road-video", capturedAt: "2026-08-03 15:02", day: "2026-08-03", category: "旅途", storyPointId: "arrival-minqin", mediaId: "road-video", locationAccuracy: "县域叙事点", note: "从武威方向驶向民勤的公路影像。" },
  { id: "event-desert-sunset", capturedAt: "2026-08-03 20:00", day: "2026-08-03", category: "观察", storyPointId: "desert-observation", mediaId: "desert-sunset", locationAccuracy: "GPS实拍点", note: "傍晚观察沙地、植被与光线形成的生境边界。" },
  { id: "event-twilight-field", capturedAt: "2026-08-03 20:04", day: "2026-08-03", category: "观察", storyPointId: "desert-observation", mediaId: "twilight-field", locationAccuracy: "GPS实拍点", note: "暮色中继续采集环境与植物影像。" },
  { id: "event-observation-video", capturedAt: "2026-08-03 20:05", day: "2026-08-03", category: "观察", storyPointId: "desert-observation", mediaId: "observation-video", locationAccuracy: "GPS实拍点", note: "记录形态与生境，不先进行植物鉴定。" },
  { id: "event-berries-close", capturedAt: "2026-08-03 20:23", day: "2026-08-03", category: "观察", storyPointId: "desert-observation", mediaId: "berries-close", locationAccuracy: "GPS实拍点", note: "未经过专业鉴定的沙生植物近景。" },
  { id: "event-night-flags", capturedAt: "2026-08-03 20:41", day: "2026-08-03", category: "团队记录", storyPointId: "base-activity-center", mediaId: "night-flags", locationAccuracy: "GPS实拍点", note: "夜间记录公益旗帜与基地环境。" },
  { id: "event-dawn-desert", capturedAt: "2026-08-04 07:52", day: "2026-08-04", category: "观察", storyPointId: "watering-practice", mediaId: "dawn-desert", locationAccuracy: "GPS实拍点", note: "清晨进入作业区域，观察苗木与沙面状态。" },
  { id: "event-team-walk", capturedAt: "2026-08-04 08:10", day: "2026-08-04", category: "劳动", storyPointId: "watering-practice", mediaId: "team-walk", locationAccuracy: "GPS实拍点", note: "分组携带水管和工具进入林地。" },
  { id: "event-seedling", capturedAt: "2026-08-04 08:11", day: "2026-08-04", category: "观察", storyPointId: "watering-practice", mediaId: "seedling", locationAccuracy: "GPS实拍点", note: "记录幼苗、根部浅坑与水分抵达状态。" },
  { id: "event-irrigation-video", capturedAt: "2026-08-04 08:37", day: "2026-08-04", category: "劳动", storyPointId: "watering-practice", mediaId: "irrigation-video", locationAccuracy: "GPS实拍点", note: "水车抵达后沿管线开展协作。" },
  { id: "event-watering-video", capturedAt: "2026-08-04 08:38", day: "2026-08-04", category: "劳动", storyPointId: "watering-practice", mediaId: "watering-video", locationAccuracy: "GPS实拍点", note: "团队共同为苗木浇水养护。" },
  { id: "event-banner-landscape", capturedAt: "2026-08-04 09:02", day: "2026-08-04", category: "团队记录", storyPointId: "watering-practice", mediaId: "banner-landscape", locationAccuracy: "GPS实拍点", note: "在广阔沙地中记录项目身份与环境尺度。" },
  { id: "event-irrigation-line", capturedAt: "2026-08-04 09:03", day: "2026-08-04", category: "劳动", storyPointId: "watering-practice", mediaId: "irrigation-line", locationAccuracy: "GPS实拍点", note: "铺设管线、寻找根部并控制水量。" },
  { id: "event-banner-team", capturedAt: "2026-08-04 09:06", day: "2026-08-04", category: "团队记录", storyPointId: "watering-practice", mediaId: "banner-team", locationAccuracy: "GPS实拍点", note: "实践团在作业现场完成团队记录。" },
  { id: "event-sand-traces", capturedAt: "2026-08-04 09:11", day: "2026-08-04", category: "观察", storyPointId: "watering-practice", mediaId: "sand-traces", locationAccuracy: "GPS实拍点", note: "沙面活动痕迹构成生态观察的一部分。" },
  { id: "event-water-work", capturedAt: "2026-08-04 09:12", day: "2026-08-04", category: "劳动", storyPointId: "watering-practice", mediaId: "water-work", locationAccuracy: "GPS实拍点", note: "水沿浅坑汇入根部，减少无效流失。" },
  { id: "event-volunteer-base", capturedAt: "2026-08-04 10:35", day: "2026-08-04", category: "团队记录", storyPointId: "base-activity-center", mediaId: "volunteer-base", locationAccuracy: "GPS实拍点", note: "不同高校留下的标牌构成长期志愿行动记录。" },
  { id: "event-volunteer-signs", capturedAt: "2026-08-04 10:36", day: "2026-08-04", category: "团队记录", storyPointId: "base-activity-center", mediaId: "volunteer-signs", locationAccuracy: "GPS实拍点", note: "青年参与在一块块手绘牌中留下可见痕迹。" },
  { id: "event-base-dune-installation", capturedAt: "2026-08-03 17:52", day: "2026-08-03", category: "团队记录", storyPointId: "base-activity-center", mediaId: "base-dune-installation", locationAccuracy: "GPS实拍点", note: "以沙丘、公益装置和基地设施建立活动环境记录。" },
  { id: "event-fruit-sunset-team", capturedAt: "2026-08-03 19:48", day: "2026-08-03", category: "观察", storyPointId: "desert-observation", mediaId: "fruit-sunset-team", locationAccuracy: "GPS实拍点", note: "落日前进入采摘观察区域。" },
  { id: "event-fruit-field-video", capturedAt: "2026-08-03 19:49", day: "2026-08-03", category: "观察", storyPointId: "desert-observation", mediaId: "fruit-field-video", locationAccuracy: "GPS实拍点", note: "记录采摘观察现场的连续画面。" },
  { id: "event-fruit-picking", capturedAt: "2026-08-03 19:54", day: "2026-08-03", category: "观察", storyPointId: "desert-observation", mediaId: "fruit-picking", locationAccuracy: "GPS实拍点", note: "白刺果采摘记录，植物名称待专业核验。" },
  { id: "event-fruit-bearing-shrub", capturedAt: "2026-08-03 20:01", day: "2026-08-03", category: "观察", storyPointId: "desert-observation", mediaId: "fruit-bearing-shrub", locationAccuracy: "GPS实拍点", note: "观察果实分布、植株形态与周边生境。" },
  { id: "event-fruit-collection", capturedAt: "2026-08-03 20:05", day: "2026-08-03", category: "观察", storyPointId: "desert-observation", mediaId: "fruit-collection", locationAccuracy: "GPS实拍点", note: "记录果实采集过程，不作药材鉴定。" },
  { id: "event-fruit-drying", capturedAt: "2026-08-03 20:44", day: "2026-08-03", category: "观察", storyPointId: "desert-observation", mediaId: "fruit-drying", locationAccuracy: "GPS实拍点", note: "记录采集后果实的摊开整理。" },
  { id: "event-heat-science-presenter", capturedAt: "2026-08-03 21:03", day: "2026-08-03", category: "科普", storyPointId: "base-activity-center", mediaId: "heat-science-presenter", locationAccuracy: "GPS实拍点", note: "开展中暑预防主题科普，只记录活动过程。" },
  { id: "event-heat-science-audience", capturedAt: "2026-08-03 21:17", day: "2026-08-03", category: "科普", storyPointId: "base-activity-center", mediaId: "heat-science-audience", locationAccuracy: "GPS实拍点", note: "队员围坐参与夜间科普交流。" },
  { id: "event-heat-science-video", capturedAt: "2026-08-03 21:18", day: "2026-08-03", category: "科普", storyPointId: "base-activity-center", mediaId: "heat-science-video", locationAccuracy: "GPS实拍点", note: "记录主题讲解、互动演示与队员参与。" },
  { id: "event-heat-science-slides", capturedAt: "2026-08-03 21:23", day: "2026-08-03", category: "科普", storyPointId: "base-activity-center", mediaId: "heat-science-slides", locationAccuracy: "GPS实拍点", note: "结合演示材料组织科普说明。" },
  { id: "event-heat-science-demo", capturedAt: "2026-08-03 21:31", day: "2026-08-03", category: "科普", storyPointId: "base-activity-center", mediaId: "heat-science-demo", locationAccuracy: "GPS实拍点", note: "记录科普活动中的互动演示。" },
  { id: "event-live-melon-still", capturedAt: "2026-08-03", timeLabel: "8月3日深夜", day: "2026-08-03", category: "传播", storyPointId: "base-activity-center", mediaId: "live-melon-still", locationAccuracy: "GPS实拍点", note: "记录队员以直播画面介绍当地西瓜的传播尝试。" },
  { id: "event-live-melon-video", capturedAt: "2026-08-03", timeLabel: "8月3日深夜", day: "2026-08-03", category: "传播", storyPointId: "base-activity-center", mediaId: "live-melon-video", locationAccuracy: "GPS实拍点", note: "隐私裁剪画面只保留人物与西瓜。" },
  { id: "event-watering-truck", capturedAt: "2026-08-04 08:03", day: "2026-08-04", category: "劳动", storyPointId: "watering-practice", mediaId: "watering-truck", locationAccuracy: "GPS实拍点", note: "记录供水车辆与清晨作业环境。" },
  { id: "event-watering-hose-team", capturedAt: "2026-08-04 08:13", day: "2026-08-04", category: "劳动", storyPointId: "watering-practice", mediaId: "watering-hose-team", locationAccuracy: "GPS实拍点", note: "队员协作展开水管进入维护区域。" },
  { id: "event-water-flow-video", capturedAt: "2026-08-04 08:25", day: "2026-08-04", category: "劳动", storyPointId: "watering-practice", mediaId: "water-flow-video", locationAccuracy: "GPS实拍点", note: "水流进入苗木根部的连续记录。" },
  { id: "event-watering-field-walk", capturedAt: "2026-08-04 08:35", day: "2026-08-04", category: "劳动", storyPointId: "watering-practice", mediaId: "watering-field-walk", locationAccuracy: "GPS实拍点", note: "队员在分散的苗木之间移动。" },
  { id: "event-watering-shrub-detail", capturedAt: "2026-08-04 09:09", day: "2026-08-04", category: "观察", storyPointId: "watering-practice", mediaId: "watering-shrub-detail", locationAccuracy: "GPS实拍点", note: "记录苗木根部和周边沙面状态。" },
  { id: "event-watering-action", capturedAt: "2026-08-04 09:48", day: "2026-08-04", category: "劳动", storyPointId: "watering-practice", mediaId: "watering-action", locationAccuracy: "GPS实拍点", note: "持续为分散苗木补水养护。" },
  { id: "event-volunteer-sign-field", capturedAt: "2026-08-04 10:37", day: "2026-08-04", category: "团队记录", storyPointId: "base-activity-center", mediaId: "volunteer-sign-field", locationAccuracy: "GPS实拍点", note: "记录基地内成片的志愿者标牌。" },
  { id: "event-forest-technical-board", capturedAt: "2026-08-04 16:22", day: "2026-08-04", category: "团队记录", storyPointId: "base-activity-center", mediaId: "forest-technical-board", locationAccuracy: "GPS实拍点", note: "记录基地公益治沙造林技术规程展板。" },
  { id: "event-sunset-flags-base", capturedAt: "2026-08-04 19:31", day: "2026-08-04", category: "团队记录", storyPointId: "base-activity-center", mediaId: "sunset-flags-base", locationAccuracy: "GPS实拍点", note: "夕阳下记录基地、沙丘与公益旗帜。" },
].sort((a, b) => {
  const aKey = a.capturedAt.length === 10 ? `${a.capturedAt} 23:59:59` : a.capturedAt;
  const bKey = b.capturedAt.length === 10 ? `${b.capturedAt} 23:59:59` : b.capturedAt;
  return aKey.localeCompare(bKey);
});
