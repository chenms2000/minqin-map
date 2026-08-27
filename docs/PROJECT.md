# 项目总览

- 项目：site
- 更新：2026-08-27
- 来源：由旧档案迁移，旧文件已保留

## 当前目标

请从迁移内容中确认当前目标。

## 当前状态

# 项目状态

- 项目：site
- 最后更新：2026-08-27
- 维护状态：GitHub Pages 已上线并保留为回退版本；P11A 已加入 Tencent COS 香港 + EdgeOne 第二发布通道 Pilot，云端配置与人工 Gate 待完成；P8 主 surface render-context 仍阻塞

## 当前目标

保持一键五章导览、单地图叙事、双向证据网络与“纪录片 × 数字博物馆”界面稳定，并以真实 Sentinel-2 地表纹理、弱 hillshade 与矢量制图融合呈现荒漠—绿洲—水体—聚落/道路关系。

## 已完成

- 已建立长期维护记录。
- 已检查项目类型、Git 状态、敏感文件名与大文件分布。
- 已保守完善 `.gitignore`，覆盖本机缓存、临时文件和常见私钥文件。
- 已复核当前工作树：未发现敏感文件名或疑似硬编码凭据；现有忽略规则覆盖实际依赖与生成目录。
- 已从新增素材中精选并压缩23项影像，发布媒体总数扩充到43项，其中18项为导览精选。
- 已增加白刺果采摘观察、基地科普传播和公益林浇水维护实拍点，以及两条非导航 GPS 采样线。
- 已扩充科普、传播分类，更新五章导览、地图图例、内容边界和维护指南。
- 内容校验、Lint、构建及6项自动测试全部通过。
- 已发布为私有站点版本11，版本10继续保留用于回退。
- 已将“五章故事骨架”提升为首页主线，五章直接复用 `tourChapters` 与 `mediaById`，并支持从首页进入指定数字展框章节。
- 已将互动地图、数字展框归为探索工具，将完整实践影像、水脉历史切片、药材资料与来源归为证据/档案层。
- 已增加首页五章服务器 HTML 结构保护；内容校验、Lint、构建及7项自动测试全部通过。
- 已通过 `IntersectionObserver` 建立桌面五章滚动叙事，复用唯一 MapLibre 实例作为固定地图舞台；移动端保持自然单列。
- 首页当前章节会切换 `layer`、`mapView` 与 `pointIds`，离开五章后恢复完整自由地图功能。
- 已支持首页与数字展框的 `chapter` 深链接、章节 URL 同步及 Back / Forward 状态恢复。
- 已在公益林基地实拍点下分组呈现“中暑预防科普”“直播助农尝试”“志愿基地与治沙技术证据”，三项记录复用唯一经核验的基地坐标，不新增伪精确点位。
- 三项证据分别保留医学内容、平台隐私和现场证据范围边界，已有照片与视频按事件归组展示。
- 已重整本地底图视觉层级：荒漠地表与绿洲覆盖优先，低缩放弱化支路、服务道路和行政边界，并降低叙事路径与 GPS 采样线的视觉重量。
- 已建立 `idle / playing / paused / completed` 单一播放状态；时长由文字、图片和视频分镜内容动态累加，并复用既有地图镜头与章节 URL。
- 已将五章、首页与展框说明改为更直接的事实叙述；GPS、医学、平台隐私、植物鉴定和项目计划边界集中在结构化字段与方法说明。
- 已建立五章证据聚合与来源反向 usage 派生索引；数字展框可逐章打开依据，Footer 可查看每个来源支撑的章节、点位、水脉或资源。
- 权威网络来源已由 8 项扩充至 16 项，新增资料实际进入水写绿洲、科技与沙产业、青年守护及相应点位、水脉阶段和肉苁蓉资源关系。
- 首页“开始自动导览”可一次点击进入连续播放；展框提供秒级总进度、空格播放/暂停、方向键跳章及完成后的地图/资料双出口。
- 连续导览已进一步派生自动分镜：地图位点镜头、精选图片、关联静音视频、点位摘要与来源文字会在章内自动切换。
- 已完成“绿洲纪录片 × 数字博物馆”全站 UI：现场影像使用深绿界面，来源、数据和药材使用米白展签；首页、长页、地图和档案共享统一令牌与编辑式网格。
- 自动导览桌面调整为约 44% 地图与 56% 内容栏，980px 为约 42% / 58%；常驻控制仍收敛为暂停、上一页、进度/剩余时间和下一页，手机保持地图约 38% / 内容约 62%。
- 已在 1366×768、1920×1080、980px、390×844 与 200% 等效宽度检查界面；手机为地图 38% / 内容 62%，无横向溢出或控件遮挡。
- 已完成数字地图第二轮制图质感精修：Protomaps 实际图层按道路等级与缩放渐进显现，建筑延后出现，自定义实践/GPS/水脉线均采用 zoom expression。
- 地图故事点已改为 44px 可操作区内的测绘站式 ring + core 符号；selected 点位具备克制 halo、ARIA 状态与其余点位降权，手机抽屉打开后仍保留点位可见。
- DOM 语境标签已按城市、水体、镇级分层控制；point-list 与图例改为可展开的低干扰控件，MapLibre 原生控件、地图工具和 attribution 完成视觉收敛。
- 地图镜头已用小型 helper 统一 selected、tour、timeline、resource 与关系点位的 zoom / pitch / bearing，不改章节 `mapView`、播放时长或状态机。
- 已完成 P6 本地地形阴影：Mapzen Terrain Tiles（民勤区高缩放为 USGS SRTM、低缩放合成含 GMTED2010）裁切至 `[102.40, 37.75, 103.80, 39.40]`，生成 z7–12、595 瓦片、约 17.9 MiB 的本地 Terrarium PMTiles。
- DEM provenance 记录 provider、dataset、公共领域/署名条件、2026-08-12 获取日期、分辨率、原始范围、裁切范围、瓦片响应源文件、编码和 SHA-256；生成脚本固定并校验 go-pmtiles v1.31.2。
- Hillshade 在基础 PMTiles `mapReady` 后异步加载；P7 加入 surface 后重排为 surface → hillshade → `landcover`，失败只标记 terrain unavailable，不触发基础 fallback。自由、Story、Tour 复用一层并按模式降权，未启用 3D terrain。
- 已完成 P7 真实地表融合：采用 Element 84 / AWS Open Data 的 Sentinel-2 Collection 1 L2A，选取 2026-08-06、覆盖民勤的 4 个低云场景，以官方 B04/B03/B02 TCI 为自然色来源，生成覆盖 `[102.40, 37.75, 103.80, 39.40]` 的 30m 视觉级本地 raster PMTiles。
- Surface archive 为 z7–13、2212 个 JPEG 瓦片、21,406,499 bytes；provenance 记录 provider、dataset、许可与再分发声明、获取/场景日期、云量、波段、分辨率、范围、处理链、场景资产和 SHA-256。
- P7A 固定默认视角 Before/After 一次通过视觉 Gate：After 可直接辨认农田格网、绿洲边缘、裸地与聚落周边结构，不再是单纯浅色几何面；随后才扩展到完整 `mapBounds`。
- P9 将 `waterStages` 扩展为地理、1951、1959、2007、2010 与 2023—25 六个可追溯切片，明确区分 1950 全民动员与 1951 防沙林场。
- P9 继续复用原 water/time-machine 与唯一 MapLibre；只在历史工具开启时显示巴丹吉林沙漠南缘、民勤绿洲和腾格里沙漠西缘的区域示意，并明示“非历史沙漠边界”；退出后移除 overlay 并恢复进入前自由地图镜头。
- P9 以约 3% → 18.28% 森林覆盖率和 380 km 环绿洲锁边林带呈现阶段性恢复，并保留治理仍需持续的事实边界。
- 发布架构已从 Cloudflare Worker/D1 模板切换为 Vinext `output: "export"`：运行时只需 `dist/client` 中的 HTML、JS、CSS、PMTiles、图片和视频，不再需要服务器、数据库或 Cloudflare 账号。
- GitHub Actions 已配置为推送 `main` 后自动发布 GitHub Pages。为避免 Vinext 当前版本在项目子路径静态导出时的 RSC/basePath 问题，仓库必须使用 `<GitHub用户名>.github.io` 根站点命名；地图和媒体继续使用站点根路径。
- P11A 新增独立的 Tencent COS workflow：仅 `workflow_dispatch` 手动触发，使用 Node 22 构建同一 `dist/client`，显式以 Repository Variable `SITE_URL` 覆盖正式自定义域名，并通过腾讯官方 COSCLI 同步到香港 Bucket；GitHub Pages workflow 未修改。
- 第二通道采用香港 COS 与 EdgeOne“全球可用区（不含中国大陆）”，不依赖中国大陆 CDN 节点；未来若启用中国大陆境内加速仍需 ICP 备案。`.pmtiles` 的 Range/206 与分片回源是正式发布 Gate，控制台步骤见 `docs/DEPLOY_TENCENT_COS.md`。
- Surface 在基础矢量图 `mapReady` 后按 HTTP Range 渐进加载，实测 `bytes=0-511` 返回 206；surface 与 terrain 各自独立失败，均不触发基础 fallback。自由 / Story / Tour 复用同一 raster layer 并逐级减弱。
- Vector landcover / landuse 已改为半透明分类罩色，hillshade 保持弱地貌，水脉关系线降权；“民勤县”DOM 标签去除胶囊背景并改为中英制图文字。

## 正在进行

- P8 部分完成：地图、抽屉与 TourStage 已统一使用 `mapSelectedPointId`；Tour marker 可按 `chapterFramesById` 与 `durationSeconds` 直达 point frame；free drawer 可不关闭连续换点，selected 更新不再重建 marker。
- Marker 已从大靶心改为 44px hit area 内的 14–18px 点/细环/虚线环，selected 只增加单层外环。
- GPS 三点已从既有坐标自动派生 2.5km buffer，生成 10m、z12–14 的本地 `minqin-surface-focus-2026.pmtiles`；`?focus=missing` 可独立退化，GPS 镜头为 13.85，非 GPS 镜头未提高。
- Terrain render context 已扩至 z13 对齐的 `[102.12890625, 37.474858084971025, 104.0625, 39.67337039176559]`，1059 tiles / 36,191,746 bytes；interaction bounds 保持 base PMTiles 实际边界不变。
- 44 帧自动导览进一步由 300.283 秒收敛为 240.783 秒（UI 约 4:00）：图片 58.5 秒、普通文字 21 秒、来源 80 秒、视频仍为真实 81.283 秒；不删内容且保持单一 `frame.durationSeconds` 时间轴。
- 自由地图新增“水脉时间机 / 药材标本柜”探索工具 portal，分别运行时锚定既有 `shiyang-system` / `planned-herbs`；portal 不新增坐标或 StoryPoint，并在 Story/Tour 模式隐藏。
- Tour 镜头已集中为 overview → detail：intro 使用章节 `mapView`，point 及带 pointId 的 media/source 使用点位镜头，同一 camera key 不重复 ease；第三章 intro 降至 zoom 11.45，先展示三个实践点关系。
- Marker 名称直接派生自 `point.title` 并置于原有 44px button 内；drawer 打开态恢复完整 pointer events，A→B→C 连续换点与滚轮滚动实测通过。
- 10m focus 已改为本地 PNG-alpha PMTiles（24 tiles / 1,883,514 bytes），裁切外透明并以 320m 短边 feather 混合 30m base；`?focus=missing` 仍独立降级。
- P8 尚未完成：同日相邻 Sentinel COG 在扩大 surface context 的 Range 读取中持续失败，真实覆盖 Gate 分别只达到 99.8623% / 94.8935%；脚本拒绝纯色填边，现有 30m surface 资产未被覆盖，因此“所有正常视角无 surface 裁切线”尚未通过。
- P9 代码与资料链已完成；桌面、手机、历史节点镜头、退出恢复与原五章导览时长按用户清单留给人工验收。
- P11A 代码侧已完成；腾讯云账号、香港 Bucket、EdgeOne、自定义域名、HTTPS 与首次手动 workflow 均由用户后续配置，尚未宣称云端部署成功。

## 下一步

- 重新获取失败的 2026-08-06 相邻 Sentinel-2 COG 场景，或采用同许可公共分发镜像；只有 render context 达到完整真实覆盖后才重建 30m surface、复验倾斜/bearing/fullscreen 并关闭 P8。
- 白刺果名称已经确认，相关现场记录已统一使用确认名称。
- 后续采访素材补齐授权范围、日期与转录记录。
- 由用户决定何时提交、push P11A；随后按 `docs/DEPLOY_TENCENT_COS.md` 完成腾讯云配置和首次手动发布 Gate。

## 已知风险

- P8 主 surface 外围扩展仍被真实数据读取阻塞；脚本保持 fail-closed，未用纯米色、拉伸或 AI 纹理填补缺口。当前 P7 30m surface 仍为旧的 0.05° buffer，整体边界 seam Gate 未关闭；本轮只关闭了 10m focus overlay 的矩形硬边。
- `public/` 中新增约 17.9 MiB terrain 与 20.4 MiB surface PMTiles；单文件仍低于常见 Git 托管限制。Surface 使用 Range 按需读取，terrain 仍沿用 P6 整包增强加载。
- P11A 改动未 commit、push 或部署；受保护的 `docs/CONTEXT_POLICY.md` 与 `docs/HANDOFF.md` 以及既有 `package-lock.json` 工作树状态保持未修改、未纳入。
- GPS 采样线来自影像元数据，只反映部分拍摄点；不得解释为完整路线、基地边界或导航坐标。
- 白刺果名称已确认；直播展示农产品已确认为哈密瓜。

## 验证基线

- 构建命令：`npm run build`
- 测试命令：`npm test`
- 当前结构测试：23 项（包含导览时长、overview/detail 镜头、marker label、drawer pointer、focus PNG-alpha/provenance、增强独立失败、单 MapLibre、无在线运行时底图与无 3D terrain）
- 部署方式：Vinext 静态导出 `dist/client`；GitHub Pages 为现有自动发布/回退通道，Tencent COS 香港 + EdgeOne 为手动触发的第二发布通道 Pilot


## 下一步

# 项目待办

## 近期

- [x] P0：完成一键五章自动导览、暂停/继续、完成与重新开始闭环
- [x] P1：精简重复免责声明并保留结构化事实边界
- [x] P2：建立五章与来源、点位、水脉、资源的双向证据索引
- [x] P3：将权威网络来源扩充至 16 项并接入实际证据关系
- [x] P4：完成首页一键播放、总进度、键盘控制与完成态出口
- [x] P5：统一术语与发布语义，更新维护指南并完成全站终验
- [x] 将导览升级为地图位点、图片视频与文字资料的全自动分镜轮播
- [x] 完成 P0 首页“五章故事骨架”改造，并支持从首页进入指定导览章节
- [x] 实现五章滚动叙事与地图镜头联动，并补充章节深链接
- [x] 发布影像扩充版并核对私有访问与回退版本
- [x] 确认构建命令和测试命令
- [x] 完成 Git 安全与忽略规则检查
- [x] 接入23项新增影像、3个实拍活动点和2条GPS采样线
- [x] 扩充科普、传播分类并将媒体统计改为数据驱动
- [x] 完成隐私裁剪、内容校验、Lint、构建和自动测试
- [x] 在基地地图点中分组呈现中暑预防科普、直播助农尝试、志愿基地与治沙技术证据
- [x] 优化本地底图的地貌、道路与叙事线层级，降低线条堆积感
- [x] 完成“绿洲纪录片 × 数字博物馆”全站 UI、极简播放栏、探索菜单与多尺寸验收
- [x] 完成数字地图第二轮制图质感精修、selected marker、语境标签缩放治理与多模式浏览器验收
- [x] P6：接入真实本地 DEM、轻量 hillshade、三模式强度与 terrain 失败独立降级
- [x] P7：接入真实 Sentinel-2 地表 raster，以 Range 驱动的 PMTiles 与矢量/弱 hillshade 融合，并完成独立失效降级
- [x] P9：在原 water/time-machine 与唯一 MapLibre 中增加“绿洲生死线”水沙历史叙事
- [x] 将站点静态化并加入 GitHub Pages 自动发布流程，移除 Worker、D1 与 ChatGPT 托管运行时依赖
- [x] P11A：增加隔离的 Tencent COS 香港手动发布 workflow 与 EdgeOne 控制台维护说明，保留 GitHub Pages

## 后续

- [x] 建立五章与影像、来源、地图点位、档案章节之间的双向证据索引
- [x] 根据专业确认更新白刺果名称与内容边界
- [ ] 后续采访素材增加授权范围、日期与转录记录
- [ ] 在可授权系统 Fullscreen API 的人工浏览器中补做一次全屏视觉确认（自动化浏览器拒绝进入系统全屏）

## 已完成

- [x] 初始化长期维护文档
- [x] 保守完善 `.gitignore`


## 验收标准

待补充。

## 最近验证

旧档案未集中记录。

## 上次交接

# 下次接续

- 更新：2026-08-12
- 上次完成：建立项目档案
- 正在进行：暂无
- 下一步：确认第一项任务
- 阻塞：暂无
