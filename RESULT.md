# GitHub Pages 项目路径迁移结果

日期：2026-08-28

## 目标

- 将地图从账户根站点 `chenms2000.github.io` 迁移到项目站点 `chenms2000.github.io/minqin-map/`，释放账户根站点供其他用途。
- 保持 Tencent COS / EdgeOne 第二发布通道运行于正式域名根路径 `/`。

## 实现

- `next.config.ts` 只在 Pages workflow 显式设置 `GITHUB_PAGES_BUILD=true` 时启用由仓库名派生的路径型 `assetPrefix`、公开资源前缀和 `NEXT_PUBLIC_SITE_URL`；应用路由仍为 `/`。
- Pages workflow 在构建后将 Vinext 写入 `dist/client/minqin-map/_next` 的物理资源提升到 `dist/client/_next`；HTML 中的 URL 保持 `/minqin-map/_next/`，由 GitHub Pages 的项目站点路径映射到 artifact 根目录。
- workflow 在上传前强制检查 HTML：必须出现当前仓库名对应的 `/<repository>/_next/`，且不得残留根路径 `/_next/`；失败时不会发布 artifact。
- `.github/workflows/deploy-pages.yml` 不再允许账户根仓库命名，构建产物仍唯一来自 `dist/client`。
- `publicAsset` 继续统一处理图片、视频、字幕和 PMTiles URL；未修改地图、内容、导览、媒体或 PMTiles 资产。
- `.github/workflows/deploy-tencent-cos.yml` 未修改，因此 COS 构建不带 `/minqin-map` 前缀。

## 验证与边界

- 唯一机器验证已运行：`GITHUB_REPOSITORY=chenms2000/minqin-map GITHUB_PAGES_BUILD=true npm run build`。直接使用 Next `basePath` 时暴露 Vinext RSC 根路由 404，因此已改用受支持的 `assetPrefix` + `publicAsset` 方案；按本轮单次构建限制未重复运行。
- 首次线上构建成功，但公开 HTML 检查发现绝对 `assetPrefix` 未保留项目路径，CSS/JS 仍指向 `/_next/`；已改为路径型前缀与 artifact 目录提升，必须由后续 Actions 和公开 URL 复核关闭该 Gate。
- `package-lock.json`、`docs/CONTEXT_POLICY.md` 和 `docs/HANDOFF.md` 保持现有工作树状态，不纳入迁移提交。
- Tencent COS / EdgeOne 首次正式发布及 PMTiles `206 Partial Content` Gate 仍待后续人工完成。
