# P11A 腾讯 COS 香港双部署 Pilot 结果

日期：2026-08-27

## 已完成

- 现有 `.github/workflows/deploy-pages.yml` 保持原样，GitHub Pages 继续独立自动发布并作为回退版本。
- 新增 `.github/workflows/deploy-tencent-cos.yml`，首期仅支持 `workflow_dispatch` 手动触发，与 Pages workflow 隔离。
- Tencent workflow 使用 Node 22、`npm ci` 和 `npm run build`，唯一上传目录为 `dist/client`；构建时显式读取 Repository Variable `SITE_URL`，继续运行在域名根路径 `/`。
- 上传使用腾讯维护的 COSCLI v1.0.8 Linux amd64 官方发行文件，并固定官方 SHA-256；不使用停止维护的第三方 Action。
- `COS_SECRET_ID`、`COS_SECRET_KEY` 仅从 GitHub Actions Secrets 读取；`COS_BUCKET`、`COS_REGION`、`SITE_URL` 从 Repository Variables 读取，仓库内没有腾讯云凭据。
- 新增 `docs/DEPLOY_TENCENT_COS.md`，记录香港 COS、EdgeOne 全球可用区（不含中国大陆）、自定义域名、HTTPS、缓存和 PMTiles Range/206 人工 Gate。
- 未修改业务源码、地图视觉、五章导览、内容数据、视频、PMTiles 或现有 GitHub Pages workflow。

## 检查

- 本轮没有修改 TS/TSX、构建配置、依赖或静态资产；按照用户规则不重复运行已通过的 `npm run build`。
- 现有 GitHub Pages 的 Ubuntu Actions 构建已基于当前静态化基线成功生成并部署 `dist/client`；P11A 只增加同构建命令的第二上传通道。
- 最终 diff 需确认不包含任何 `public/maps`、媒体、`package-lock.json`、`docs/CONTEXT_POLICY.md` 或 `docs/HANDOFF.md` 变化。

## 发布边界

- 本轮未 commit、push，也未创建腾讯云资源或伪造部署成功。
- Tencent workflow 尚未运行；用户仍需配置 GitHub Secrets / Variables、香港 COS Bucket、EdgeOne、自定义域名与 HTTPS。
- “全球可用区（不含中国大陆）”不依赖中国大陆 CDN 节点，也不保证中国大陆访问质量；未来启用中国大陆境内加速仍需 ICP 备案。
- `.pmtiles` 请求返回 `206 Partial Content` 是正式上线 Gate；未通过前不得把第二通道标记为完成。
