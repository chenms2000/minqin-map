# GitHub Pages 纯静态化改造结果

日期：2026-08-27

## 已完成

- Vinext 改为 `output: "export"`，首页在构建阶段生成 `dist/client/index.html`，在线运行不需要 Node.js、Worker、数据库或 Cloudflare。
- 移除未使用的 Cloudflare Worker、D1、ChatGPT 托管认证模板和运行时接线；既有工具包版本保留在锁文件中，避免无关依赖树重写。
- 图片、视频、字幕和本地 PMTiles 统一经过公开资源路径 helper，静态导出后仍从同一站点加载。
- 动态请求头元数据改为构建期静态元数据；GitHub Actions 会按仓库所有者生成 `https://<用户名>.github.io/og.png` 分享图地址。
- 新增 GitHub Pages workflow：推送 `main` 后安装依赖、构建、上传 `dist/client` 并发布。
- workflow 明确要求仓库名为 `<GitHub用户名>.github.io`。这让大型地图与媒体资源保持根路径，也规避当前 Vinext 版本在普通项目仓库子路径下的静态 RSC 导出问题。
- P9 “绿洲生死线”、唯一 MapLibre、五章导览及全部本地地图/媒体资产均保留。

## 验证

- `npx tsc --noEmit`：通过，退出码 0。
- 模拟 `example/example.github.io` 运行 `npm run build`：完成 5 个构建阶段，根路由标记为 Static，生成 `dist/client/index.html`、RSC、脚本、样式、PMTiles 和媒体。
- 使用普通静态文件服务器读取 `dist/client`：首页、入口脚本、本地 PMTiles 和代表性图片均返回 HTTP 200，未启动 Vinext 或 Cloudflare 运行时。
- Windows 上 Vinext 在打印 `Build complete` 后触发其预渲染子进程的 libuv 关闭断言，因此本机命令最终退出码仍为 1；产物已经生成并逐项确认。GitHub Actions 使用 Ubuntu，正式 workflow 尚未推送运行。

## 发布边界

- 未修改 `.gitignore`、`docs/CONTEXT_POLICY.md` 或 `docs/HANDOFF.md`。
- 未 commit、push 或发布；GitHub 仓库创建、Pages 启用与首次公开上线仍需用户授权。
- P8 主 30m surface render-context 扩边仍未完成，本轮未修改其地图资产。
