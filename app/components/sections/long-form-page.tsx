"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, type ReactNode } from "react";
import { backgroundMusicLicense, backgroundTracks, herbs, media, mediaById, publicAsset, sourceById, sources, sourceUsageById, storyPoints, timelineEvents, tourChapters, waterTimeline } from "@/content";

type LongFormPageProps = {
  mapSlot: ReactNode;
  showAllMedia: boolean;
  onToggleMedia: () => void;
  onStartExhibit: (initialIndex?: number, autoplay?: boolean) => void;
  storyIndex: number;
  storyTargetId: string | null;
  onStoryChapterChange: (index: number) => void;
  onStoryMapModeChange: (active: boolean) => void;
  onStoryTargetHandled: () => void;
  bgmEnabled: boolean;
  bgmTrackTitle: string;
  onToggleBgm: () => void;
};

const mediaDays = [
  { key: "2026-08-03", label: "8月3日", title: "进入民勤 · 采摘观察 · 科普传播" },
  { key: "2026-08-04", label: "8月4日", title: "公益林养护 · 基地记录" },
];

export function LongFormPage({ mapSlot, showAllMedia, onToggleMedia, onStartExhibit, storyIndex, storyTargetId, onStoryChapterChange, onStoryMapModeChange, onStoryTargetHandled, bgmEnabled, bgmTrackTitle, onToggleBgm }: LongFormPageProps) {
  const storySpine = useRef<HTMLElement>(null);
  const chapterElements = useRef<(HTMLElement | null)[]>([]);
  const fieldDates = new Set(timelineEvents.map((event) => event.day));
  const visitedPoints = storyPoints.filter((point) => point.contentOrigin === "团队实践").length;
  const publicPoints = storyPoints.filter((point) => point.contentOrigin === "公开资料").length;
  const featuredMediaCount = media.filter((asset) => asset.featured).length;

  useEffect(() => {
    const spine = storySpine.current;
    if (!spine || typeof IntersectionObserver === "undefined") return;
    const desktop = window.matchMedia("(min-width: 981px)");
    let spineVisible = false;
    const syncStoryMapMode = () => onStoryMapModeChange(spineVisible && desktop.matches);
    const spineObserver = new IntersectionObserver(([entry]) => { spineVisible = entry.isIntersecting; syncStoryMapMode(); }, { rootMargin: "-10% 0px -10% 0px", threshold: 0 });
    const ratios = new Map<Element, number>();
    const chapterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0));
      let nextIndex = -1;
      let nextRatio = 0;
      chapterElements.current.forEach((element, index) => {
        const ratio = element ? ratios.get(element) ?? 0 : 0;
        if (ratio > nextRatio) { nextIndex = index; nextRatio = ratio; }
      });
      if (nextIndex >= 0) onStoryChapterChange(nextIndex);
    }, { rootMargin: "-24% 0px -44% 0px", threshold: [0, .15, .35, .55] });
    spineObserver.observe(spine);
    chapterElements.current.forEach((element) => { if (element) chapterObserver.observe(element); });
    desktop.addEventListener("change", syncStoryMapMode);
    return () => {
      spineObserver.disconnect();
      chapterObserver.disconnect();
      desktop.removeEventListener("change", syncStoryMapMode);
      onStoryMapModeChange(false);
    };
  }, [onStoryChapterChange, onStoryMapModeChange]);

  useEffect(() => {
    if (!storyTargetId) return;
    const index = tourChapters.findIndex((chapter) => chapter.id === storyTargetId);
    if (index >= 0) chapterElements.current[index]?.scrollIntoView({ behavior: "auto", block: "center" });
    onStoryTargetHandled();
  }, [onStoryTargetHandled, storyTargetId]);

  return <>
    <header className="site-nav" aria-label="主导航">
      <a className="brand" href="#top" aria-label="返回首页"><span className="brand-mark">绿</span><span><strong>绿洲药韵</strong><small>MINQIN FIELD ATLAS</small></span></a>
      <nav><a href="#five-chapters">五章故事</a><a href="#map">探索工具</a><a href="#archive">资料档案</a><a href="#sources">资料来源</a></nav>
      <div className="nav-date"><button className="secondary-action" onClick={onToggleBgm} aria-pressed={bgmEnabled} aria-label={bgmEnabled ? `关闭背景音乐，当前 ${bgmTrackTitle}` : `开启背景音乐，当前 ${bgmTrackTitle}`} title={bgmTrackTitle}>{bgmEnabled ? "背景音 · 开" : "背景音 · 关"}</button><span> · 持续维护 · 2026</span></div>
    </header>

    <section className="hero" id="top">
      <img className="hero-image" src={publicAsset("/media/2026-08-04/banner-team.webp")} alt="实践团在民勤荒漠中举起队旗" />
      <div className="hero-wash" /><div className="weather-grid" aria-hidden="true" />
      <div className="hero-kicker"><span>河西走廊 · 石羊河下游</span><span>数字成果 / 更新于 2026.08.12</span></div>
      <div className="hero-content"><p className="super-title">守护河西绿洲</p><h1>在沙与水之间，<br />读懂一座绿洲。</h1><p className="hero-lead">民勤生态治理背景下中医药资源利用与“一带一路”绿色传播实践</p><div className="hero-actions"><button className="primary-action" onClick={() => onStartExhibit(0, true)}>开始自动导览 <span>→</span></button><a className="secondary-action" href="#map">自由浏览</a><span className="team-label">北京中医药大学生命科学学院<br />绿洲药韵·丝路智传实践团</span></div></div>
      <div className="hero-readout" aria-label="项目数据概览"><div><strong>{String(fieldDates.size).padStart(2, "0")}</strong><span>实践日<br />FIELD DAYS</span></div><div><strong>{String(visitedPoints).padStart(2, "0")}</strong><span>团队足迹<br />FIELD POINTS</span></div><div><strong>{String(media.length).padStart(2, "0")}</strong><span>影像素材<br />MEDIA ASSETS</span></div></div>
    </section>

    <section className="story-spine" id="five-chapters" ref={storySpine} aria-labelledby="story-spine-title">
      <div className="story-spine-heading"><div className="section-index">01 / 五章故事</div><div><p className="eyebrow">THE FIVE-CHAPTER STORY</p><h2 id="story-spine-title">沿一条主线，<br />进入民勤。</h2></div><p>从河西背景出发，循水认识绿洲，经两日实践抵达科技、产业与长期守护。每一章都可直接进入对应数字展框。</p></div>
      <div className="story-chapters">
        {tourChapters.map((chapter, index) => {
          const leadMedia = mediaById.get(chapter.leadMediaId);
          return <article ref={(element) => { chapterElements.current[index] = element; }} className={`story-chapter ${storyIndex === index ? "is-active" : ""}`} key={chapter.id} data-chapter={chapter.id} aria-current={storyIndex === index ? "step" : undefined}>
            <div className="chapter-number" aria-hidden="true"><span>{String(chapter.order).padStart(2, "0")}</span><i /></div>
            {leadMedia && <figure className="chapter-media">{leadMedia.type === "image" ? <img src={leadMedia.src} alt={leadMedia.alt} loading={index === 0 ? "eager" : "lazy"} /> : <video src={leadMedia.src} poster={leadMedia.poster} controls preload="none" aria-label={leadMedia.alt}><track kind="captions" src={publicAsset("/media/shared/ambient-zh.vtt")} srcLang="zh" label="中文说明" default /></video>}<figcaption>{leadMedia.caption}</figcaption></figure>}
            <div className="chapter-copy"><p className="eyebrow">{chapter.eyebrow}</p><h3>{chapter.title}</h3><p>{chapter.narration}</p><button onClick={() => onStartExhibit(index)}>进入这一章 <span aria-hidden="true">→</span></button></div>
          </article>;
        })}
      </div>
    </section>

    <section className="explore-intro" aria-labelledby="explore-title"><div className="section-index light">02 / 探索工具</div><div><p className="eyebrow light">EXPLORE THE ATLAS</p><h2 id="explore-title">带着故事，<br />再进入地图。</h2></div><div className="explore-copy"><p>数字展框提供五章顺序导览；互动地图保留按实践、水脉、药材与人物自由浏览的能力。</p><div><button className="primary-action" onClick={() => onStartExhibit()}>进入数字展框 <span>→</span></button><a className="secondary-action" href="#map">自由浏览</a></div></div></section>

    {mapSlot}

    <div className="archive-zone" id="archive">
    <section className="archive-intro" aria-labelledby="archive-title"><div className="section-index">03 / 证据与档案</div><div><p className="eyebrow">EVIDENCE &amp; ARCHIVE</p><h2 id="archive-title">故事之后，<br />查看完整记录。</h2></div><p>以下区域保留项目边界、完整实践影像、历史切片、药材资料与公开来源，用于追溯故事依据。</p></section>

    <section className="dossier" id="dossier" aria-labelledby="dossier-title">
      <div className="section-index">A1 / 项目档案与边界</div><div className="dossier-heading"><p className="eyebrow">PROJECT DOSSIER</p><h2 id="dossier-title">一份可追溯、<br />可继续生长的数字成果。</h2></div>
      <div className="dossier-card"><dl><div><dt>项目</dt><dd>民勤生态治理背景下中医药资源利用与“一带一路”绿色传播实践</dd></div><div><dt>团队</dt><dd>北京中医药大学生命科学学院<br />绿洲药韵·丝路智传实践团</dd></div><div><dt>实践时间</dt><dd>2026年8月3—4日（首期素材）</dd></div><div><dt>方法</dt><dd>实地观察、劳动记录、影像采集、公开资料核验与数字地图叙事</dd></div></dl><div className="dossier-stats"><article><strong>{visitedPoints}</strong><span>团队实践点</span></article><article><strong>{publicPoints}</strong><span>公开知识点</span></article><article><strong>{featuredMediaCount}</strong><span>导览精选影像</span></article><article><strong>{sources.length}</strong><span>公开资料来源</span></article></div><p className="boundary-note"><b>内容边界</b> 团队到访与公开知识点分开统计；GPS 实拍点只表示影像拍摄区域，采样线不是完整轨迹或导航路线；医学内容只记录科普活动，不提供诊疗建议。</p></div>
    </section>

    <section className="hexi-intro" aria-labelledby="hexi-title"><div className="section-index">A2 / 河西背景</div><div><p className="eyebrow">FROM SILK ROAD TO GREEN CORRIDOR</p><h2 id="hexi-title">古丝路打开通道，<br />今天的青年续写绿色通道。</h2></div><div className="hexi-copy"><p>公元前139年，张骞出使西域；河西走廊随后成为连接东西方文明的重要通道。凉州，即今天的武威，是走廊东端的重要城市。</p><p className="note"><span>地图口径</span>河西历史构成本章文化背景；地图虚线标记为“叙事路径，非导航路线”。</p><a href={sourceById.get("hexi-history")?.url} target="_blank" rel="noreferrer">阅读历史资料 ↗</a></div></section>

    <section className="field-media" id="field-media" aria-labelledby="media-title">
      <div className="section-index">A3 / 完整实践影像</div><div className="media-heading"><div><p className="eyebrow">TWO DAYS IN THE FIELD</p><h2 id="media-title">两天，五类行动。</h2></div><p>采摘观察、主题科普、直播助农、浇水维护与基地记录共同构成两日实践。首期 {media.length} 项素材按日期与行动整理。</p></div>
      <div className="media-days">{mediaDays.map((day) => { const assets = media.filter((asset) => asset.capturedAt.startsWith(day.key) && (showAllMedia || asset.featured)).sort((a, b) => { const aKey = a.capturedAt.length === 10 ? `${a.capturedAt} 23:59:59` : a.capturedAt; const bKey = b.capturedAt.length === 10 ? `${b.capturedAt} 23:59:59` : b.capturedAt; return aKey.localeCompare(bKey); }); return <article key={day.key} className="media-day"><div className="media-day-title"><strong>{day.label}</strong><span>{day.title}</span></div><div className="media-grid">{assets.map((asset) => <figure key={asset.id}>{asset.type === "image" ? <img src={asset.src} alt={asset.alt} loading="lazy" /> : <video src={asset.src} poster={asset.poster} controls preload="none" aria-label={asset.alt}><track kind="captions" src={publicAsset("/media/shared/ambient-zh.vtt")} srcLang="zh" label="中文说明" default /></video>}<figcaption><time>{asset.timeLabel ?? asset.capturedAt.slice(11)}</time><p>{asset.caption}</p>{asset.featured && <b>导览精选</b>}</figcaption></figure>)}</div></article>; })}</div>
      <button className="gallery-toggle" onClick={onToggleMedia} aria-expanded={showAllMedia}>{showAllMedia ? "收起完整素材" : `查看全部 ${media.length} 项素材`}</button>
    </section>

    <section className="water-story" id="water-story" aria-labelledby="water-title"><div className="section-index">A4 / 水沙历史切片</div><div className="water-title-block"><p className="eyebrow">WATER × SAND HISTORY</p><h2 id="water-title">绿洲生死线，记录民勤的水沙转折。</h2><p>每个历史切片均保留年份与来源，从两大沙漠合围、治沙起步追溯到水沙系统治理与阶段性恢复。</p></div><div className="timeline">{waterTimeline.map((item, index) => <article key={item.year}><div className="timeline-year"><span>{index + 1}</span><strong>{item.year}</strong></div><h3>{item.title}</h3><p>{item.note}</p><a href={sourceById.get(item.sourceId)?.url} target="_blank" rel="noreferrer">查看来源 ↗</a></article>)}</div></section>

    <section className="herb-story" id="herb-story" aria-labelledby="herb-title"><div className="herb-heading"><div className="section-index light">A5 / 药材资料</div><p className="eyebrow light">FROM SPECIES TO LOCAL RECORDS</p><h2 id="herb-title">看见物种，<br />也看见证据。</h2><p>四种药材均配有真实物种照片、可核民勤记录和可点击来源；年份数据只按原报道时间呈现。</p></div><div className="herb-grid">{herbs.map((herb, index) => <article key={herb.id}><figure className="herb-image"><img src={herb.image.src} alt={herb.image.alt} loading="lazy" /><figcaption><span>{herb.image.caption}</span><a href={herb.image.sourceUrl} target="_blank" rel="noreferrer">{herb.image.license} ↗</a></figcaption></figure><div className="herb-card-copy"><div className="herb-number">0{index + 1}</div><span className="herb-evidence verified">{herb.evidenceLabel}</span><span className="herb-tag">{herb.tag}</span><h3>{herb.name}</h3><em>{herb.latinLabel}</em><p>{herb.description}</p><div className="herb-facts">{herb.facts.map((fact) => <span key={fact.label}><small>{fact.label}</small><strong>{fact.value}</strong></span>)}</div><div className="herb-source-links">{herb.sourceIds.map((id) => { const source = sourceById.get(id); return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.publisher} · {source.publishedAt} ↗</a> : null; })}</div></div></article>)}</div><div className="chain" aria-label="药材资料阅读路径">{[["物种", "SPECIES"], ["生境", "HABITAT"], ["民勤记录", "LOCAL RECORD"], ["采收与保护", "USE & CARE"], ["来源核验", "SOURCES"]].map(([zh, en], index) => <div key={zh}><span>{String(index + 1).padStart(2, "0")}</span><strong>{zh}</strong><small>{en}</small></div>)}</div></section>

    <section className="closing-story" aria-labelledby="closing-title"><img src={publicAsset("/media/2026-08-04/volunteer-signs.webp")} alt="公益林基地里志愿者留下的手绘牌" loading="lazy" /><div className="closing-copy"><div className="section-index light">A6 / 长期守护记录</div><p className="eyebrow light">ONE TREE, MANY HANDS</p><h2 id="closing-title">地图上的一个点，<br />是现实中的一段长期维护。</h2><p>种下一棵树只是开始。补水、养护、记录与传播，才让一次社会实践进入更长的时间尺度。</p><blockquote>我们记录的不是一个完成式，而是一座绿洲仍在继续的故事。</blockquote><span>— 实践地图编辑说明</span><button className="closing-tour" onClick={() => onStartExhibit(0, true)}>自动导览重看全篇 →</button></div></section>
    </div>

    <footer id="sources"><div className="footer-brand"><span className="brand-mark">绿</span><div><strong>民勤中医药生态文化数字地图</strong><small>2026暑期实践数字成果 · 绿洲药韵·丝路智传实践团</small></div></div><div className="footer-sources"><h2>资料来源与反向索引</h2>{sources.map((source, index) => { const usageLabels = [...new Set((sourceUsageById.get(source.id) ?? []).map((usage) => usage.label))]; return <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span>{String(index + 1).padStart(2, "0")}</span><div>{source.title}<small>{source.publisher} · {source.publishedAt}</small><em>支撑：{usageLabels.join(" / ") || "待关联"}</em></div><b>↗</b></a>; })}</div><div className="method-note"><strong>资料与方法说明</strong><div><p>团队照片与视频摄于2026年8月3—4日；公开资料用于历史、生态、科研、人物与产业背景。公开知识点不计入团队到访；GPS 实拍点与采样线来自影像元数据，不表示完整轨迹、行政边界或导航位置。网站底图为本地 PMTiles，底图失败时文字与影像仍可浏览。</p><p className="music-credit">背景音乐：{backgroundTracks.map((track, index) => <span key={track.id}><a href={track.sourceUrl} target="_blank" rel="noreferrer">{track.title} · {track.artist}</a>{index < backgroundTracks.length - 1 ? " / " : ""}</span>)} · <a href={backgroundMusicLicense.url} target="_blank" rel="noreferrer">{backgroundMusicLicense.label}</a></p></div></div><div className="footer-note"><p>发布边界：现场科普仅作活动记录；直播素材经过隐私裁剪；药材内容聚焦资源、生态与产业。</p><p>版本：持续维护版 · 更新于 2026.08.12</p></div></footer>
  </>;
}
