# 民勤中医药生态文化数字地图

北京中医药大学生命科学学院“绿洲药韵·丝路智传实践团”2026年暑期社会实践数字成果。

网站以单页互动地图呈现四类内容：实践足迹、绿洲水脉、药材产业和人物故事。现场照片未附GPS，因此地图中的县域叙事点、村级近似定位和公开知识点均在数据中明确区分。

## 本地运行

```bash
npm install
npm run media:prepare
npm run dev
```

## 验证

```bash
npm test
```

内容数据位于 `app/content.ts`。后续新增8月5—6日素材时，可按现有 `StoryPoint`、`MediaAsset` 和 `SourceRef` 结构继续补充。
