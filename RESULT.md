# P8 任务结果（部分完成）

日期：2026-08-13

## 已完成

- 建立唯一 `mapSelectedPointId`，覆盖 free、tour、field、water、resources 五种选中来源。
- 新增 `seekTourToPoint()`：按章节 point frame 前置 `durationSeconds` 累计定位；用户点击时暂停，继续播放从当前 frame 开始。
- Free drawer 支持 A → B → C 连续切换：内容立即同步、scrollTop 归零、只在首次打开时聚焦关闭按钮。
- Marker registry 使用 `Map<string, { marker, element }>`；selected 变化只更新 class / ARIA，不再整批销毁。
- Marker 可见符号收敛为小实心点、细环和虚线环；保留 44×44px hit area，selected 为单层外环。
- 从 3 个既有 GPS 实拍点自动派生 2.5km 缓冲，生成 Sentinel-2 L2A 2026-08-06、B04/B03/B02、10m、z12–14 focus PMTiles（24 tiles，272,388 bytes）。
- Focus 采用 Range progressive enhancement；`?focus=missing` 实测 focus unavailable、surface/terrain ready、fallback false。
- Base PMTiles header 实测 bounds `[102.45,37.8,103.75,39.35]`、z0–13；因此 interaction bounds 未扩大。
- Terrain render context 扩至 `[102.12890625,37.474858084971025,104.0625,39.67337039176559]`，生成 1059 tiles、36,191,746 bytes。
- Browser 实测 free drawer 连续三点切换、Tour 同章 point-frame 直达、selected 同步、focus/terrain 独立失效；1920×1080、1366×768、980×768、390×844 均无横向溢出，控制台无 error。
- `npm run content:validate` 与 `npm run lint` 通过。

## 未完成 / 阻塞

- 30m surface render context 未成功扩边。相邻真实 Sentinel COG 的远端 Range 读取多次中断；完整覆盖 Gate 分别得到 99.8623% 和 94.8935%，脚本按规则拒绝生成。
- 因此旧 `minqin-surface-2026.pmtiles` 保持不变，正常高倾斜/旋转视角的 surface 直线裁切边界 Gate 尚未关闭。
- 未将 P8 标记完成；`npm test` 会保留对扩边 provenance 的失败保护，等待真实 surface 资产补齐后关闭。

## 安全边界

- 未修改 `content/*`、GPS 坐标、章节 mapView、播放时长或状态机。
- 未使用纯色、CSS 渐变、AI 纹理或边缘拉伸遮缝。
- 未修改 legacy 项目档案；未 commit、push 或 deploy。
