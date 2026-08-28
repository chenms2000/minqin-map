"use client";

import { formatDuration } from "@/app/lib/formatters";
import type { TourPlaybackState } from "@/app/components/experience/experience";
import { tourChapters } from "@/content";
import type { ExhibitModule } from "@/app/components/exhibit/digital-exhibit";

const moduleMeta: Array<{ id: ExhibitModule; label: string; en: string }> = [
  { id: "tour", label: "五章导览", en: "GUIDED STORY" },
  { id: "field", label: "实践轨迹", en: "FIELD PLAYER" },
  { id: "water", label: "绿洲生死线", en: "WATER × SAND" },
  { id: "resources", label: "药材标本柜", en: "SPECIMEN CABINET" },
];

export function ExhibitHeader({ module, tourIndex, onEnd }: { module: ExhibitModule; tourIndex: number; onEnd: () => void }) {
  const currentLabel = module === "tour" ? `第 ${tourIndex + 1} 章 / ${tourChapters.length}` : moduleMeta.find((item) => item.id === module)?.label;
  return <header className="exhibit-header">
    <div><span>MINQIN FIELD ATLAS</span><strong>{currentLabel}</strong></div>
    <button onClick={onEnd} aria-label="退出数字展框">退出 <span aria-hidden="true">×</span></button>
  </header>;
}

type ExploreMenuProps = {
  open: boolean;
  module: ExhibitModule;
  tourIndex: number;
  onOpenChange: (open: boolean) => void;
  onSelectModule: (module: ExhibitModule) => void;
  onGoChapter: (index: number) => void;
  onRestart: () => void;
};

export function ExploreMenu({ open, module, tourIndex, onOpenChange, onSelectModule, onGoChapter, onRestart }: ExploreMenuProps) {
  return <details className="explore-menu" open={open} onToggle={(event) => onOpenChange(event.currentTarget.open)}>
    <summary>探索工具 <span aria-hidden="true">＋</span></summary>
    <div className="explore-menu-panel">
      <div className="exhibit-modules" role="tablist" aria-label="展框模块">
        {moduleMeta.map((item) => <button key={item.id} role="tab" aria-selected={module === item.id} className={module === item.id ? "active" : ""} onClick={() => onSelectModule(item.id)}><strong>{item.label}</strong><small>{item.en}</small></button>)}
      </div>
      <div className="exhibit-rail" aria-label={`第${tourIndex + 1}章，共${tourChapters.length}章`}>
        {tourChapters.map((item, index) => <button key={item.id} className={index === tourIndex ? "active" : ""} onClick={() => onGoChapter(index)} aria-label={`跳至第${index + 1}章 ${item.title}`}><i>{String(index + 1).padStart(2, "0")}</i><span>{item.title}</span></button>)}
      </div>
      <button className="restart-exhibit" onClick={onRestart}>从第一章重新开始</button>
    </div>
  </details>;
}

type PlaybackBarProps = {
  playback: TourPlaybackState;
  soundEnabled: boolean;
  elapsedSeconds: number;
  totalSeconds: number;
  progress: number;
  previousDisabled: boolean;
  nextDisabled: boolean;
  onToggle: () => void;
  onToggleSound: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onExploreMap: () => void;
  onViewEvidence: () => void;
};

export function TourPlaybackBar({ playback, soundEnabled, elapsedSeconds, totalSeconds, progress, previousDisabled, nextDisabled, onToggle, onToggleSound, onPrevious, onNext, onExploreMap, onViewEvidence }: PlaybackBarProps) {
  const playLabel = playback === "playing" ? "暂停" : playback === "paused" ? "继续" : playback === "completed" ? "重新播放" : "自动播放";
  return <div className={`tour-playback-bar is-${playback}`} aria-label="导览播放控制">
    <button className="play-toggle" onClick={onToggle}><span aria-hidden="true">{playback === "playing" ? "Ⅱ" : "▶"}</span>{playLabel}</button>
    <button className="sound-toggle" onClick={onToggleSound} aria-label={soundEnabled ? "关闭导览声音" : "开启导览声音"} aria-pressed={soundEnabled}>{soundEnabled ? "声音" : "静音"}</button>
    <button className="step-button" onClick={onPrevious} disabled={previousDisabled} aria-label="上一页">←<span>上一页</span></button>
    <div className="tour-total-progress" role="progressbar" aria-label="导览总进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
      <i><b style={{ width: `${progress}%` }} /></i>
      <small>{formatDuration(elapsedSeconds)} / {formatDuration(totalSeconds)} · 剩余 {formatDuration(Math.max(0, totalSeconds - elapsedSeconds))}</small>
    </div>
    <button className="step-button next" onClick={onNext} disabled={nextDisabled} aria-label="下一页"><span>下一页</span>→</button>
    {playback === "completed" && <div className="tour-complete-actions"><strong>五章导览已完成</strong><button onClick={onExploreMap}>自由探索地图</button><button onClick={onViewEvidence}>查看资料依据</button></div>}
  </div>;
}

export function ExhibitNavigationBar({ label, previousDisabled, nextDisabled, onPrevious, onNext }: { label: string; previousDisabled: boolean; nextDisabled: boolean; onPrevious: () => void; onNext: () => void }) {
  return <div className="exhibit-navigation-bar" aria-label="展项切换">
    <button onClick={onPrevious} disabled={previousDisabled}>← 上一个</button><span>{label}</span><button onClick={onNext} disabled={nextDisabled}>下一个 →</button>
  </div>;
}
