"use client";

/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";
import { herbs, media, sourceById, sources, storyPoints, timelineEvents, waterTimeline } from "@/content";

type LongFormPageProps = {
  mapSlot: ReactNode;
  showAllMedia: boolean;
  onToggleMedia: () => void;
  onStartExhibit: () => void;
  onEnterMap: () => void;
};

const mediaDays = [
  { key: "2026-08-03", label: "8月3日", title: "进入民勤 · 采摘观察 · 科普传播" },
  { key: "2026-08-04", label: "8月4日", title: "公益林养护 · 基地记录" },
];

export function LongFormPage({ mapSlot, showAllMedia, onToggleMedia, onStartExhibit, onEnterMap }: LongFormPageProps) {
  const fieldDates = new Set(timelineEvents.map((event) => event.day));
  const visitedPoints = storyPoints.filter((point) => point.contentOrigin === "团队实践").length;
  const publicPoints = storyPoints.filter((point) => point.contentOrigin === "公开资料").length;
  const featuredMediaCount = media.filter((asset) => asset.featured).length;

  return <>
    <header className="site-nav" aria-label="主导航">
      <a className="brand" href="#top" aria-label="返回首页"><span className="brand-mark">绿</span><span><strong>绿洲药韵</strong><small>MINQIN FIELD ATLAS</small></span></a>
      <nav><a href="#dossier">项目档案</a><a href="#map">数字地图</a><a href="#field-media">实践影像</a><a href="#sources">资料来源</a></nav>
      <span className="nav-date">首期正式成果 · 2026</span>
    </header>

    <section className="hero" id="top">
      <img className="hero-image" src="/media/2026-08-04/banner-team.webp" alt="实践团在民勤荒漠中举起队旗" />
      <div className="hero-wash" /><div className="weather-grid" aria-hidden="true" />
      <div className="hero-kicker"><span>河西走廊 · 石羊河下游</span><span>首期正式成果 / 2026.08.11</span></div>
      <div className="hero-content"><p className="super-title">守护河西绿洲</p><h1>在沙与水之间，<br />读懂一座绿洲。</h1><p className="hero-lead">民勤生态治理背景下中医药资源利用与“一带一路”绿色传播实践</p><div className="hero-actions"><button className="primary-action" onClick={onStartExhibit}>进入数字展框 <span>→</span></button><button className="secondary-action" onClick={onEnterMap}>自由浏览</button><span className="team-label">北京中医药大学生命科学学院<br />绿洲药韵·丝路智传实践团</span></div></div>
      <div className="hero-readout" aria-label="项目数据概览"><div><strong>{String(fieldDates.size).padStart(2, "0")}</strong><span>实践日<br />FIELD DAYS</span></div><div><strong>{String(visitedPoints).padStart(2, "0")}</strong><span>团队足迹<br />FIELD POINTS</span></div><div><strong>{String(media.length).padStart(2, "0")}</strong><span>影像素材<br />MEDIA ASSETS</span></div></div>
    </section>

    <section className="dossier" id="dossier" aria-labelledby="dossier-title">
      <div className="section-index">00 / 项目档案</div><div className="dossier-heading"><p className="eyebrow">PROJECT DOSSIER</p><h2 id="dossier-title">一份可追溯、<br />可继续生长的数字成果。</h2></div>
      <div className="dossier-card"><dl><div><dt>项目</dt><dd>民勤生态治理背景下中医药资源利用与“一带一路”绿色传播实践</dd></div><div><dt>团队</dt><dd>北京中医药大学生命科学学院<br />绿洲药韵·丝路智传实践团</dd></div><div><dt>实践时间</dt><dd>2026年8月3—4日（首期素材）</dd></div><div><dt>方法</dt><dd>实地观察、劳动记录、影像采集、公开资料核验与数字地图叙事</dd></div></dl><div className="dossier-stats"><article><strong>{visitedPoints}</strong><span>团队实践点</span></article><article><strong>{publicPoints}</strong><span>公开知识点</span></article><article><strong>{featuredMediaCount}</strong><span>导览精选影像</span></article><article><strong>{sources.length}</strong><span>公开资料来源</span></article></div><p className="boundary-note"><b>内容边界</b> 团队到访与公开知识点分开统计；GPS 实拍点只表示影像拍摄区域，采样线不是完整轨迹或导航路线；植物名称待专业核验；医学内容只记录科普活动，不提供诊疗建议。</p></div>
    </section>

    <section className="hexi-intro" aria-labelledby="hexi-title"><div className="section-index">01 / 河西入境</div><div><p className="eyebrow">FROM SILK ROAD TO GREEN CORRIDOR</p><h2 id="hexi-title">古丝路打开通道，<br />今天的青年续写绿色通道。</h2></div><div className="hexi-copy"><p>公元前139年，张骞出使西域；河西走廊随后成为连接东西方文明的重要通道。凉州，即今天的武威，是走廊东端的重要城市。</p><p className="note"><span>说明</span>这是文化背景，不等同于本次实践行程。地图虚线统一标记为“叙事路径，非导航路线”。</p><a href={sourceById.get("hexi-history")?.url} target="_blank" rel="noreferrer">阅读历史资料 ↗</a></div></section>

    {mapSlot}

    <section className="field-media" id="field-media" aria-labelledby="media-title">
      <div className="section-index">03 / 实践影像</div><div className="media-heading"><div><p className="eyebrow">TWO DAYS IN THE FIELD</p><h2 id="media-title">两天，五类行动。</h2></div><p>采摘观察、主题科普、直播助农、浇水维护与基地记录共同构成两日实践。视频均由用户点击后播放；展开后可查看首期全部 {media.length} 项素材。</p></div>
      <div className="media-days">{mediaDays.map((day) => { const assets = media.filter((asset) => asset.capturedAt.startsWith(day.key) && (showAllMedia || asset.featured)).sort((a, b) => { const aKey = a.capturedAt.length === 10 ? `${a.capturedAt} 23:59:59` : a.capturedAt; const bKey = b.capturedAt.length === 10 ? `${b.capturedAt} 23:59:59` : b.capturedAt; return aKey.localeCompare(bKey); }); return <article key={day.key} className="media-day"><div className="media-day-title"><strong>{day.label}</strong><span>{day.title}</span></div><div className="media-grid">{assets.map((asset) => <figure key={asset.id}>{asset.type === "image" ? <img src={asset.src} alt={asset.alt} loading="lazy" /> : <video src={asset.src} poster={asset.poster} controls preload="none" aria-label={asset.alt}><track kind="captions" src="/media/shared/ambient-zh.vtt" srcLang="zh" label="中文说明" default /></video>}<figcaption><time>{asset.timeLabel ?? asset.capturedAt.slice(11)}</time><p>{asset.caption}</p>{asset.featured && <b>导览精选</b>}</figcaption></figure>)}</div></article>; })}</div>
      <button className="gallery-toggle" onClick={onToggleMedia} aria-expanded={showAllMedia}>{showAllMedia ? "收起完整素材" : `查看全部 ${media.length} 项素材`}</button>
    </section>

    <section className="water-story" id="water-story" aria-labelledby="water-title"><div className="section-index">04 / 绿洲水脉</div><div className="water-title-block"><p className="eyebrow">WATER WRITES THE OASIS</p><h2 id="water-title">青土湖，记录一座绿洲的呼吸。</h2><p>这不是“实时增长曲线”，而是公开资料中的四个历史切片。每一个数字都保留对应年份与来源。</p></div><div className="timeline">{waterTimeline.map((item, index) => <article key={item.year}><div className="timeline-year"><span>{index + 1}</span><strong>{item.year}</strong></div><h3>{item.title}</h3><p>{item.note}</p><a href={sourceById.get(item.sourceId)?.url} target="_blank" rel="noreferrer">查看来源 ↗</a></article>)}</div></section>

    <section className="herb-story" id="herb-story" aria-labelledby="herb-title"><div className="herb-heading"><div className="section-index light">05 / 药材产业</div><p className="eyebrow light">FROM DESERT RESOURCE TO RESPONSIBLE STORY</p><h2 id="herb-title">认识资源，<br />不夸大功效。</h2><p>证据标签区分公开可核信息与项目计划关注。首期不把计划设想写成已经完成的走访成果。</p></div><div className="herb-grid">{herbs.map((herb, index) => <article key={herb.id}><div className="herb-number">0{index + 1}</div><span className={`herb-evidence ${herb.evidenceLabel === "项目计划关注" ? "planned" : "verified"}`}>{herb.evidenceLabel}</span><span className="herb-tag">{herb.tag}</span><h3>{herb.name}</h3><em>{herb.latinLabel}</em><p>{herb.description}</p><small>{herb.descriptionEn}</small>{herb.sourceIds.map((id) => { const source = sourceById.get(id); return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer">资料 ↗</a> : null; })}</article>)}</div><div className="chain" aria-label="药材产业链示意">{[["种植", "CULTIVATION"], ["采收", "HARVEST"], ["初加工", "PRIMARY PROCESSING"], ["产品", "PRODUCT"], ["传播与市场", "COMMUNICATION"]].map(([zh, en], index) => <div key={zh}><span>{String(index + 1).padStart(2, "0")}</span><strong>{zh}</strong><small>{en}</small></div>)}</div></section>

    <section className="closing-story" aria-labelledby="closing-title"><img src="/media/2026-08-04/volunteer-signs.webp" alt="公益林基地里志愿者留下的手绘牌" loading="lazy" /><div className="closing-copy"><div className="section-index light">06 / 青年守护</div><p className="eyebrow light">ONE TREE, MANY HANDS</p><h2 id="closing-title">地图上的一个点，<br />是现实中的一段长期维护。</h2><p>种下一棵树只是开始。补水、养护、记录与传播，才让一次社会实践进入更长的时间尺度。</p><blockquote>我们记录的不是一个完成式，而是一座绿洲仍在继续的故事。</blockquote><span>— 实践地图编辑说明（非采访引语）</span><button className="closing-tour" onClick={onStartExhibit}>以5分钟导览重看全篇 →</button></div></section>

    <footer id="sources"><div className="footer-brand"><span className="brand-mark">绿</span><div><strong>民勤中医药生态文化数字地图</strong><small>首期正式成果 · 绿洲药韵·丝路智传实践团</small></div></div><div className="footer-sources"><h2>资料来源</h2>{sources.map((source, index) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span>{String(index + 1).padStart(2, "0")}</span><div>{source.title}<small>{source.publisher} · {source.publishedAt}</small></div><b>↗</b></a>)}</div><div className="method-note"><strong>资料与方法说明</strong><p>团队照片与视频摄于2026年8月3—4日；公开资料用于历史、生态、科研、人物与产业背景。公开知识点不计入团队到访；GPS 实拍点与采样线来自影像元数据，不表示完整轨迹、行政边界或导航位置。网站底图为本地 PMTiles，底图失败时文字与影像仍可浏览。</p></div><div className="footer-note"><p>隐私与医学边界：不展示手机号、学号、邮箱、平台账号或订单信息；不使用未经证实采访引语；不作药物疗效宣传。</p><p>版本：首期正式成果 · 更新于 2026.08.11</p></div></footer>
  </>;
}
