import type { WaterStage } from "./types";

export const waterStages: WaterStage[] = [
  { id: "water-geography", year: "地理", title: "两沙夹一洲", metric: "东·西·北", unit: "三面沙漠压力", interpretation: "武威市民勤县地处河西走廊东北部、石羊河流域下游，东、西、北三面受腾格里和巴丹吉林两大沙漠合围。地图只标注区域关系，不表示经核验的历史沙漠边界。", pointId: "shiyang-system", mapView: { center: [103.13, 38.78], zoom: 8.1, pitch: 28, bearing: -12 }, sourceIds: ["system-governance-2023", "minqin-locking-belt-2025"], geometryMode: "symbolic", phase: "pressure", visualNote: "民勤绿洲在两大沙漠之间维持水土与聚落生存空间" },
  { id: "water-1951", year: "1951", title: "从全民动员到有组织治沙", metric: "1950 / 1951", unit: "两个起点", interpretation: "1950年春，民勤县已召开全民防沙治沙万人誓师动员大会；1951年，甘肃省农业厅在民勤北园子设立防沙林场，有组织治沙进一步展开。", pointId: "shiyang-system", mapView: { center: [103.13, 38.78], zoom: 8.55, pitch: 34, bearing: -10 }, sourceIds: ["minqin-mobilization-1950", "minqin-forest-farm-1951"], geometryMode: "symbolic", phase: "mobilization", visualNote: "从群众动员到防沙林场，治沙逐步进入有组织的长期行动" },
  { id: "water-1959", year: "1959", title: "青土湖干涸，绿洲北部风沙口敞开", metric: "完全干涸", unit: "尾闾湖历史状态", interpretation: "青土湖失去水面后，裸露湖区成为民勤绿洲北部的重要风沙口，两大沙漠在此呈合围之势。“决不能让民勤成为第二个罗布泊”由此成为生态治理的清醒警示，而非对结局的夸张预言。", pointId: "qingtu-lake", mapView: { center: [103.56, 39.12], zoom: 10.15, pitch: 40, bearing: -8 }, sourceIds: ["minqin-ecology", "qingtu-rebirth-2024", "system-governance-2023"], geometryMode: "symbolic", phase: "crisis", visualNote: "水面消失，水沙失衡使绿洲北缘承受更直接的风沙压力" },
  { id: "water-2007", year: "2007", title: "从单点挡沙走向水沙系统治理", metric: "流域协同", unit: "治理阶段", interpretation: "石羊河流域重点治理把农业节水、生态输水、固沙造林和植被修复纳入同一体系，治理对象从局部沙丘扩展到上下游相联的水沙系统。", pointId: "shiyang-system", mapView: { center: [103.20, 38.70], zoom: 8.75, pitch: 46, bearing: -8 }, sourceIds: ["system-restoration", "system-governance-2023", "shiyang-plan-2008", "shiyang-beautiful-river-2022"], geometryMode: "symbolic", phase: "governance", visualNote: "节水、输水、固沙与修复同时作用于石羊河下游和绿洲外缘" },
  { id: "water-2010", year: "2010", title: "青土湖重新出现水面", metric: "约 3", unit: "平方公里", interpretation: "持续推进节水与生态输水后，干涸多年的青土湖重新形成约3平方公里水面，尾闾湖由长期干涸进入恢复阶段。", pointId: "qingtu-lake", mapView: { center: [103.56, 39.12], zoom: 10.2, pitch: 44, bearing: -5 }, sourceIds: ["minqin-ecology", "qingtu-rebirth-2024", "system-governance-2023"], geometryMode: "symbolic", phase: "return", visualNote: "生态输水重新连接尾闾湖，水面与周边植被开始恢复" },
  { id: "water-recovery", year: "2023—25", title: "阶段性恢复，仍需持续守护", metric: "3% → 18.28%", unit: "森林覆盖率", interpretation: "国家林草局2023年报道显示，民勤森林覆盖率已由20世纪50年代约3%提高至18.28%；2025年报道记录380公里环绿洲锁边林草带实现闭环围合。这些是阶段性成效，不意味着荒漠消失或治理已经完成。", pointId: "shiyang-system", mapView: { center: [103.15, 38.80], zoom: 8.35, pitch: 32, bearing: -10 }, sourceIds: ["system-governance-2023", "minqin-locking-belt-2025"], geometryMode: "symbolic", phase: "recovery", visualNote: "水沙系统治理已形成可见成效，绿洲锁边与生态用水仍需长期维护", comparison: [{ label: "20世纪50年代", value: "约 3%" }, { label: "目前", value: "18.28%" }, { label: "环绿洲锁边林带", value: "380 km" }] },
];

export const waterTimeline = waterStages.map((stage) => ({
  year: stage.year,
  title: stage.title,
  note: stage.interpretation,
  sourceId: stage.sourceIds[0]!,
}));
