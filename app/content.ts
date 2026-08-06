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

export type HerbProfile = {
  id: string;
  name: string;
  latinLabel: string;
  tag: string;
  evidenceLabel: "公开资料可核" | "项目计划关注";
  description: string;
  descriptionEn: string;
  sourceIds: string[];
};

export type TourChapter = {
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

export const sources: SourceRef[] = [
  { id: "hexi-history", publisher: "丝绸之路（敦煌）国际文化博览会", title: "一条河西走廊，何以串起千年文明？", url: "https://www.gswbj.gov.cn/a/2023/09/21/18697.html", publishedAt: "2023-09-21" },
  { id: "minqin-ecology", publisher: "国家林业和草原局", title: "民勤：漠上绿洲生生不息", url: "https://www.forestry.gov.cn/c/www/xxgcjqdxal/513785.jhtml", publishedAt: "2023-07-12" },
  { id: "system-restoration", publisher: "国家林业和草原局", title: "民勤系统治沙与石羊河流域治理实践", url: "https://www.forestry.gov.cn/c/www/xxgcjqdxal/547094.jhtml", publishedAt: "公开资料" },
  { id: "desert-garden", publisher: "国家林业和草原局", title: "甘肃民勤沙生植物园守护荒漠植物资源", url: "https://www.forestry.gov.cn/lyj/1/lhgzdt/20260611/675938.html", publishedAt: "2026-06-11" },
  { id: "desert-institute", publisher: "国家林业和草原局", title: "甘肃省治沙研究所民勤治沙研究", url: "https://www.forestry.gov.cn/c/www/sbjs/586525.jhtml", publishedAt: "公开资料" },
  { id: "minqin-volunteers", publisher: "人民网甘肃频道", title: "‘请到民勤种棵树’，缘何吸引数万青年志愿者", url: "https://gs.people.com.cn/BIG5/n2/2026/0508/c358184-41574026.html", publishedAt: "2026-05-08" },
  { id: "minqin-base-report", publisher: "国家林业和草原局（来源：新华网）", title: "跨越山海种树护绿", url: "https://www.forestry.gov.cn/lyj/1/dfdt/20260423/668473.html", publishedAt: "2026-04-23" },
  { id: "cistanche-industry", publisher: "中国生态文明网", title: "民勤梭梭—肉苁蓉生态沙产业资料", url: "https://www.eco.gov.cn/news_info/28258.html", publishedAt: "公开资料" },
];

export const media: MediaAsset[] = [
  { id: "journey-sky", type: "image", src: "/media/journey-sky.webp", alt: "列车窗外的田野、山地与云层", caption: "向河西走廊行进，地貌从农田渐入旱区。", capturedAt: "2026-08-03 12:52", featured: true },
  { id: "journey-village", type: "image", src: "/media/journey-village.webp", alt: "列车窗外的河西村落与山地", caption: "窗外的聚落与山地，构成进入河西的第一重空间印象。", capturedAt: "2026-08-03 13:12", featured: false },
  { id: "road-video", type: "video", src: "/media/road-to-minqin.mp4", poster: "/media/journey-village.webp", alt: "驶向民勤的公路影像", caption: "从武威方向驶向民勤，绿带、农田与荒漠依次出现。", capturedAt: "2026-08-03 15:02", featured: true },
  { id: "desert-sunset", type: "image", src: "/media/desert-sunset.webp", alt: "傍晚荒漠地平线上的落日", caption: "落日前的荒漠观察，光线勾勒出植被与沙地的边界。", capturedAt: "2026-08-03 20:00", featured: true },
  { id: "berries-close", type: "image", src: "/media/berries-close.webp", alt: "沙生植物红色果实的近景", caption: "现场记录的沙生植物。未经过专业鉴定，不标注具体药材名称。", capturedAt: "2026-08-03 20:23", featured: true },
  { id: "observation-video", type: "video", src: "/media/desert-observation.mp4", poster: "/media/berries-close.webp", alt: "团队观察沙生植物的短视频", caption: "从形态、果实与生境开始记录，而不是先给出结论。", capturedAt: "2026-08-03 20:05", featured: false },
  { id: "twilight-field", type: "image", src: "/media/twilight-field.webp", alt: "暮色中的荒漠与团队成员", caption: "一天实践结束前，团队继续采集环境与植物影像。", capturedAt: "2026-08-03 20:04", featured: false },
  { id: "night-flags", type: "image", src: "/media/night-flags.webp", alt: "夜色中迎风飘扬的公益旗帜", caption: "荒漠基地的夜晚：公益旗帜与志愿者留下的记忆。", capturedAt: "2026-08-03 20:41", featured: false },
  { id: "dawn-desert", type: "image", src: "/media/dawn-desert.webp", alt: "清晨的沙地与成排梭梭", caption: "清晨进入作业区域，观察苗木密度、风向与沙面状态。", capturedAt: "2026-08-04 07:52", featured: true },
  { id: "seedling", type: "image", src: "/media/seedling.webp", alt: "沙地中的幼苗近景", caption: "水抵达根部，幼苗才能在高蒸发环境中继续生长。", capturedAt: "2026-08-04 08:11", featured: false },
  { id: "team-walk", type: "image", src: "/media/team-walk.webp", alt: "团队携带工具走入公益林地", caption: "队员分组携带水管和工具进入林地。", capturedAt: "2026-08-04 08:10", featured: true },
  { id: "irrigation-line", type: "image", src: "/media/irrigation-line.webp", alt: "团队在沙地上展开浇水管线", caption: "铺设水管、寻找根部、控制水量，是苗木养护的连续动作。", capturedAt: "2026-08-04 09:03", featured: true },
  { id: "irrigation-video", type: "video", src: "/media/irrigation-arrival.mp4", poster: "/media/irrigation-line.webp", alt: "水车抵达林地的短视频", caption: "水车抵达后，团队沿管线分工协作。", capturedAt: "2026-08-04 08:37", featured: false },
  { id: "watering-video", type: "video", src: "/media/watering-together.mp4", poster: "/media/team-walk.webp", alt: "团队共同浇灌苗木的短视频", caption: "一次浇水看似简单，却是荒漠苗木长期维护中的关键环节。", capturedAt: "2026-08-04 08:37", featured: true },
  { id: "banner-team", type: "image", src: "/media/banner-team.webp", alt: "队员在荒漠中举起实践团旗帜", caption: "绿洲药韵·丝路智传实践团在作业现场。", capturedAt: "2026-08-04 09:06", featured: true },
  { id: "banner-landscape", type: "image", src: "/media/banner-landscape.webp", alt: "实践团旗帜与广阔沙地", caption: "旗帜之外，是需要久久为功的荒漠生态治理。", capturedAt: "2026-08-04 09:02", featured: false },
  { id: "sand-traces", type: "image", src: "/media/sand-traces.webp", alt: "沙面上的动物活动痕迹", caption: "沙面痕迹也是生态观察的一部分，记录环境中细微的生命活动。", capturedAt: "2026-08-04 09:11", featured: false },
  { id: "water-work", type: "image", src: "/media/water-work.webp", alt: "队员为沙地苗木浇水", caption: "水沿着人工挖出的浅坑汇入根部，减少无效流失。", capturedAt: "2026-08-04 09:12", featured: false },
  { id: "volunteer-base", type: "image", src: "/media/volunteer-base.webp", alt: "公益林基地里不同高校留下的手绘标牌", caption: "一块块手绘标牌，记录着跨越山海而来的青年志愿者。", capturedAt: "2026-08-04 10:35", featured: true },
  { id: "volunteer-signs", type: "image", src: "/media/volunteer-signs.webp", alt: "沙地苗木旁的志愿者手绘牌", caption: "社会力量持续参与，是民勤治沙图景中的重要一层。", capturedAt: "2026-08-04 10:35", featured: false },
];

export const storyPoints: StoryPoint[] = [
  { id: "arrival-minqin", layer: "practice", title: "从河西进入民勤", eyebrow: "实践足迹 · 起点", coordinates: [103.0938, 38.6247], accuracy: "县域叙事点", locationNote: "以民勤县城作为入境叙事中心，不代表照片拍摄坐标。", date: "2026.08.03", contentOrigin: "团队实践", evidenceStatus: "团队影像记录", tourChapter: "hexi-entry", summary: "从武威方向进入民勤，团队记录沿途聚落、农田、绿带与荒漠之间的快速转换。", summaryEn: "The journey into Minqin reveals a rapid transition from settlements and farmland to shelterbelts and desert.", mediaIds: ["journey-sky", "journey-village", "road-video"], sourceIds: [], color: "#d95c3d" },
  { id: "desert-observation", layer: "practice", title: "沙生植物观察", eyebrow: "实践足迹 · 观察", coordinates: [103.22, 38.82], accuracy: "村级近似定位", locationNote: "未附GPS记录，点位仅表达县域北部的观察情境。", date: "2026.08.03", contentOrigin: "团队实践", evidenceStatus: "团队影像记录", tourChapter: "field-days", summary: "团队对荒漠植被、果实和沙面状态进行影像采集。缺少专业鉴定记录，统一标注为‘沙生植物观察’。", summaryEn: "Field notes focus on habitat and morphology; species remain unidentified until expert verification.", mediaIds: ["desert-sunset", "berries-close", "observation-video", "twilight-field", "night-flags"], sourceIds: [], color: "#cf7c3a" },
  { id: "watering-practice", layer: "practice", title: "种林公益发展中心公益林基地", eyebrow: "实践足迹 · 公益林养护", coordinates: [103.59, 38.88], accuracy: "村级近似定位", locationNote: "公开报道确认基地位于收成镇兴隆村；当前坐标为村级近似定位，非导航坐标。", date: "2026.08.04", contentOrigin: "团队实践", evidenceStatus: "团队影像记录", tourChapter: "field-days", summary: "团队在公益林基地开展浇水养护、苗木观察和影像记录。收到正式经纬度前，仅定位到收成镇兴隆村层级。", summaryEn: "The team carried out watering and field documentation at the public-interest forest base, located here only at village level.", mediaIds: ["dawn-desert", "seedling", "team-walk", "irrigation-line", "irrigation-video", "watering-video", "banner-team", "banner-landscape", "sand-traces", "water-work"], sourceIds: ["minqin-volunteers", "minqin-base-report"], color: "#2f7658" },
  { id: "qingtu-lake", layer: "water", title: "青土湖：绿洲的晴雨表", eyebrow: "绿洲水脉 · 尾闾湖", coordinates: [103.56, 39.12], accuracy: "公开知识点", locationNote: "依据公开地理资料标示尾闾湖区域，仅用于知识浏览。", date: "1959—2023", contentOrigin: "公开资料", evidenceStatus: "公开资料可核", tourChapter: "water-oasis", summary: "青土湖是石羊河尾闾湖。公开资料记录1959年完全干涸、2010年恢复约3平方公里水面，2023年报道水域面积27.65平方公里；数字均保留对应年份。", summaryEn: "Qingtu Lake records the oasis' recovery through dated public figures rather than a live statistic.", mediaIds: [], sourceIds: ["minqin-ecology", "system-restoration"], color: "#228aa1" },
  { id: "hongyashan-reservoir", layer: "water", title: "红崖山水库", eyebrow: "绿洲水脉 · 调蓄", coordinates: [103.04, 38.42], accuracy: "公开知识点", locationNote: "公开地理知识点；水脉线为叙事示意，不是河道测绘或导航路线。", date: "公开资料", contentOrigin: "公开资料", evidenceStatus: "公开资料可核", tourChapter: "water-oasis", summary: "红崖山水库及石羊河下游生态输水，是理解民勤‘治沙先治水’的重要入口。", summaryEn: "Hongyashan Reservoir and ecological water releases are central to understanding restoration in the lower Shiyang River basin.", mediaIds: [], sourceIds: ["minqin-ecology", "system-restoration"], color: "#228aa1" },
  { id: "shiyang-system", layer: "water", title: "石羊河系统治理", eyebrow: "绿洲水脉 · 流域", coordinates: [103.20, 38.70], accuracy: "公开知识点", locationNote: "县域尺度的流域治理叙事点，不表示单项工程位置。", date: "2007—至今", contentOrigin: "公开资料", evidenceStatus: "公开资料可核", tourChapter: "water-oasis", summary: "节水、生态输水、固沙造林与植被修复共同构成系统治理。本节点只梳理公开资料中的治理关系。", summaryEn: "Water saving, ecological releases, shelterbelts and vegetation recovery form an integrated restoration system.", mediaIds: [], sourceIds: ["system-restoration"], color: "#228aa1" },
  { id: "desert-botanical-garden", layer: "herbs", title: "民勤沙生植物园", eyebrow: "药材产业 · 资源保育", coordinates: [103.12, 38.68], accuracy: "公开知识点", locationNote: "县域图示点位，访问前请以机构公开地址为准。", date: "1974—2026", contentOrigin: "公开资料", evidenceStatus: "公开资料可核", tourChapter: "science-industry", summary: "公开资料介绍，民勤沙生植物园长期开展荒漠植物资源保存、科研监测与科普工作，是理解沙生植物资源的重要知识节点。", summaryEn: "The Minqin Desert Botanical Garden supports conservation, research and public education around desert plant resources.", mediaIds: [], sourceIds: ["desert-garden", "desert-institute"], color: "#9b7b2f" },
  { id: "cistanche-landscape", layer: "herbs", title: "梭梭—肉苁蓉沙产业", eyebrow: "药材产业 · 生态链路", coordinates: [103.48, 38.91], accuracy: "公开知识点", locationNote: "县域产业知识点，不代表某一企业、基地或团队到访位置。", date: "公开资料", contentOrigin: "公开资料", evidenceStatus: "公开资料可核", tourChapter: "science-industry", summary: "公开资料将梭梭固沙与肉苁蓉资源利用联系起来。页面只介绍生态—产业关联，不提供企业规模和医疗功效信息。", summaryEn: "Public sources connect Haloxylon shelterbelts with Cistanche cultivation as an ecological desert-industry model.", mediaIds: [], sourceIds: ["cistanche-industry"], color: "#9b7b2f" },
  { id: "planned-herbs", layer: "herbs", title: "项目计划关注药材", eyebrow: "药材产业 · 内容边界", coordinates: [103.0938, 38.6247], accuracy: "公开知识点", locationNote: "内容索引点，不表示种植基地或团队走访位置。", date: "2026项目计划", contentOrigin: "项目计划", evidenceStatus: "项目计划关注", tourChapter: "science-industry", summary: "甘草、肉苁蓉、锁阳和板蓝根来自项目计划的关注范围。锁阳与板蓝根不在首期中表述为团队已调查或当地规模生产。", summaryEn: "Four herbs belong to the project scope; the first release does not imply completed fieldwork or scaled local production for every item.", mediaIds: ["berries-close"], sourceIds: [], color: "#9b7b2f" },
  { id: "desert-research-institute", layer: "people", title: "甘肃省治沙研究所", eyebrow: "人物故事 · 科技支撑", coordinates: [103.10, 38.64], accuracy: "公开知识点", locationNote: "县域知识点，用于呈现长期科研与监测网络，不作为到访记录。", date: "公开资料", contentOrigin: "公开资料", evidenceStatus: "公开资料可核", tourChapter: "science-industry", summary: "公开资料显示，科研人员在民勤长期开展荒漠化监测与治沙技术研究，为当地生态治理提供持续的科技支撑。", summaryEn: "Long-term field monitoring and desertification research provide scientific support for restoration in Minqin.", mediaIds: [], sourceIds: ["desert-institute"], color: "#7a3f34" },
  { id: "zhong-lin", layer: "people", title: "仲麟与青年公益治沙", eyebrow: "人物故事 · 公开资料", coordinates: [103.59, 38.88], accuracy: "村级近似定位", locationNote: "公开报道定位至收成镇兴隆村；非人物住址、非精确基地坐标。", date: "2023—2026", contentOrigin: "公开资料", evidenceStatus: "公开资料可核", tourChapter: "youth-guardians", summary: "公开报道记载，仲麟返乡投身公益治沙，并在兴隆村组织志愿种树与后续养护。本页面不虚构现场采访引语。", summaryEn: "Public reporting documents Zhong Lin's return to Minqin and continued volunteer planting and maintenance work.", mediaIds: ["volunteer-base", "volunteer-signs", "watering-video"], sourceIds: ["minqin-volunteers", "minqin-base-report"], color: "#7a3f34" },
];

export const herbs: HerbProfile[] = [
  { id: "licorice", name: "甘草", latinLabel: "Glycyrrhiza spp.", tag: "耐旱资源", evidenceLabel: "公开资料可核", description: "项目关注的民勤特色资源之一。首期从生境、资源与初加工角度介绍，不延伸到个体用药。", descriptionEn: "A drought-adapted medicinal resource introduced through habitat and responsible processing.", sourceIds: ["desert-garden"] },
  { id: "cistanche", name: "肉苁蓉", latinLabel: "Cistanche spp.", tag: "沙产业", evidenceLabel: "公开资料可核", description: "公开资料可支持其与梭梭固沙及沙产业的关联；页面不宣传医疗功效。", descriptionEn: "A desert resource connecting ecological restoration with a responsible local value chain.", sourceIds: ["cistanche-industry"] },
  { id: "cynomorium", name: "锁阳", latinLabel: "Cynomorium songaricum", tag: "荒漠生境", evidenceLabel: "项目计划关注", description: "属于项目计划的关注对象。首期不表述为团队已实地鉴定或当地已规模生产。", descriptionEn: "A planned research focus, not a claim of completed field identification or local production.", sourceIds: [] },
  { id: "isatis", name: "板蓝根", latinLabel: "Isatis indigotica", tag: "种植链路", evidenceLabel: "项目计划关注", description: "属于项目计划的关注对象，可作为种植—采收—加工—传播链路的内容框架。", descriptionEn: "A project-scope crop used to frame a responsible production and communication chain.", sourceIds: [] },
];

export const waterTimeline = [
  { year: "1959", title: "青土湖完全干涸", note: "公开资料记录，湖区随后形成民勤北部的重要风沙口。", sourceId: "minqin-ecology" },
  { year: "2007", title: "流域重点治理启动", note: "节水、生态输水、固沙造林与植被修复协同推进。", sourceId: "system-restoration" },
  { year: "2010", title: "水面重新出现", note: "青土湖形成约3平方公里水面；该数字对应2010年。", sourceId: "minqin-ecology" },
  { year: "2023", title: "报道水域27.65平方公里", note: "采用国家林草局2023年报道口径，不表达为实时数据。", sourceId: "minqin-ecology" },
];

export const tourChapters: TourChapter[] = [
  { id: "hexi-entry", order: 1, title: "河西入境", eyebrow: "文化背景，不是实践路线", durationSeconds: 50, layer: "practice", mapView: { center: [102.88, 38.25], zoom: 8.25, pitch: 38, bearing: -12 }, pointIds: ["arrival-minqin"], leadMediaId: "journey-sky", narration: "从凉州—武威进入河西叙事。张骞与丝路只承担历史背景，虚线是讲述路径，不用于导航。", sourceIds: ["hexi-history"] },
  { id: "water-oasis", order: 2, title: "水写绿洲", eyebrow: "石羊河下游的时间切片", durationSeconds: 55, layer: "water", mapView: { center: [103.27, 38.76], zoom: 8.25, pitch: 46, bearing: -8 }, pointIds: ["hongyashan-reservoir", "shiyang-system", "qingtu-lake"], leadMediaId: "desert-sunset", narration: "红崖山水库、生态输水与青土湖共同解释‘治沙先治水’。所有数字保留年份，不混写成实时数据。", sourceIds: ["minqin-ecology", "system-restoration"] },
  { id: "field-days", order: 3, title: "两日实践", eyebrow: "8月3—4日团队影像记录", durationSeconds: 75, layer: "practice", mapView: { center: [103.36, 38.80], zoom: 9.0, pitch: 48, bearing: -10 }, pointIds: ["desert-observation", "watering-practice"], leadMediaId: "watering-video", narration: "第一天观察环境与沙生植物，第二天进入公益林基地浇水养护。无GPS与专业鉴定的内容始终保留边界。", sourceIds: [] },
  { id: "science-industry", order: 4, title: "科技与沙产业", eyebrow: "公开知识补充，不计入到访", durationSeconds: 65, layer: "herbs", mapView: { center: [103.28, 38.78], zoom: 8.65, pitch: 42, bearing: -5 }, pointIds: ["desert-botanical-garden", "cistanche-landscape", "planned-herbs"], leadMediaId: "berries-close", narration: "沙生植物园、治沙科研与梭梭—肉苁蓉链路拓展了知识背景；锁阳、板蓝根仍标作项目计划关注。", sourceIds: ["desert-garden", "desert-institute", "cistanche-industry"] },
  { id: "youth-guardians", order: 5, title: "青年守护", eyebrow: "一次实践进入长期维护", durationSeconds: 55, layer: "people", mapView: { center: [103.45, 38.82], zoom: 8.95, pitch: 48, bearing: -10 }, pointIds: ["zhong-lin"], leadMediaId: "volunteer-base", narration: "公开人物故事与团队劳动影像在兴隆村交汇。种树只是开始，补水、养护、记录与传播才构成长线行动。", sourceIds: ["minqin-volunteers", "minqin-base-report"] },
];

export const mediaById = new Map(media.map((item) => [item.id, item]));
export const sourceById = new Map(sources.map((item) => [item.id, item]));
export const storyPointById = new Map(storyPoints.map((item) => [item.id, item]));
