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
