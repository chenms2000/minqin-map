# 导览与地图细节优化结果（部分完成）

日期：2026-08-13

## 已完成

- 自动导览保持 44 个 frame 与唯一 `chapterFramesById → frame.durationSeconds` 时间轴；图片由 12 秒调为 9 秒、来源由 7 秒调为 5.5 秒、文字保持 4 秒，视频继续使用 `asset.durationSeconds`。
- 导览总时长由 357.283 秒压缩为 300.283 秒：图片 81 秒、普通文字 28 秒、来源 110 秒、视频 81.283 秒。
- Tour 镜头集中为 `cameraForTourFrame()`：intro 使用章节 overview，point 与带 pointId 的 media/source 使用 detail；`lastTourCameraKeyRef` 防止同点连续分镜重复 ease。
- 第三章 intro 从 zoom 13.15 收敛为 11.45，1920×1080 与 1366×768 可同时读出三个实践点；GPS point 仍使用 zoom 13.85。
- 原有 marker button 内加入直接派生自 `point.title` 的标签；四个图层均实测有名称，44×44 hit area 与 ARIA 保持。
- Drawer 打开态与滚动区恢复 pointer events；A → B → C 连续切换时标题同步、scrollTop 归零、drawer 不关闭，滚轮实测可用。
- Tour 桌面内容栏为约 56%，980px 为约 58%；390×844 保持地图约 38% / 内容约 62%，各尺寸无横向溢出。
- A/B 确认高倍矩形 seam 来自 10m focus。Focus 改为 24 个 PNG-alpha 瓦片、1,883,514 bytes，裁切外透明并以 320m feather 混合 30m base；`?focus=missing` 继续独立降级。
- `npm run content:validate`、`npm run lint`、`npm run build` 与 `npm test` 全部通过；结构测试 23/23。

## 人工验收留项

- 浏览器已验证 Tour URL 可进入 playing（进度显示 0:01 / 5:00）、marker point seek、播放中点选后暂停并显示“继续”。按用户决定，未继续等待完整 5 分钟人工观看。
- 自动化环境中 drawer wheel 可滚动，但原生 scrollbar thumb 的坐标拖拽未能被浏览器驱动命中；CSS pointer gate 与可见滚动条均已确认，直接拖拽留给人工。
- 新开首页标签中“开始自动导览”按钮可见、可聚焦且无控制台错误，但自动化点击/Enter 未进入 Tour；正式 exhibit URL 与内部播放控制正常。该入口需人工复核，不能标记为浏览器 PASS。

## 仍未解决

- P8 主 30m surface render context 未扩边：当前 `minqin-surface-2026.pmtiles` 仍是旧 0.05° buffer。真实相邻 Sentinel COG coverage Gate 尚未关闭，因此整体 surface 边界问题仍是 blocker。
- 本轮只修复 GPS 10m focus overlay 的矩形硬边，不宣称 P8 整体完成。

## 安全边界

- 未修改 GPS 坐标、故事事实、视频真实时长、播放状态机或主 30m surface。
- 未使用纯色、CSS 渐变、AI 纹理或拉伸数据遮缝。
- 未修改受保护的 `docs/CONTEXT_POLICY.md`、`docs/HANDOFF.md`。
- 未 commit、push 或 deploy。
