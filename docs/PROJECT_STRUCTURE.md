# 项目结构说明

本项目把“内容维护”与“地图核心代码”分开。后续补照片、点位、文案和来源时，优先进入 `content/` 与 `public/media/`，不要直接修改地图初始化代码。

```text
site/
├─ app/
│  ├─ components/
│  │  ├─ experience/   页面状态、URL 模式和总体编排
│  │  ├─ map/          地图界面、点位与故事抽屉
│  │  ├─ exhibit/      数字展框与四个受控模块
│  │  └─ sections/     首页长页面各章节
│  ├─ hooks/           PMTiles 初始化、标记与镜头控制
│  ├─ lib/             地图配置和通用格式化
│  ├─ styles/          基础、页面、地图、展框、响应式样式
│  ├─ layout.tsx
│  └─ page.tsx
├─ content/            所有可维护的结构化内容
├─ public/
│  ├─ maps/            本地 PMTiles 底图
│  └─ media/           按日期归档的照片、视频和公共字幕
├─ scripts/            媒体预处理与内容校验
├─ tests/              构建后自动测试
└─ docs/               项目说明与维护指南
```

## `content/` 文件职责

| 文件 | 维护内容 |
| --- | --- |
| `types.ts` | 数据接口。除非新增功能，否则不要修改。 |
| `sources.ts` | 公开资料来源、发布日期和链接。 |
| `media.ts` | 站内媒体索引、字幕、拍摄时间及精选状态。 |
| `story-points.ts` | 地图点位、定位精度、内容来源和关联媒体。 |
| `field-timeline.ts` | 8月3—4日实践轨迹事件。 |
| `field-tracks.ts` | 由影像 EXIF 整理的 GPS 采样线及非导航声明。 |
| `water-stages.ts` | 水脉历史时间线和四个阶段。 |
| `resources.ts` | 药材档案与生态关系边。 |
| `exhibit-scenes.ts` | 五章导览镜头、讲解和主媒体。 |
| `index.ts` | 统一导出与 ID 索引，页面只从这里读取数据。 |

## 稳定基础设施

`.openai/`、`worker/`、`db/`、`drizzle/`、`examples/` 与构建产物属于站点或模板基础设施。本项目不启用数据库；内容维护时不要把照片或文案放入这些目录。

地图包固定为 `public/maps/minqin-2026.pmtiles`，应保持在 10MB 以内。地图范围、叙事路线和底图样式位于 `app/lib/map-config.ts`；除非确实调整地图行为，否则无需修改。

## 样式边界

- `base.css`：字体、颜色变量和基础元素。
- `page.css`：首页长页面。
- `map.css`：地图、标记与故事卡。
- `exhibit.css`：单屏数字展框及其四个模块。
- `responsive.css`：手机、16:9 大屏和减少动态效果。

现有类名保持不变。调整某一模块时，优先只修改对应样式文件，降低视觉回归风险。
