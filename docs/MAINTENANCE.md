# 维护日志

每次完成实际维护后，由 Codex 在顶部追加一条简短记录。

## 2026-08-13 - P7 Sentinel-2 真实地表与矢量融合

- 数据 Gate：采用 Element 84 通过 AWS Open Data 分发的 Sentinel-2 Collection 1 L2A COG；Copernicus 许可允许复制、分发、公开传播、修改与组合，发布署名为“Contains modified Copernicus Sentinel data 2026”
- 场景与范围：选择 2026-08-06 覆盖民勤的 48STH / 48SUH / 48STJ / 48SUJ 四景，场景云量 0–1.06%；使用官方 B04/B03/B02 TCI，自 10m 下采样至 30m，只裁切 `mapBounds` 外扩约 0.05° 的 `[102.40, 37.75, 103.80, 39.40]`
- P7A Gate：先生成县城绿洲局部 prototype，固定默认视角 Before/After 一次通过；After 明显呈现农田格网、绿洲—裸地边缘和聚落周边结构，随后才扩展全范围
- 离线资产：`minqin-surface-2026.pmtiles` 为 z7–13、2212 个 JPEG 瓦片、21,406,499 bytes；JSON provenance 记录 provider、dataset、许可、日期、云量、波段、分辨率、范围、场景 URL、处理链与 SHA-256
- 可复现：新增 `scripts/prepare-map-surface.py`；离线环境使用固定 rasterio / mercantile / Pillow / NumPy，脚本并行裁切四个 COG、低饱和暖色分级、生成 MBTiles，并用校验后的 go-pmtiles v1.31.2 转换，不增加生产依赖
- 加载与层序：基础 PMTiles 先就绪；surface 以已验证 206 的 HTTP Range 按需加入，随后 terrain 独立加入；层序为 earth → surface → hillshade → 半透明 landcover/landuse → water/roads/labels → 项目 routes/markers
- 制图：landcover / landuse 大幅降低遮盖，surface 为主纹理、hillshade 为弱地貌；水脉关系示意线降低宽度/opacity；“民勤县”去除胶囊/边框/阴影并改为中英制图文字；自由 / Story / Tour 使用递减 surface 权重
- 失效与架构：`?surface=missing` 与 `?terrain=missing` 均只降级对应增强，基础矢量、点位和抽屉保持；单 MapLibre、OSM / Sentinel / terrain attribution、GPS 采样线与 selected marker 语义不变，未启用 `setTerrain()` 或运行时在线瓦片
- 浏览器：固定同视角 Before/After 明显通过；覆盖 1920×1080 Story、1366×768 free/water/GPS selected、980px Tour、390×844 移动抽屉，以及 surface missing、terrain missing 与既有 fallback；均无横向溢出或 console warn/error
- 验证：`npm run content:validate`、`npm run lint`、`npm test` 全部通过，20/20 结构测试成功；开发静态服务 Range 请求返回 206 Partial Content
- 发布：未提交、未 push、未部署；`docs/CONTEXT_POLICY.md` 与 `docs/HANDOFF.md` 原样保留且不加入范围

## 2026-08-12 - P6 本地真实高程与轻量地形阴影

- 数据 Gate：采用 AWS Open Data 上由 Mapzen（Linux Foundation）管理的 Terrain Tiles；民勤瓦片响应元数据确认高缩放来自 USGS SRTM 1 Arc-Second Global，低缩放合成含 GMTED2010；两者为公共领域数据并保留 Mapzen / USGS 署名
- 离线资产：只裁切 `mapBounds` 外扩约 0.05° 的 `[102.40, 37.75, 103.80, 39.40]`，生成 z7–12、595 个 Terrarium PNG 瓦片的 PMTiles v3，最终 18,792,004 bytes；`minqin-terrain-2026.json` 记录来源、许可、范围、编码、实际 source file 与 SHA-256
- 可复现：新增 `scripts/prepare-map-terrain.py`，仅用 Python 标准库下载瓦片、生成 MBTiles，并下载固定 go-pmtiles v1.31.2；官方 release SHA-256 校验通过后才转换，不增加生产依赖
- 加载与制图：基础 `minqin-2026.pmtiles` 先加载并进入 `mapReady`，再异步接入 raster-dem / hillshade；层位按实际 `landcover` 后一层计算，自由/Story/Tour 复用同一层并逐级减弱，zoom 11.5 后强度回落，未启用 3D terrain
- 失效与署名：`?terrain=missing` 实测基础矢量图、点位选择和抽屉继续可用，`mapFallback=false`、console 0 warn/error；`?map=fallback` 仍进入原本地沙盘；OSM、Mapzen、SRTM/GMTED2010 attribution 均可见
- 浏览器：真实检查默认、zoom 8/10/13、GPS/近似/水脉 selected、Story、Tour、terrain 失效、fallback 与 390×844 移动抽屉；无横向溢出。自动化浏览器拒绝进入系统 fullscreen，现已捕获权限拒绝避免未处理异常；按钮与成功路径保留，视觉列为后续人工确认
- 验证：`npm run content:validate`、`npm run lint`、build 与 18 项结构测试通过；最终 `npm test` 和 `git diff --check` 在收口后复跑
- 发布：未提交、未 push、未部署；`docs/CONTEXT_POLICY.md` 与 `docs/HANDOFF.md` 原样保留且不加入范围

## 2026-08-12 - 数字地图第二轮制图质感精修

- 制图：集中 cartographic palette / tuning，基于 Protomaps 实际图层为 highway、major、minor、service、边界、建筑和地貌设置渐进缩放层级，保留原有复杂颜色与宽度表达式
- 叙事线：实践路线衬底/虚线、两条 GPS 影像采样线和水脉关系线全部改为 zoom-aware width / opacity，继续保留非导航、非完整轨迹和关系示意语义
- 点位与标签：marker 改为 44px 操作区内的 ring + core 测绘站符号；selected 状态接入地图 marker、ARIA 与非选中降权；城市、水体、镇级 DOM 标签按缩放分级
- Chrome 与响应式：point-list / 图例可展开，原生控件与自定义工具错位；手机抽屉保留 selected marker，fallback 提示避开工具，700px 断点覆盖 200% 等效缩放
- 镜头：统一 selected、tour、timeline、resource 与关系点位镜头参数，不修改章节 `mapView`、URL、播放时长或状态机
- 验证：Browser Skill 覆盖 1920×1080、1366×768、980px、390×844、683px 等效 200%、story、tour、GPS/县域点选中、fallback 与 fullscreen；单一地图和 OSM attribution 保持，控制台无 warn/error
- 发布：未提交、未 push、未部署；`docs/CONTEXT_POLICY.md` 与 `docs/HANDOFF.md` 原样保留

## 2026-08-12 - 纪录片与数字博物馆 UI 收口

- 视觉：补齐全站表面色、文字、间距、字号、焦点与运动令牌；首页与五章采用编辑式网格，档案、来源、数据和药材统一为米白展签
- 展框：拆分展示头、分镜舞台、极简播放栏和探索菜单；桌面为约 60/40 地图叙事布局，来源分镜固定呈现机构、日期、标题、摘要和原文入口
- 响应式：手机调整为地图 38% / 内容 62%，探索菜单使用横向抽屉；暂停时自动展开且可手动收起，键盘和现有播放逻辑保持不变
- 验证：`npm run lint`、`npm test` 与 `git diff --check` 通过，15/15 自动测试成功；真实浏览器覆盖 1366×768、1920×1080、980px、390×844 和 200% 等效宽度，控制台无错误
- 发布：未 push、未部署

## 2026-08-12 - 全自动导览分镜

- 分镜：从章节、点位、媒体和来源关系自动派生开场、点位摘要、精选图片、关联视频与来源文字，不维护第二套内容清单
- 地图：章内分镜携带关联点位时自动移动镜头并切换图层，文字来源没有专属点位时回到章节镜头
- 媒体：图片自动切换；视频在 playing 状态自动静音循环播放，暂停导览时停止，移动端继续显示媒体
- 验证：运行 `npm run lint` 与 `npm test`，并在本地预览检查一键导览的分镜变化

## 2026-08-12 - P0–P5 全站收口

- 术语：导航、首页、展框、证据档案与 Footer 统一为“2026暑期实践数字成果 / 持续维护版”，素材拍摄日期保持不变
- 文档：README 增加一键导览、证据索引和来源维护概览；内容指南补充来源元数据、实际 usage 与唯一时间轴要求
- 状态：P0–P5 全部标记完成；专业植物鉴定与采访授权继续作为真实后续项
- 验证：P5 按计划运行 `npm run lint`、`npm test`、Git 状态与轻量静态检查
- 发布：本轮不 push、不部署

## 2026-08-12 - 连续导览体验打磨

- 入口：首页主 CTA 更新为“开始自动导览”，一次点击直接从第一章进入 playing；自由浏览与指定章节入口继续保留
- 进度：按五章时长求和显示 1 秒粒度总进度，暂停保留当前章进度，手动跳章从新章重新计时
- 键盘：空格播放/暂停，左右方向键跳章，Esc 退出；触摸轻扫和 Back / Forward 深链接逻辑保持不变
- 完成：末章提供“自由探索地图”和“查看资料依据”两个站内出口，不循环、不自动打开外链
- 验证：P4 按计划运行 `npm run lint` 与 `npm test`

## 2026-08-12 - 权威来源网络扩容

- 来源：核对并新增国家林草局、生态环境部、国家发改委和人民网等 8 条资料，总来源达到 16 条
- 元数据：全部来源补齐 `kind`、`topics` 与 `summary`，说明来源类型、主题和支撑范围
- 接入：新增资料分配至水写绿洲、科技与沙产业、青年守护，以及对应点位、水脉阶段和肉苁蓉资源；现场实践章继续以团队影像为主
- 校验：内容校验新增来源数量、元数据、引用完整性与孤立来源检查
- 验证：P3 按计划运行 `npm run content:validate` 与 `npm run build`

## 2026-08-12 - 五章双向证据索引

- 数据：新增 `evidence-index.ts`，从现有章节、点位、水脉阶段与资源的 ID 关系派生 `chapterEvidenceById` 和 `sourceUsageById`
- 展示：数字展框每章显示来源数、来源入口、关联影像与点位数；Footer 为每条来源显示反向支撑对象
- 维护：来源缺少实际 usage 会被内容校验拦截；空 `sourceIds` 仍返回安全的空证据集合
- 验证：P2 按计划运行 `npm run lint` 与 `npm run build`

## 2026-08-12 - 证据文案减负

- 叙事：五章 eyebrow、narration、首页标题和展框模块说明改为肯定陈述，直接说明历史、水脉、现场与产业关系
- 边界：GPS 精度继续由 `accuracy`、`locationNote`、图例和方法说明承担；医学与隐私限制集中在基地证据分组；白刺果使用确认名称，项目计划标签保留
- 校验：移除对“医疗功效”“非采访引语”固定字符串的全站依赖，改为检查结构化医学/隐私边界与计划事实标签
- 验证：P1 按计划运行 `npm run content:validate` 与 `npm run lint`

## 2026-08-12 - 一键五章自动导览

- 播放：新增 `idle / playing / paused / completed` 单一状态；分镜改为文字 4 秒、图片 12 秒、视频真实时长，五章媒体不重复
- 交互：支持自动播放、暂停、继续、自动换章、末章完成与重新播放；手动换章会清理旧计时并按当前章节重新计时
- 复用：换章继续走既有 `goToChapter()`、地图图层/镜头与 `chapter` URL，退出保留焦点恢复与地图 resize
- 验证：P0 按计划运行 `npm run lint` 与 `npm test`

## 2026-08-12 - 本地底图视觉层级优化

- 地貌：调整荒漠、农田、绿地与水体配色和填充透明度，让区域底色承担主要空间识别
- 道路：在低缩放隐藏支路、服务道路和琐碎道路，主干路按等级降低线条对比度；行政边界同步弱化
- 叙事：实践虚线增加浅色衬底并降低宽度和不透明度，GPS 采样线缩细，继续保留“非完整轨迹、非导航路线”语义
- 修改：更新 `map-config.ts`、`use-minqin-map.ts`、`map.css`、结构测试及项目记录；未修改 PMTiles、坐标、地图实例数量或内容事实
- 验证：`npm run lint`、`npm test` 均通过，自动测试 9/9 通过；桌面预览确认地貌、主干路和故事点形成明确层级
- 发布：遵守当前任务不提交 Git commit 的约束，本轮只更新本地预览，未推送或发布线上版本

## 2026-08-12 - 公益林基地三项现场证据呈现

- 信息结构：将原先合并展示的基地素材整理为“中暑预防科普”“直播助农尝试”“志愿基地与治沙技术证据”三个分组，地图故事抽屉按事件呈现对应影像
- 定位方式：三个分组继续共用 `base-activity-center` 的 GPS 实拍区域，只增加内容层级，不增加未经核验的地图点或坐标
- 内容边界：科普记录不构成医学建议；直播素材不展示账号、评论、订单、销量或平台数据；标牌与展板不用于推断培训经历、人物归属或基地边界
- 修改：更新内容类型与基地故事点、地图故事抽屉、地图/移动端样式、结构测试及四份项目记录；未修改 MapLibre hook、PMTiles、GPS 数据、媒体文件或既有数据数量
- 验证：`npm run content:validate`、`npm run lint`、`npm test` 均通过，自动测试 8/8 通过；43 项媒体、18 项精选、15 个地图点、5 个导览章节及其他正式成果数据基线保持不变
- 发布：遵守当前任务“不提交 Git commit”的约束，本轮未推送或发布新版本；后续继续建立五章与其余影像、来源和档案章节之间的双向证据索引

## 2026-08-11 - 五章滚动地图叙事与章节深链接

- Scrollytelling：使用 `IntersectionObserver` 识别五章区域与当前章节；桌面端当前 step 高亮并驱动章节图层、`mapView` 镜头和 `pointIds`，未使用高频 scroll handler 或第三方动画库
- 单地图复用：仍只渲染一个 `InteractiveMap` 和一个 MapLibre 实例；故事模式用 CSS 将原地图临时固定为左侧舞台，退出后调用 `resize()` 并恢复全宽自由地图
- 深链接：支持首页及数字展框的 `chapter=<tourChapters.id>`，章节切换使用 `replaceState`，Back / Forward、无效章节与退出焦点恢复均已验证
- 响应式：仅大于 980px 启用 fixed 双栏；390px 下保持自然单列、媒体无横向溢出、自由地图与现有移动展框可用
- 修改：更新 `experience.tsx`、`long-form-page.tsx`、`interactive-map.tsx`、`page.css`、`map.css`、`responsive.css`、`rendered-html.test.mjs` 及四份项目记录；未修改地图 hook、地图配置、内容数据或 PMTiles
- 自动验证：`npm run content:validate`、`npm run lint`、`npm test` 均通过；自动测试 7/7 通过，43 项媒体、18 项精选、4 个水脉阶段、4 个资源关系、5 个导览章节基线不变
- 人工验证：桌面五章逐章状态/点位/URL、五个“进入这一章”入口、自由地图恢复、两类第三章深链接、展框 rail/前后章、Back / Forward、无效 chapter、fallback、390px 移动端与焦点恢复均通过；控制台 0 错误
- Reduced motion：临时启用系统“减弱动态效果”后，浏览器 `prefers-reduced-motion: reduce` 为 true，章节过渡降至 0.01ms，地图镜头代码走 duration 0 分支；验收后已恢复系统原动画设置
- 剩余风险：章节切换阈值依赖浏览器 IntersectionObserver 的交叉比例，未来若显著改变 step 高度，应同步复核 root margin；下一步建立章节与证据档案双向索引

## 2026-08-11 - 首页五章故事骨架改造

- 信息架构：以现有 `tourChapters` 建立“河西入境 → 水写绿洲 → 两日实践 → 科技与沙产业 → 青年守护”首页主线；探索工具与证据/档案降为清晰的次级层级
- 修改：更新 `long-form-page.tsx`、`experience.tsx`、`page.css`、`responsive.css`、`rendered-html.test.mjs` 及四份项目记录；每章可直接打开数字展框对应章节
- 验证：`npm run content:validate`、`npm run lint`、`npm test` 均通过；自动测试 7/7 通过
- 数据边界：未修改内容事实、GPS 点/采样线语义、地图底层或 PMTiles；43 项媒体、4 个水脉阶段、4 个资源关系、5 个导览章节基线保持不变
- 后续：实现五章滚动叙事与地图镜头联动，并补充章节深链接

## 2026-08-11 - 实践影像与 GPS 记录扩充

- 操作：复核两个原始素材目录，筛选8月3—4日采摘、科普、直播助农、浇水和基地环境影像
- 修改：新增23项压缩媒体、3个GPS实拍活动节点、2条影像GPS采样线、科普与传播时间线分类；更新五章导览、图例、数据统计和维护指南
- 隐私：直播媒体采用中央裁剪，未发布账号、评论、订单或商品卡；发布文件删除音频和元数据
- 验证：`npm run content:validate`、`npm run lint`、`npm test` 均通过；6项自动测试全部通过
- 发布：私有站点版本11已上线，版本10保留用于回退
- 后续：白刺果名称已确认，GPS采样线不得用于导航

## 2026-08-11 - Git 安全配置复核

- 操作：复核 Git 状态、Node/Vinext 项目结构、隐藏目录、敏感文件名、凭据模式和大文件
- 修改：未改动业务源码或现有 `.gitignore` 规则；仅同步项目状态与待办表述
- 验证：敏感文件名与疑似硬编码凭据均为 0 命中；5 个 11.8–14.0 MB 压缩包均位于已忽略的 `outputs/`
- 后续：等待用户确认下一次提交范围；仓库已有提交历史，并非无历史的首次提交状态

## 2026-08-08 - Git 安全配置

- 操作：检查 Git 状态、Node/Vinext 项目结构、敏感文件名、凭据模式和大文件
- 修改：保留原有规则并补充本机缓存、临时文件、系统垃圾文件和常见私钥格式的忽略规则；同步维护文档
- 验证：未发现 `.env`、私钥或疑似硬编码凭据；5 个 11.8–14.0 MB 发布压缩包均位于已忽略的 `outputs/`
- 后续：首次提交前由用户确认纳入范围；已跟踪的 `public/` 媒体会增加仓库体积

## 2026-08-08 - 初始化

- 操作：创建长期维护文档
- 修改：未修改业务源码
- 验证：维护文档已建立
- 后续：完成项目健康检查并补充验证基线
