# 民勤中医药生态文化数字地图

北京中医药大学生命科学学院“绿洲药韵·丝路智传实践团”2026年暑期社会实践数字成果。

网站以单页互动地图呈现四类内容：实践足迹、绿洲水脉、药材产业和人物故事。现场照片未附GPS，因此地图中的县域叙事点、村级近似定位和公开知识点均在数据中明确区分。

## 本地运行

```bash
npm install
npm run media:prepare
npm run dev
```

## 验证

```bash
npm test
```

## 内容维护

日常补充内容主要操作两个目录：

- `content/`：来源、媒体索引、点位、时间线、水脉阶段、药材档案与展框章节。
- `public/media/`：按拍摄日期归档的照片和视频；公共字幕放在 `shared/`。

详细目录职责见 [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)，添加照片、点位和来源的步骤见 [docs/CONTENT_UPDATE_GUIDE.md](docs/CONTENT_UPDATE_GUIDE.md)。

只检查内容引用与隐私边界时运行：

```bash
npm run content:validate
```

地图核心逻辑位于 `app/components/map/`、`app/hooks/` 与 `app/lib/`。普通内容维护无需修改这些文件。
