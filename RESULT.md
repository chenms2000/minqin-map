# Tencent COS 发布通道清理结果

日期：2026-08-28

## 目标

- 删除未投入使用的 Tencent COS / EdgeOne 付费发布通道。
- 保留 GitHub Pages 项目站点作为唯一、免费的公开发布入口。

## 实现

- 删除 `.github/workflows/deploy-tencent-cos.yml`，GitHub Actions 不再提供 COS 手动发布入口。
- 删除 `docs/DEPLOY_TENCENT_COS.md`，移除已停止通道的配置与维护说明。
- 项目记录改为 GitHub Pages 单一发布架构；未修改地图、内容、导览、媒体、PMTiles 或 Pages workflow。
- 腾讯云香港 Bucket `minqin-site-1476329433` 的云端删除状态见本次最终交付记录。

## 验证与边界

- 本次只删除发布配置和修改文档，不涉及构建源码，因此不重复运行构建。
- GitHub Pages 地址继续为 `https://chenms2000.github.io/minqin-map/`。
- `package-lock.json`、`docs/CONTEXT_POLICY.md` 和 `docs/HANDOFF.md` 保持既有工作树状态，不纳入本次清理。

---

# P12 — 恢复现场视频原声与自动导览声音控制

日期：2026-08-28

## 实现结果

- 现场视频改为可选映射源音轨并输出浏览器兼容 AAC；源文件没有音轨时媒体处理仍可完成。
- 已重新运行既有媒体准备流程，发布 MP4 重新获得现场音轨。
- 经确认，`live-melon.mp4` 属于学校可公开的宣传作品；媒体继续保留既有隐私画面裁剪，同时恢复其 AAC 原声。
- 五章自动导览移除永久硬编码静音，统一播放栏新增“声音 / 静音”按钮及对应 `aria-label`、`aria-pressed` 状态。
- 声音选择保存在导览展框状态中，自动切帧、跳章、暂停与继续不会自行改变用户的静音选择。
- 普通地图、长页和实践轨迹视频继续使用浏览器原生 `controls`；导览视频保留 `playsInline` 且不增加原生控制栏。

## 保持不变

- 未修改五章章节结构、`durationSeconds`、地图镜头或 `idle / playing / paused / completed` 播放状态机。
- 未修改 P8 / P9 / P10 地图逻辑、内容文案、部署代码或 `package-lock.json`。
- `docs/CONTEXT_POLICY.md` 与 `docs/HANDOFF.md` 保持原有未跟踪状态。

## 定向验证

- 仅运行 P12 对应的 `continuous tour preserves optional现场 sound and rotates derived frames` 定向测试；覆盖声音状态传递、按钮语义、可选 AAC 编码策略及全部发布 MP4（包括 `live-melon.mp4`）的实际 AAC 音轨。
