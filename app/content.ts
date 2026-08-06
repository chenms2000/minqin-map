export type StoryLayer = "practice" | "water" | "herbs" | "people";

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
};

export type StoryPoint = {
  id: string;
  layer: StoryLayer;
  title: string;
  eyebrow: string;
  coordinates: [number, number];
  accuracy: "县域叙事点" | "村级近似定位" | "公开知识点";
  date: string;
  summary: string;
  summaryEn: string;
  mediaIds: string[];
  sourceIds: string[];
  color: string;
};

export type HerbProfile = {
  id: string;
  name: string;
  latinLabel: string;
  tag: string;
  description: string;
  descriptionEn: string;
};

export const sources: SourceRef[] = [
  {
    id: "hexi-history",
    publisher: "丝绸之路（敦煌）国际文化博览会",
    title: "一条河西走廊，何以串起千年文明？",
    url: "https://www.gswbj.gov.cn/a/2023/09/21/18697.html",
    publishedAt: "2023-09-21",
  },
  {
    id: "minqin-ecology",
    publisher: "国家林业和草原局",
    title: "民勤：漠上绿洲生生不息",
    url: "https://www.forestry.gov.cn/c/www/xxgcjqdxal/513785.jhtml",
    publishedAt: "2023-07-12",
  },
  {
    id: "minqin-volunteers",
    publisher: "国家林业和草原局",
    title: "‘请到民勤种棵树’，缘何吸引数万青年志愿者",
    url: "https://www.forestry.gov.cn/lyj/1/kjzrjy/20260508/670031.html",
    publishedAt: "2026-05-08",
  },
];

export const media: MediaAsset[] = [
  { id: "journey-sky", type: "image", src: "/media/journey-sky.webp", alt: "列车窗外的田野、山地与云层", caption: "向河西走廊行进，地貌从农田渐入旱区。", capturedAt: "2026-08-03 12:52" },
  { id: "journey-village", type: "image", src: "/media/journey-village.webp", alt: "列车窗外的河西村落与山地", caption: "窗外的聚落与山地，构成进入河西的第一重空间印象。", capturedAt: "2026-08-03 13:12" },
  { id: "road-video", type: "video", src: "/media/road-to-minqin.mp4", poster: "/media/journey-village.webp", alt: "驶向民勤的公路影像", caption: "从武威方向驶向民勤，绿带、农田与荒漠依次出现。", capturedAt: "2026-08-03 15:02" },
  { id: "desert-sunset", type: "image", src: "/media/desert-sunset.webp", alt: "傍晚荒漠地平线上的落日", caption: "落日前的荒漠观察，光线勾勒出植被与沙地的边界。", capturedAt: "2026-08-03 20:00" },
  { id: "berries-close", type: "image", src: "/media/berries-close.webp", alt: "沙生植物红色果实的近景", caption: "现场记录的沙生植物。未经过专业鉴定，不在地图中标注具体药材名称。", capturedAt: "2026-08-03 20:23" },
  { id: "observation-video", type: "video", src: "/media/desert-observation.mp4", poster: "/media/berries-close.webp", alt: "团队观察沙生植物的短视频", caption: "从形态、果实与生境开始记录，而不是先给出结论。", capturedAt: "2026-08-03 20:05" },
  { id: "twilight-field", type: "image", src: "/media/twilight-field.webp", alt: "暮色中的荒漠与团队成员", caption: "一天实践结束前，团队继续采集环境与植物影像。", capturedAt: "2026-08-03 20:04" },
  { id: "night-flags", type: "image", src: "/media/night-flags.webp", alt: "夜色中迎风飘扬的公益旗帜", caption: "荒漠基地的夜晚：公益旗帜与志愿者留下的记忆。", capturedAt: "2026-08-03 20:41" },
  { id: "dawn-desert", type: "image", src: "/media/dawn-desert.webp", alt: "清晨的沙地与成排梭梭", caption: "清晨进入作业区域，观察苗木密度、风向与沙面状态。", capturedAt: "2026-08-04 07:52" },
  { id: "seedling", type: "image", src: "/media/seedling.webp", alt: "沙地中的幼苗近景", caption: "水抵达根部，幼苗才能在高蒸发环境中继续生长。", capturedAt: "2026-08-04 08:11" },
  { id: "team-walk", type: "image", src: "/media/team-walk.webp", alt: "团队携带工具走入公益林地", caption: "队员分组携带水管和工具进入林地。", capturedAt: "2026-08-04 08:10" },
  { id: "irrigation-line", type: "image", src: "/media/irrigation-line.webp", alt: "团队在沙地上展开浇水管线", caption: "铺设水管、寻找根部、控制水量，是苗木养护的连续动作。", capturedAt: "2026-08-04 09:03" },
  { id: "irrigation-video", type: "video", src: "/media/irrigation-arrival.mp4", poster: "/media/irrigation-line.webp", alt: "水车抵达林地的短视频", caption: "水车抵达后，团队沿管线分工协作。", capturedAt: "2026-08-04 08:37" },
  { id: "watering-video", type: "video", src: "/media/watering-together.mp4", poster: "/media/team-walk.webp", alt: "团队共同浇灌苗木的短视频", caption: "一次浇水看似简单，却是荒漠苗木长期维护中的关键环节。", capturedAt: "2026-08-04 08:37" },
  { id: "banner-team", type: "image", src: "/media/banner-team.webp", alt: "队员在荒漠中举起实践团旗帜", caption: "绿洲药韵·丝路智传实践团在作业现场。", capturedAt: "2026-08-04 09:06" },
  { id: "banner-landscape", type: "image", src: "/media/banner-landscape.webp", alt: "实践团旗帜与广阔沙地", caption: "旗帜之外，是需要久久为功的荒漠生态治理。", capturedAt: "2026-08-04 09:02" },
  { id: "sand-traces", type: "image", src: "/media/sand-traces.webp", alt: "沙面上的动物活动痕迹", caption: "沙面痕迹也是生态观察的一部分，记录环境中细微的生命活动。", capturedAt: "2026-08-04 09:11" },
  { id: "water-work", type: "image", src: "/media/water-work.webp", alt: "队员为沙地苗木浇水", caption: "水沿着人工挖出的浅坑汇入根部，减少无效流失。", capturedAt: "2026-08-04 09:12" },
  { id: "volunteer-base", type: "image", src: "/media/volunteer-base.webp", alt: "公益林基地里不同高校留下的手绘标牌", caption: "一块块手绘标牌，记录着跨越山海而来的青年志愿者。", capturedAt: "2026-08-04 10:35" },
  { id: "volunteer-signs", type: "image", src: "/media/volunteer-signs.webp", alt: "沙地苗木旁的志愿者手绘牌", caption: "社会力量持续参与，是民勤治沙图景中的重要一层。", capturedAt: "2026-08-04 10:35" },
];

export const storyPoints: StoryPoint[] = [
  {
    id: "arrival-minqin",
    layer: "practice",
    title: "从河西进入民勤",
    eyebrow: "实践足迹 · 起点",
    coordinates: [103.0938, 38.6247],
    accuracy: "县域叙事点",
    date: "2026.08.03",
    summary: "从武威方向进入民勤，团队首先记录沿途聚落、农田、绿带与荒漠之间的快速转换。这里标注的是县域叙事中心，不代表照片的精确拍摄坐标。",
    summaryEn: "The journey into Minqin reveals a rapid transition from settlements and farmland to shelterbelts and desert.",
    mediaIds: ["journey-sky", "journey-village", "road-video"],
    sourceIds: [],
    color: "#d95c3d",
  },
  {
    id: "desert-observation",
    layer: "practice",
    title: "沙生植物观察",
    eyebrow: "实践足迹 · 观察",
    coordinates: [103.22, 38.82],
    accuracy: "村级近似定位",
    date: "2026.08.03",
    summary: "团队对荒漠植被、果实和沙面状态进行影像采集。由于缺少GPS与专业鉴定记录，现场植物只标注为‘沙生植物观察’，不直接对应具体药材。",
    summaryEn: "Field notes focus on habitat and morphology; species are intentionally left unidentified until expert verification.",
    mediaIds: ["desert-sunset", "berries-close", "observation-video", "twilight-field", "night-flags"],
    sourceIds: [],
    color: "#cf7c3a",
  },
  {
    id: "watering-practice",
    layer: "practice",
    title: "公益林苗木养护",
    eyebrow: "实践足迹 · 行动",
    coordinates: [103.235, 38.835],
    accuracy: "村级近似定位",
    date: "2026.08.04",
    summary: "在民勤县种林公益发展中心相关基地开展浇水养护。点位仅落到公开报道确认的收成镇兴隆村层级，避免将推定位置伪装成精准坐标。",
    summaryEn: "Students joined routine watering and maintenance at a public-interest desert afforestation site near Xinglong Village.",
    mediaIds: ["dawn-desert", "seedling", "team-walk", "irrigation-line", "irrigation-video", "watering-video", "banner-team", "banner-landscape", "sand-traces", "water-work"],
    sourceIds: ["minqin-volunteers"],
    color: "#2f7658",
  },
  {
    id: "qingtu-lake",
    layer: "water",
    title: "青土湖：绿洲的晴雨表",
    eyebrow: "绿洲水脉 · 尾闾湖",
    coordinates: [103.56, 39.12],
    accuracy: "公开知识点",
    date: "1959—2023",
    summary: "青土湖是石羊河尾闾湖。公开资料记录：1959年完全干涸，2010年恢复约3平方公里水面，国家林草局2023年报道水域面积为27.65平方公里。不同数字均保留对应年份。",
    summaryEn: "Qingtu Lake records the oasis' recovery: dry in 1959, water returned in 2010, and a 27.65 km² water surface was reported in 2023.",
    mediaIds: [],
    sourceIds: ["minqin-ecology"],
    color: "#228aa1",
  },
  {
    id: "hongyashan-reservoir",
    layer: "water",
    title: "红崖山水库与生态输水",
    eyebrow: "绿洲水脉 · 调蓄",
    coordinates: [103.04, 38.42],
    accuracy: "公开知识点",
    date: "公开资料",
    summary: "红崖山水库通过生态输水连接石羊河下游与青土湖。地图以水脉动画表达‘治沙先治水’，不将示意线当作导航路线。",
    summaryEn: "Ecological water releases connect the lower Shiyang River system with Qingtu Lake, making water management central to restoration.",
    mediaIds: [],
    sourceIds: ["minqin-ecology"],
    color: "#228aa1",
  },
  {
    id: "herb-landscape",
    layer: "herbs",
    title: "荒漠药材资源",
    eyebrow: "药材产业 · 知识图层",
    coordinates: [103.14, 38.66],
    accuracy: "公开知识点",
    date: "资源概览",
    summary: "民勤项目重点关注甘草、肉苁蓉、锁阳和板蓝根。本节点用于展示资源类型与产业链框架，不声称团队已经走访具体企业，也不提供医疗建议。",
    summaryEn: "This knowledge layer introduces four medicinal resources and their value chain without making clinical claims or implying unverified site visits.",
    mediaIds: ["berries-close"],
    sourceIds: [],
    color: "#9b7b2f",
  },
  {
    id: "zhong-lin",
    layer: "people",
    title: "仲麟与青年公益治沙",
    eyebrow: "人物故事 · 公开资料",
    coordinates: [103.225, 38.83],
    accuracy: "村级近似定位",
    date: "2023—2026",
    summary: "公开报道记载，仲麟返乡投身公益治沙，并在兴隆村持续组织志愿种树与后续养护。本页面只转述公开信息，不虚构现场采访引语。",
    summaryEn: "Public reporting documents Zhong Lin's return to Minqin and his continued work organizing volunteer planting and maintenance.",
    mediaIds: ["volunteer-base", "volunteer-signs", "watering-video"],
    sourceIds: ["minqin-volunteers"],
    color: "#7a3f34",
  },
];

export const herbs: HerbProfile[] = [
  { id: "licorice", name: "甘草", latinLabel: "Glycyrrhiza spp.", tag: "耐旱资源", description: "项目申报材料列出的民勤特色药材之一。地图关注其生境、种植与初加工信息，不延伸到个体用药。", descriptionEn: "A drought-adapted medicinal resource introduced through habitat, cultivation and primary processing." },
  { id: "cistanche", name: "肉苁蓉", latinLabel: "Cistanche spp.", tag: "沙产业", description: "寄生型荒漠植物资源，常与固沙植物及沙产业协同讨论。展示重点是生态与产业如何形成关联。", descriptionEn: "A parasitic desert resource that connects ecological restoration with the local desert economy." },
  { id: "cynomorium", name: "锁阳", latinLabel: "Cynomorium songaricum", tag: "荒漠生境", description: "适应荒漠环境的寄生植物资源。页面仅呈现资源与文化背景，不提供功效宣传。", descriptionEn: "A parasitic plant of desert habitats, presented as a cultural and biological resource rather than a remedy." },
  { id: "isatis", name: "板蓝根", latinLabel: "Isatis indigotica", tag: "规模种植", description: "项目计划关注的药材类型之一，可从种植管理、采收、初加工和规范传播等环节理解其产业链。", descriptionEn: "A cultivated medicinal crop viewed through production, harvest, primary processing and responsible communication." },
];

export const waterTimeline = [
  { year: "1959", title: "青土湖完全干涸", note: "公开资料记录，湖区随后形成民勤北部的重要风沙口。" },
  { year: "2007", title: "流域重点治理启动", note: "节水、生态输水、固沙造林与植被修复协同推进。" },
  { year: "2010", title: "水面重新出现", note: "青土湖形成约3平方公里水面；该数字对应2010年。" },
  { year: "2023", title: "报道水域27.65平方公里", note: "采用国家林草局2023年报道口径，不表达为实时数据。" },
];

export const mediaById = new Map(media.map((item) => [item.id, item]));
export const sourceById = new Map(sources.map((item) => [item.id, item]));
