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

## 移动端视频时钟同步修复

- 视频分镜不再使用章节墙钟推进，导览进度直接同步媒体 `currentTime`；移动端缓冲时视频时间不变，进度也随之冻结。
- 用户暂停/继续导览时同步暂停/恢复实际视频；视频播放结束或媒体错误后才完成该分镜。
- 未修改任何 `durationSeconds`、章节结构、地图镜头或 `idle / playing / paused / completed` 播放状态。

---

# P13 — 全站舒缓背景音乐与视频优先混音

日期：2026-08-28

## 实现结果

- 下载并本地托管 `Forest Mist Whispers`、`Valley Sunset`、`Rest Now` 三首 Mixkit Free Music，发布副本统一压为约 128 kbps MP3，总计约 9.35 MB。
- 新增全站单一背景音乐实例与 `bgmEnabled / bgmTrackIndex / bgmVolume` 状态，按 1 → 2 → 3 → 1 固定循环，不依赖运行时第三方音频外链。
- 首页主导航与自动导览播放栏均可开关 BGM；第一次点击“开始自动导览”时，如用户尚未明确选择背景音偏好，会在该用户手势中启动 BGM。
- 默认 BGM 音量为 14%；任一站内视频开始播放时约 0.7 秒 duck 到不高于 2%，暂停或结束后约 1.2 秒恢复，因此自动导览和手动视频都以现场原声优先。
- 用户主动关闭 BGM 后，后续自动导览不会自行重新开启。
- 页脚记录三首曲目的曲名、作者、Mixkit 来源与 `Mixkit Stock Music Free License` 链接。

## 验证

- 仅运行定向测试：`node --test --test-name-pattern="global background soundtrack" tests/rendered-html.test.mjs`。
- 结果：1 项通过，0 项失败；未追加 build、lint 或完整测试。

## 边界

- 未加入交叉淡化双播放器；当前曲目结束后直接切换下一首，以保持实现简单稳定。
- `page.css` 的导航样式定点编辑因同一 `EDIT_CONTEXT_MISMATCH` 指纹连续出现两次而按既定规则停止；导航 BGM 控制改为复用现有 `secondary-action` / `nav-date` 样式，没有继续碰撞该文件。
