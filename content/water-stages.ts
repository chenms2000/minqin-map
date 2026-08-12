import type { WaterStage } from "./types";

export const waterTimeline = [
  { year: "1959", title: "青土湖完全干涸", note: "尾闾湖失去水面后，裸露湖区成为民勤北部的重要风沙口，绿洲下游生态压力随之加重。", sourceId: "minqin-ecology" },
  { year: "2007", title: "流域重点治理启动", note: "治理从单项治沙转向流域协同，通过农业节水、生态输水、固沙造林和植被修复共同改善下游环境。", sourceId: "system-restoration" },
  { year: "2010", title: "水面重新出现", note: "持续推进节水与生态输水后，青土湖重新形成约3平方公里水面，尾闾湖由长期干涸进入恢复阶段。", sourceId: "minqin-ecology" },
  { year: "2023", title: "报道水域27.65平方公里", note: "国家林草局2023年报道水域面积为27.65平方公里，水面扩展与周边植被恢复共同呈现下游治理的阶段性变化。", sourceId: "minqin-ecology" },
];

export const waterStages: WaterStage[] = [
  { id: "water-1959", year: "1959", title: "尾闾湖完全干涸", metric: "完全干涸", unit: "历史状态", interpretation: "尾闾湖失去水面后，裸露湖区成为民勤北部的重要风沙口，绿洲下游生态压力随之加重。", pointId: "qingtu-lake", mapView: { center: [103.56, 39.12], zoom: 10.1, pitch: 40, bearing: -8 }, sourceIds: ["minqin-ecology", "qingtu-rebirth-2024", "system-governance-2023"], geometryMode: "symbolic" },
  { id: "water-2007", year: "2007", title: "流域重点治理启动", metric: "系统治理", unit: "治理阶段", interpretation: "治理从单项治沙转向流域协同，通过农业节水、生态输水、固沙造林和植被修复共同改善下游环境。", pointId: "shiyang-system", mapView: { center: [103.20, 38.70], zoom: 8.75, pitch: 46, bearing: -8 }, sourceIds: ["system-restoration", "shiyang-plan-2008", "shiyang-beautiful-river-2022", "oasis-control-model-2025"], geometryMode: "symbolic" },
  { id: "water-2010", year: "2010", title: "青土湖水面重新出现", metric: "约 3", unit: "平方公里", interpretation: "持续推进节水与生态输水后，青土湖重新形成约3平方公里水面，尾闾湖由长期干涸进入恢复阶段。", pointId: "qingtu-lake", mapView: { center: [103.56, 39.12], zoom: 10.2, pitch: 44, bearing: -5 }, sourceIds: ["minqin-ecology", "qingtu-rebirth-2024", "system-governance-2023"], geometryMode: "symbolic" },
  { id: "water-2023", year: "2023", title: "公开报道中的水域面积", metric: "27.65", unit: "平方公里", interpretation: "国家林草局2023年报道水域面积为27.65平方公里，水面扩展与周边植被恢复共同呈现下游治理的阶段性变化。", pointId: "qingtu-lake", mapView: { center: [103.56, 39.12], zoom: 9.8, pitch: 48, bearing: -4 }, sourceIds: ["minqin-ecology", "system-governance-2023"], geometryMode: "symbolic" },
];
