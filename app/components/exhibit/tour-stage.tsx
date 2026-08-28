"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import { publicAsset, type ExhibitVisualType, type MediaAsset, type SourceRef, type StoryPoint, type TourChapter, type TourFrame } from "@/content";

type TourStageProps = {
  chapter: TourChapter;
  chapterCount: number;
  frame: TourFrame;
  frameIndex: number;
  frameCount: number;
  media?: MediaAsset;
  point?: StoryPoint;
  source?: SourceRef;
  isPlaying: boolean;
  soundEnabled: boolean;
  onVideoTimeUpdate: (currentTimeSeconds: number) => void;
  onVideoEnded: () => void;
};

export function deriveExhibitVisualType(frame: TourFrame, media?: MediaAsset): ExhibitVisualType {
  if (frame.kind === "source") return "source";
  if (media) return "media";
  return "data";
}

export function TourStage({ chapter, chapterCount, frame, frameIndex, frameCount, media, point, source, isPlaying, soundEnabled, onVideoTimeUpdate, onVideoEnded }: TourStageProps) {
  const visualType = deriveExhibitVisualType(frame, media);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) void video.play().catch(() => undefined);
    else video.pause();
    return () => video.pause();
  }, [frame.id, isPlaying, soundEnabled]);

  return <div className={`exhibit-stage module-tour visual-${visualType}`} data-visual-type={visualType}>
    {media && <figure className="tour-media">
      {media.type === "image"
        ? <img key={frame.id} src={media.src} alt={media.alt} />
        : <video ref={videoRef} key={frame.id} src={media.src} autoPlay={isPlaying} muted={!soundEnabled} playsInline preload="metadata" aria-label={media.alt} onTimeUpdate={(event) => { if (isPlaying) onVideoTimeUpdate(event.currentTarget.currentTime); }} onEnded={onVideoEnded} onError={onVideoEnded}><track kind="captions" src={publicAsset("/media/shared/ambient-zh.vtt")} srcLang="zh" label="中文说明" default /></video>}
      <figcaption>{media.caption}</figcaption>
    </figure>}

    {visualType === "source" && source ? <article className="source-label" aria-labelledby={`source-frame-${frame.id}`}>
      <div className="source-label-meta"><span>{source.publisher}</span><time>{source.publishedAt}</time></div>
      <p className="source-label-kicker">SOURCE NOTE · 资料展签</p>
      <h2 id={`source-frame-${frame.id}`}>{source.title}</h2>
      <p>{source.summary ?? frame.body}</p>
      <a href={source.url} target="_blank" rel="noreferrer">查看原文 <span aria-hidden="true">↗</span></a>
    </article> : <div className="tour-copy">
      <p>{String(chapter.order).padStart(2, "0")} / {chapterCount} · 分镜 {frameIndex + 1} / {frameCount}</p>
      <span>{frame.eyebrow}</span>
      <h2>{frame.title}</h2>
      <p>{frame.body}</p>
      {point && <small>定位：{point.title} · {point.accuracy}</small>}
    </div>}
  </div>;
}
