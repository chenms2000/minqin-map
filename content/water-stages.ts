import type { WaterStage } from "./types";

export const waterTimeline = [
  { year: "1959", title: "青土湖完全干涸", note: "公开资料记录，湖区随后形成民勤北部的重要风沙口。", sourceId: "minqin-ecology" },
  { year: "2007", title: "流域重点治理启动", note: "节水、生态输水、固沙造林与植被修复协同推进。", sourceId: "system-restoration" },
  { year: "2010", title: "水面重新出现", note: "青土湖形成约3平方公里水面；该数字对应2010年。", sourceId: "minqin-ecology" },
  { year: "2023", title: "报道水域27.65平方公里", note: "采用国家林草局2023年报道口径，不表达为实时数据。", sourceId: "minqin-ecology" },
];

export const waterStages: WaterStage[] = [
  { id: "water-1959", year: "1959", title: "尾闾湖完全干涸", metric: "完全干涸", unit: "历史状态", interpretation: "公开资料记录，青土湖完全干涸后，湖区成为民勤北部重要风沙口。", pointId: "qingtu-lake", mapView: { center: [103.56, 39.12], zoom: 10.1, pitch: 40, bearing: -8 }, sourceIds: ["minqin-ecology"], geometryMode: "symbolic" },
  { id: "water-2007", year: "2007", title: "流域重点治理启动", metric: "系统治理", unit: "治理阶段", interpretation: "节水、生态输水、固沙造林与植被恢复被放在同一流域框架中推进。", pointId: "shiyang-system", mapView: { center: [103.20, 38.70], zoom: 8.75, pitch: 46, bearing: -8 }, sourceIds: ["system-restoration"], geometryMode: "symbolic" },
  { id: "water-2010", year: "2010", title: "青土湖水面重新出现", metric: "约 3", unit: "平方公里", interpretation: "该数字对应2010年公开资料口径，不与后续年份面积合并使用。", pointId: "qingtu-lake", mapView: { center: [103.56, 39.12], zoom: 10.2, pitch: 44, bearing: -5 }, sourceIds: ["minqin-ecology"], geometryMode: "symbolic" },
  { id: "water-2023", year: "2023", title: "公开报道中的水域面积", metric: "27.65", unit: "平方公里", interpretation: "采用国家林草局2023年报道口径，只表达对应年份的历史切片。", pointId: "qingtu-lake", mapView: { center: [103.56, 39.12], zoom: 9.8, pitch: 48, bearing: -4 }, sourceIds: ["minqin-ecology"], geometryMode: "symbolic" },
];

