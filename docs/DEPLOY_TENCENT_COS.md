# Tencent COS 香港 + EdgeOne 第二发布通道

该通道与 GitHub Pages 并存。GitHub Pages 继续作为独立回退版本；Tencent workflow 首期仅允许在 GitHub Actions 页面手动触发，不会随 `main` 推送自动运行。

## GitHub 配置

在仓库 **Settings → Secrets and variables → Actions** 中配置：

| 类型 | 名称 | 内容 |
| --- | --- | --- |
| Secret | `COS_SECRET_ID` | 具备目标 Bucket 最小上传权限的腾讯云子账号 Secret ID |
| Secret | `COS_SECRET_KEY` | 与上述 ID 配套的 Secret Key |
| Variable | `COS_BUCKET` | 完整 Bucket 名，包含 APPID 后缀，例如 `minqin-site-1250000000` |
| Variable | `COS_REGION` | 香港使用 `ap-hongkong` |
| Variable | `SITE_URL` | 最终自定义域名的 HTTPS 根地址，例如 `https://map.example.com/` |

密钥只保存在 GitHub Actions Secrets 中。不要把密钥写进仓库、文档、Actions Variables 或本地 `.env`。建议使用最小权限子账号，并把资源范围限制到目标 Bucket 及其对象。按照腾讯 COSCLI `sync` 上传权限说明，CAM 策略仅需以下 8 个 action：

```text
cos:HeadBucket
cos:GetBucket
cos:HeadObject
cos:InitiateMultipartUpload
cos:UploadPart
cos:CompleteMultipartUpload
cos:ListMultipartUploads
cos:ListParts
```

本 Pilot 不使用 `--delete`，因此不授予删除对象权限；也不需要下载对象的 `cos:GetObject`。

## 腾讯云控制台

1. 在中国香港地域创建专用 COS Bucket，记下包含 APPID 的完整名称和 Region `ap-hongkong`。
2. 在 COS 开启静态网站能力，首页设为 `index.html`。根据 EdgeOne 的 COS 源站授权方式选择私有回源；只有确需直接公开访问 COS 时才使用公有读，避免无意暴露源站。
3. 完成上面的 GitHub Secrets / Variables 后，在 **Actions → Deploy static site to Tencent COS → Run workflow** 手动运行。workflow 只同步 `dist/client` 到 Bucket 根目录，Pilot 不删除 Bucket 中的其他对象，因此应使用专用 Bucket。
4. 在 EdgeOne 添加站点，源站选择同账号腾讯云 COS；如果依赖目录索引，应将源站类型切换为静态网站源站。
5. 加速区域选择“全球可用区（不含中国大陆）”。这一模式不依赖中国大陆边缘节点，也不保证中国大陆网络质量；未来若启用中国大陆境内加速，仍需按要求完成 ICP 备案。
6. 绑定最终自定义域名，并确保它与 `SITE_URL` 完全一致；配置 DNS、HTTPS 证书和强制 HTTPS。
7. 在规则引擎中为 `.pmtiles` 及其他大文件开启分片回源/Range GET。源站与 EdgeOne 必须保留 `Accept-Ranges`，实际请求 `Range: bytes=0-511` 应返回 `206 Partial Content`。
8. 缓存只对版本化或带内容哈希的静态资源设置长 TTL；`index.html` 和其他 HTML 使用短 TTL 或及时刷新策略。同名资源被覆盖后，按需执行缓存刷新。

## 首次发布 Gate

- workflow 的构建目录必须是 `dist/client`，并生成 `dist/client/index.html`。
- 自定义域名首页、刷新和返回操作正常，PC 与手机均可访问。
- 五章导览、自由地图、Sentinel surface、terrain 和代表性视频正常。
- 对 `.pmtiles` 连续缩放/拖动时检查 Network：Range 请求返回 206，而不是反复下载整个文件。
- GitHub Pages 原地址仍可独立访问。

完成这些人工 Gate 后，才能评估是否把 Tencent workflow 改为 `push main` 自动发布。

## 官方参考

- [COSCLI 概览与官方发行版](https://github.com/tencentyun/coscli)
- [COSCLI `sync` 命令](https://www.tencentcloud.com/document/product/436/43257)
- [COS Region 与访问域名](https://www.tencentcloud.com/document/product/436/6224)
- [COS 静态网站设置](https://www.tencentcloud.com/document/product/436/30958)
- [EdgeOne 配置对象存储源站](https://cloud.tencent.com/document/product/1552/122800)
- [EdgeOne 分片回源](https://cloud.tencent.com/document/product/1552/73026)
