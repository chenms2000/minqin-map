# 4 分钟导览与地图探索入口收尾结果

日期：2026-08-13

## 已完成

- 自动导览保持 44 个 frame 与唯一 `chapterFramesById → frame.durationSeconds` 时间轴；图片 9 帧 × 6.5 秒 = 58.5 秒，普通文字 7 帧 × 3 秒 = 21 秒，来源 20 帧 × 4 秒 = 80 秒。
- 8 个视频继续使用 `asset.durationSeconds`，真实总时长保持 81.283 秒；未修改视频时长、未使用 `playbackRate`，Before / After 均为 81.283 秒。
- 导览总时长为 240.783 秒，UI 显示约 4:00；未删除 intro、point、media、source、图片、正文或来源。
- 自由地图新增“探索工具 / 水脉时间机”portal，运行时通过 `storyPointById.get("shiyang-system")` 复用已有知识节点坐标，点击后从第一阶段进入 `water` 模块。
- 自由地图新增“探索工具 / 药材标本柜”portal，运行时通过 `storyPointById.get("planned-herbs")` 复用已有知识节点坐标，点击后进入 `resources` 模块的 `specimen` 视图。
- 两个 portal 都只是 UI navigation portal，不新增 StoryPoint 或地理事实坐标，不进入点位统计，并在 Story / Tour 模式隐藏；进入时清理已有地图 drawer selection，退出展框后焦点返回地图区域。
- Tour 镜头集中为 `cameraForTourFrame()`：intro 使用章节 overview，point 与带 pointId 的 media/source 使用 detail；`lastTourCameraKeyRef` 防止同点连续分镜重复 ease。
- 第三章 intro 从 zoom 13.15 收敛为 11.45，1920×1080 与 1366×768 可同时读出三个实践点；GPS point 仍使用 zoom 13.85。
- 原有 marker button 内加入直接派生自 `point.title` 的标签；四个图层均实测有名称，44×44 hit area 与 ARIA 保持。
- Drawer 打开态与滚动区恢复 pointer events；A → B → C 连续切换时标题同步、scrollTop 归零、drawer 不关闭，滚轮实测可用。
- Tour 桌面内容栏为约 56%，980px 为约 58%；390×844 保持地图约 38% / 内容约 62%，各尺寸无横向溢出。
- A/B 确认高倍矩形 seam 来自 10m focus。Focus 改为 24 个 PNG-alpha 瓦片、1,883,514 bytes，裁切外透明并以 320m feather 混合 30m base；`?focus=missing` 继续独立降级。
- 本任务只运行定向测试 `four-minute tour preserves videos and exposes map tool portals`，未运行全量 content、lint、build 或 test。

## 人工验收留项

- 完整观看一次约 4 分钟导览，确认 44 帧均保留、视频完整且未加速、图片与来源停留时间可接受、章节无跳帧，pause / resume、进度和剩余时间正常。
- 在自由地图检查两个探索工具入口的可发现性、视觉权重、标签清晰度及与故事点的遮挡关系。
- 分别点击水脉时间机与药材标本柜，确认默认入口、退出流程及焦点返回正常。
- 在桌面与手机检查 portal 无横向溢出或大面积遮挡，并确认自动导览状态下 portal 不出现。

## 仍未解决

- P8 主 30m surface render context 未扩边：当前 `minqin-surface-2026.pmtiles` 仍是旧 0.05° buffer。真实相邻 Sentinel COG coverage Gate 尚未关闭，因此整体 surface 边界问题仍是 blocker。
- 本轮只修复 GPS 10m focus overlay 的矩形硬边，不宣称 P8 整体完成。

## 安全边界

- 未修改 GPS 坐标、故事事实、视频真实时长、播放状态机或主 30m surface。
- 未使用纯色、CSS 渐变、AI 纹理或拉伸数据遮缝。
- 未修改受保护的 `docs/CONTEXT_POLICY.md`、`docs/HANDOFF.md`。
- 本任务现有未提交代码已经满足要求，仅完成审查与结果文档收尾；未 commit、push 或 deploy。
