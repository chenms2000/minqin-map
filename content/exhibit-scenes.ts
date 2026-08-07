import type { ExhibitScene, TourChapter } from "./types";

export const exhibitScenes: ExhibitScene[] = [
  { id: "hexi-entry", order: 1, title: "河西入境", eyebrow: "文化背景，不是实践路线", durationSeconds: 50, layer: "practice", mapView: { center: [102.88, 38.25], zoom: 8.25, pitch: 38, bearing: -12 }, pointIds: ["arrival-minqin"], leadMediaId: "journey-sky", narration: "从凉州—武威进入河西叙事。张骞与丝路只承担历史背景，虚线是讲述路径，不用于导航。", sourceIds: ["hexi-history"] },
  { id: "water-oasis", order: 2, title: "水写绿洲", eyebrow: "石羊河下游的时间切片", durationSeconds: 55, layer: "water", mapView: { center: [103.27, 38.76], zoom: 8.25, pitch: 46, bearing: -8 }, pointIds: ["hongyashan-reservoir", "shiyang-system", "qingtu-lake"], leadMediaId: "desert-sunset", narration: "红崖山水库、生态输水与青土湖共同解释‘治沙先治水’。所有数字保留年份，不混写成实时数据。", sourceIds: ["minqin-ecology", "system-restoration"] },
  { id: "field-days", order: 3, title: "两日实践", eyebrow: "8月3—4日团队影像记录", durationSeconds: 75, layer: "practice", mapView: { center: [103.36, 38.80], zoom: 9.0, pitch: 48, bearing: -10 }, pointIds: ["desert-observation", "watering-practice"], leadMediaId: "watering-video", narration: "第一天观察环境与沙生植物，第二天进入公益林基地浇水养护。无GPS与专业鉴定的内容始终保留边界。", sourceIds: [] },
  { id: "science-industry", order: 4, title: "科技与沙产业", eyebrow: "公开知识补充，不计入到访", durationSeconds: 65, layer: "herbs", mapView: { center: [103.28, 38.78], zoom: 8.65, pitch: 42, bearing: -5 }, pointIds: ["desert-botanical-garden", "cistanche-landscape", "planned-herbs"], leadMediaId: "berries-close", narration: "沙生植物园、治沙科研与梭梭—肉苁蓉链路拓展了知识背景；锁阳、板蓝根仍标作项目计划关注。", sourceIds: ["desert-garden", "desert-institute", "cistanche-industry"] },
  { id: "youth-guardians", order: 5, title: "青年守护", eyebrow: "一次实践进入长期维护", durationSeconds: 55, layer: "people", mapView: { center: [103.45, 38.82], zoom: 8.95, pitch: 48, bearing: -10 }, pointIds: ["zhong-lin"], leadMediaId: "volunteer-base", narration: "公开人物故事与团队劳动影像在兴隆村交汇。种树只是开始，补水、养护、记录与传播才构成长线行动。", sourceIds: ["minqin-volunteers", "minqin-base-report"] },
];

export const tourChapters: TourChapter[] = exhibitScenes;

