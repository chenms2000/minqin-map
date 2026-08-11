# 内容更新指南

每次更新都遵循“先放文件、再建索引、最后建立关联”的顺序。完成后至少运行 `npm run content:validate`；准备发布时运行 `npm test`。

## 添加照片或视频

1. 将压缩后的文件放入 `public/media/YYYY-MM-DD/`。跨日期共用的字幕等文件放入 `public/media/shared/`。
2. 在 `content/media.ts` 添加唯一 `id`、类型、站内路径、替代文本、说明、拍摄时间和 `featured` 状态。
3. 若媒体进入实践播放器，在 `content/field-timeline.ts` 添加事件并关联媒体 ID 与点位 ID。
4. 视频不自动播放；建议保留压缩封面，并在 `poster` 中引用站内图片。

新素材需要重新压缩时，先在 `scripts/prepare-media.mjs` 增加源文件与目标日期路径，再运行 `npm run media:prepare`。不要把约 1.5GB 原始素材直接部署。

## 添加实践时间线事件

在 `content/field-timeline.ts` 添加 `TimelineEvent`。日期时间、类别、媒体、点位和定位精度必须齐全。类别由同文件的 `timelineCategories` 统一维护。没有 GPS 时使用“县域叙事点”或“村级近似定位”，不要生成虚假移动轨迹。

直播、导出视频等不能可靠反映现场时间的素材，可填写 `timeLabel` 展示“8月3日深夜”等保守时间，不要把文件导出时间写成拍摄时间。

## 添加 GPS 采样线

在 `content/field-tracks.ts` 添加 `FieldTrack`。坐标必须来自团队影像元数据，按拍摄时间排序并去除相邻重复点；每条线必须写明“影像 GPS 采样线，非完整轨迹、非导航路线”。第三方地图路线截图不得作为站点地图图层发布。

## 添加地图点位

在 `content/story-points.ts` 添加 `StoryPoint`：

- `layer` 决定所属图层。
- `accuracy` 与 `locationNote` 必须说明定位精度。
- `contentOrigin` 区分团队记录、公开资料与项目计划。
- `mediaIds`、`sourceIds` 只能引用已经存在的 ID。
- 无法确认的植物使用保守名称并注明“名称待专业核验”，不得擅自鉴定或宣传功效。

团队照片 EXIF 可用于“GPS实拍点”，但只能表示拍摄区域，不能据此推断基地入口、行政村归属或边界。公开人物资料中的兴隆村节点继续保持“村级近似定位”，不要与团队实拍点合并。

## 添加公开来源

先在 `content/sources.ts` 添加 `SourceRef`，保留发布机构、标题、链接和发布日期，再在点位、水脉、药材或导览章节的 `sourceIds` 中引用。公开知识点不计入团队到访数量。

## 添加水脉阶段

在 `content/water-stages.ts` 添加阶段时，年份、指标、单位、资料口径和来源必须属于同一个历史切片。只有文字资料时保持 `geometryMode: "symbolic"`，不要绘制伪造湖面边界，也不要表述为实时监测。

## 添加药材档案或关系

在 `content/resources.ts` 增加 `HerbProfile` 或 `RelationshipEdge`。内容只覆盖生境、生态关系、种植、采收、初加工和传播，不写医疗功效、产品推荐或未经核验的企业规模。

公开资料支持的条目标记“公开资料可核”；尚未完成实地调查的条目标记“项目计划关注”。每个档案需要通过 `mapPointId` 返回关联地图节点。

## 调整五章导览

在 `content/exhibit-scenes.ts` 修改章节顺序、镜头、图层、主媒体、讲解、点位和来源。章节切换由上层统一控制，不要在展框组件中复制数据或创建第二张地图。

## 发布前检查

```bash
npm run content:validate
npm run lint
npm test
```

校验会检查 ID 唯一性、媒体和来源引用、坐标范围、文件路径、隐私表述、精选数量和 PMTiles 大小。发布前还应手动检查电脑、1920×1080 大屏和 390×844 手机布局，以及断图回退页面。
