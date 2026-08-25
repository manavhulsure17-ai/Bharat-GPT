import React, { useState } from "react";
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Sparkles,
  Music,
  Gauge,
  Sliders,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SpeechState } from "../services/audioSynth";

export interface AudioTTSPlayerBarProps {
  speechState: SpeechState;
  onPlay: (mode?: string, speed?: number, enableDrone?: boolean) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
  onToggleDrone: (enabled: boolean) => void;
  selectedSpeed: number;
  isDroneEnabled: boolean;
  modes?: Array<{ id: string; label: string; indicLabel?: string }>;
  activeMode?: string;
  onModeChange?: (modeId: string) => void;
  title: string;
  subtitle?: string;
  theme?: "dark" | "light";
  className?: string;
}

export const AudioTTSPlayerBar: React.FC<AudioTTSPlayerBarProps> = ({
  speechState,
  onPlay,
  onPause,
  onResume,
  onStop,
  onSpeedChange,
  onToggleDrone,
  selectedSpeed,
  isDroneEnabled,
  modes,
  activeMode,
  onModeChange,
  title,
  subtitle,
  theme = "dark",
  className = "",
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const isLight = theme === "light";

  const isCurrentActive = speechState.isSpeaking || speechState.isPaused;
  const isPaused = speechState.isPaused;
  const isPlaying = speechState.isSpeaking && !speechState.isPaused;

  const speedOptions = [
    { value: 0.8, label: "0.8x", desc: "Reverent" },
    { value: 0.95, label: "1.0x", desc: "Natural" },
    { value: 1.2, label: "1.2x", desc: "Brisk" },
  ];

  return (
    <div
      id="audio-tts-player-bar"
      className={`rounded-2xl border transition-all duration-300 p-3 sm:p-4 shadow-lg relative overflow-hidden ${
        isLight
          ? isCurrentActive
            ? "bg-gradient-to-r from-amber-100/90 via-amber-50 to-orange-50/80 border-amber-400/80 shadow-amber-900/10"
            : "bg-white/90 border-amber-200/80 shadow-stone-900/5 hover:border-amber-300"
          : isCurrentActive
          ? "bg-gradient-to-r from-[#172036] via-[#121a2c] to-[#0f1726] border-amber-500/50 shadow-amber-950/40 ring-1 ring-amber-500/30"
          : "bg-slate-950/80 border-amber-500/25 hover:border-amber-500/40"
      } ${className}`}
    >
      {/* Subtle background wave animation when playing */}
      {isPlaying && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-amber-400/10 to-orange-500/5 pointer-events-none animate-pulse" />
      )}

      <div className="relative z-10 flex flex-col gap-2.5">
        {/* Main Control Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Play/Pause/Stop & Status */}
          <div className="flex items-center gap-3">
            {/* Primary Action Button */}
            {!isCurrentActive ? (
              <button
                onClick={() => onPlay(activeMode, selectedSpeed, isDroneEnabled)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                title="Start audio narration"
              >
                <Volume2 className="w-4 h-4 text-slate-950 animate-bounce" />
                <span>Listen Audio</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                {isPaused ? (
                  <button
                    onClick={onResume}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                    title="Resume audio playback"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    onClick={onPause}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all"
                    title="Pause audio playback"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </button>
                )}

                <button
                  onClick={onStop}
                  className={`p-2 rounded-xl border text-xs transition-all ${
                    isLight
                      ? "bg-stone-200/80 hover:bg-stone-300 text-stone-700 border-stone-300"
                      : "bg-slate-900 hover:bg-slate-800 text-amber-300/80 border-amber-500/30 hover:text-amber-100"
                  }`}
                  title="Stop audio playback"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            )}

            {/* Title & Soundwave visualizer */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold leading-none ${
                    isLight ? "text-stone-800" : "text-amber-100"
                  }`}
                >
                  {title}
                </span>

                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-3.5 px-1">
                    <span className="w-0.5 bg-amber-500 animate-[bounce_0.8s_infinite] h-2 rounded-full" />
                    <span className="w-0.5 bg-amber-400 animate-[bounce_0.6s_infinite_0.1s] h-3.5 rounded-full" />
                    <span className="w-0.5 bg-amber-500 animate-[bounce_0.9s_infinite_0.2s] h-2.5 rounded-full" />
                    <span className="w-0.5 bg-amber-400 animate-[bounce_0.7s_infinite_0.3s] h-3 rounded-full" />
                  </div>
                )}
              </div>

              {subtitle && (
                <span
                  className={`text-[11px] font-medium truncate max-w-xs sm:max-w-md ${
                    isLight ? "text-stone-500" : "text-amber-300/70"
                  }`}
                >
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick Speed, Drone, & Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Speed Selector */}
            <div className="flex items-center bg-slate-900/60 p-0.5 rounded-lg border border-amber-500/20 text-[11px]">
              {speedOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSpeedChange(opt.value)}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    selectedSpeed === opt.value
                      ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                      : isLight
                      ? "text-stone-600 hover:text-stone-900"
                      : "text-amber-300/70 hover:text-amber-200"
                  }`}
                  title={`${opt.desc} speed (${opt.label})`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Ambient Meditative Drone Toggle */}
            <button
              onClick={() => onToggleDrone(!isDroneEnabled)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                isDroneEnabled
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-inner"
                  : isLight
                  ? "bg-stone-100 text-stone-500 border-stone-300 hover:text-stone-700"
                  : "bg-slate-900 text-amber-300/50 border-amber-500/20 hover:text-amber-300/80"
              }`}
              title="Toggle soft background Tanpura drone ambience during recitation"
            >
              <Music className={`w-3 h-3 ${isDroneEnabled ? "text-amber-400" : ""}`} />
              <span className="hidden md:inline">Drone</span>
            </button>

            {/* Toggle Additional Settings / Modes */}
            {modes && modes.length > 0 && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg border text-xs transition-all ${
                  showSettings
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : isLight
                    ? "bg-stone-100 text-stone-600 border-stone-200"
                    : "bg-slate-900 text-amber-300/70 border-amber-500/20"
                }`}
                title="Audio options & playback modes"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar during active speech */}
        {isCurrentActive && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className={isLight ? "text-stone-600" : "text-amber-300/80"}>
                {speechState.currentChunk + 1} of {speechState.totalChunks} chunks (
                {speechState.progressPercent}%)
              </span>
              <span className={isLight ? "text-stone-500" : "text-amber-400/70"}>
                {isPlaying ? "Reciting text..." : isPaused ? "Paused" : "Completed"}
              </span>
            </div>
            <div
              className={`w-full h-1.5 rounded-full overflow-hidden ${
                isLight ? "bg-amber-200/60" : "bg-slate-900"
              }`}
            >
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(5, speechState.progressPercent)}%` }}
              />
            </div>
            {speechState.currentTextSnippet && (
              <p
                className={`text-[11px] italic truncate font-serif ${
                  isLight ? "text-stone-600" : "text-amber-200/80"
                }`}
              >
                "{speechState.currentTextSnippet}"
              </p>
            )}
          </div>
        )}

        {/* Expandable Mode Selector Ribbon */}
        {showSettings && modes && modes.length > 0 && (
          <div
            className={`pt-2 mt-1 border-t flex flex-wrap items-center gap-2 animate-fadeIn ${
              isLight ? "border-amber-200" : "border-amber-500/20"
            }`}
          >
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isLight ? "text-stone-500" : "text-amber-400/80"
              }`}
            >
              Narration Mode:
            </span>
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  if (onModeChange) onModeChange(mode.id);
                  if (isCurrentActive) {
                    onPlay(mode.id, selectedSpeed, isDroneEnabled);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeMode === mode.id
                    ? "bg-amber-500 text-slate-950 font-bold shadow"
                    : isLight
                    ? "bg-stone-200/70 text-stone-700 hover:bg-stone-200"
                    : "bg-slate-900 text-amber-300/80 hover:bg-slate-800 hover:text-amber-100 border border-amber-500/20"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
