import React, { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Waves,
  Trees,
  Bird,
  Music,
  Sparkles,
  X,
  Wind,
  Bell,
  Check,
  Headphones
} from "lucide-react";
import { soundscape, SoundscapeState } from "../services/audioSynth";
import { toast } from "../services/toastService";

interface SoundscapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
}

export const SoundscapeModal: React.FC<SoundscapeModalProps> = ({
  isOpen,
  onClose,
  isLight = false,
}) => {
  const [audioState, setAudioState] = useState<SoundscapeState>(() =>
    soundscape.getSoundscapeState()
  );

  useEffect(() => {
    const unsubscribe = soundscape.subscribeSoundscape((state) => {
      setAudioState(state);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleToggleTanpura = () => {
    const newState = !audioState.isTanpuraPlaying;
    soundscape.toggleTanpura(newState);
    if (newState) {
      toast.audio("Authentic 4-string Tanpura drone activated", {
        title: "Tanpura Drone • On",
        icon: "🕉️",
      });
    } else {
      toast.audio("Tanpura drone paused", {
        title: "Tanpura Drone • Off",
      });
    }
  };

  const handleToggleNature = () => {
    const newState = !audioState.isNaturePlaying;
    soundscape.toggleZenNature(newState);
    if (newState) {
      toast.audio("Zen Nature (Himalayan stream, forest wind, birdsong) activated", {
        title: "Zen Nature • On",
        icon: "🍃",
      });
    } else {
      toast.audio("Zen Nature soundscape paused", {
        title: "Zen Nature • Off",
      });
    }
  };

  const handleApplyPreset = (preset: "tanpura" | "nature" | "both" | "off") => {
    soundscape.setSoundscapePreset(preset);
    if (preset === "tanpura") {
      toast.audio("Tanpura Solo meditation mode enabled", {
        title: "Tanpura Solo",
        icon: "🕉️",
      });
    } else if (preset === "nature") {
      toast.audio("Zen Nature mode enabled (River stream, forest wind & birds)", {
        title: "Zen Nature Solo",
        icon: "🍃",
      });
    } else if (preset === "both") {
      toast.audio("Ashram Harmony enabled (Tanpura drone + Zen Nature stream & birds)", {
        title: "Ashram Harmony",
        icon: "🪷",
      });
    } else {
      toast.audio("All ambient audio muted", {
        title: "Soundscapes Muted",
      });
    }
  };

  const isBothActive = audioState.isTanpuraPlaying && audioState.isNaturePlaying;
  const isTanpuraOnly = audioState.isTanpuraPlaying && !audioState.isNaturePlaying;
  const isNatureOnly = !audioState.isTanpuraPlaying && audioState.isNaturePlaying;
  const isNoneActive = !audioState.isTanpuraPlaying && !audioState.isNaturePlaying;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="soundscape-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl rounded-3xl border-2 shadow-2xl overflow-hidden relative transition-all ${
          isLight
            ? "bg-[#faf7f2] border-amber-400/80 text-stone-900 shadow-amber-950/20"
            : "bg-gradient-to-b from-[#11192e] via-[#0d1424] to-[#0a0f1d] border-amber-500/50 text-amber-100 shadow-2xl"
        }`}
      >
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Modal Header */}
        <div
          className={`p-5 sm:p-6 border-b flex items-center justify-between relative z-10 ${
            isLight ? "border-amber-200 bg-amber-50/80" : "border-amber-500/20 bg-slate-950/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-950/40">
              <Headphones className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 id="soundscape-modal-title" className="font-royal text-lg sm:text-xl font-bold text-saffron-gradient">
                Sacred Soundscapes & Zen Nature
              </h3>
              <p className={`text-xs ${isLight ? "text-stone-600" : "text-amber-300/70"}`}>
                Ambient procedural synthesis for deep focus & Vedic meditation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              isLight
                ? "bg-stone-200/80 hover:bg-stone-300 border-stone-300 text-stone-700"
                : "bg-slate-900/80 hover:bg-slate-800 border-amber-500/30 text-amber-300 hover:text-amber-100"
            }`}
            title="Close Soundscape Studio"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto relative z-10">
          {/* Quick Immersion Presets */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 block">
              Quick Soundscape Presets (त्वरित ध्यान वातावरण)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleApplyPreset("both")}
                className={`p-2.5 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  isBothActive
                    ? "bg-gradient-to-b from-amber-500 to-orange-600 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-bold scale-[1.02]"
                    : isLight
                    ? "bg-amber-100/60 hover:bg-amber-200/70 border-amber-300 text-stone-800"
                    : "bg-slate-950/60 hover:bg-slate-900 border-amber-500/20 text-amber-200"
                }`}
              >
                <span className="text-base">🪷</span>
                <span className="leading-tight">Ashram Harmony</span>
                <span className="text-[10px] opacity-80 font-normal">Tanpura + Nature</span>
              </button>

              <button
                onClick={() => handleApplyPreset("nature")}
                className={`p-2.5 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  isNatureOnly
                    ? "bg-gradient-to-b from-emerald-500 to-teal-600 text-slate-950 border-emerald-300 shadow-md shadow-emerald-500/20 font-bold scale-[1.02]"
                    : isLight
                    ? "bg-amber-100/60 hover:bg-amber-200/70 border-amber-300 text-stone-800"
                    : "bg-slate-950/60 hover:bg-slate-900 border-amber-500/20 text-amber-200"
                }`}
              >
                <span className="text-base">🍃</span>
                <span className="leading-tight">Zen Nature</span>
                <span className="text-[10px] opacity-80 font-normal">River & Birds</span>
              </button>

              <button
                onClick={() => handleApplyPreset("tanpura")}
                className={`p-2.5 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  isTanpuraOnly
                    ? "bg-gradient-to-b from-amber-500 to-orange-600 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-bold scale-[1.02]"
                    : isLight
                    ? "bg-amber-100/60 hover:bg-amber-200/70 border-amber-300 text-stone-800"
                    : "bg-slate-950/60 hover:bg-slate-900 border-amber-500/20 text-amber-200"
                }`}
              >
                <span className="text-base">🕉️</span>
                <span className="leading-tight">Tanpura Drone</span>
                <span className="text-[10px] opacity-80 font-normal">Sa-Pa 4 Strings</span>
              </button>

              <button
                onClick={() => handleApplyPreset("off")}
                className={`p-2.5 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  isNoneActive
                    ? "bg-slate-800 text-white border-slate-600 shadow-md font-bold scale-[1.02]"
                    : isLight
                    ? "bg-amber-100/60 hover:bg-amber-200/70 border-amber-300 text-stone-800"
                    : "bg-slate-950/60 hover:bg-slate-900 border-amber-500/20 text-amber-200"
                }`}
              >
                <VolumeX className="w-4 h-4 text-amber-400/70" />
                <span className="leading-tight">Mute All</span>
                <span className="text-[10px] opacity-80 font-normal">Silence</span>
              </button>
            </div>
          </div>

          {/* Soundscape Channels */}
          <div className="space-y-4">
            {/* Channel 1: Zen Nature Soundscape */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                audioState.isNaturePlaying
                  ? isLight
                    ? "bg-emerald-50/90 border-emerald-400 shadow-md"
                    : "bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-950 border-emerald-500/50 shadow-lg shadow-emerald-950/30"
                  : isLight
                  ? "bg-white border-stone-200"
                  : "bg-slate-950/70 border-amber-500/20"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      audioState.isNaturePlaying
                        ? "bg-emerald-500 text-slate-950 shadow-md"
                        : "bg-slate-900 border border-emerald-500/30 text-emerald-400"
                    }`}
                  >
                    <Trees className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-emerald-300">Zen Nature Soundscape</h4>
                      {audioState.isNaturePlaying && (
                        <span className="flex gap-0.5 items-end h-3">
                          <span className="w-0.5 h-3 bg-emerald-400 animate-pulse"></span>
                          <span className="w-0.5 h-2 bg-emerald-300 animate-pulse delay-75"></span>
                          <span className="w-0.5 h-3.5 bg-emerald-400 animate-pulse delay-150"></span>
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isLight ? "text-stone-600" : "text-emerald-200/70"}`}>
                      Himalayan stream flows, pine breeze & procedural forest birds
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleToggleNature}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    audioState.isNaturePlaying
                      ? "bg-emerald-500 text-slate-950 shadow-md hover:bg-emerald-400"
                      : isLight
                      ? "bg-stone-200 hover:bg-stone-300 text-stone-800"
                      : "bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:text-emerald-100"
                  }`}
                >
                  {audioState.isNaturePlaying ? "Playing" : "Turn On"}
                </button>
              </div>

              {/* Nature Elements Badges */}
              <div className="flex flex-wrap items-center gap-2 my-3 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 flex items-center gap-1">
                  <Waves className="w-3 h-3 text-emerald-400" />
                  Prakriti Dhara (River Brook)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-emerald-400" />
                  Vana Pavana (Forest Wind)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 flex items-center gap-1">
                  <Bird className="w-3 h-3 text-emerald-400" />
                  Pakshi Kalarav (Birdsong)
                </span>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 pt-2 border-t border-emerald-500/20">
                <Volume2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.02"
                  value={audioState.natureVolume}
                  onChange={(e) => soundscape.setNatureVolume(parseFloat(e.target.value))}
                  disabled={!audioState.isNaturePlaying}
                  className="flex-1 accent-emerald-500 h-1.5 rounded-lg bg-slate-800 cursor-pointer disabled:opacity-40"
                />
                <span className="text-xs font-mono text-emerald-300 w-10 text-right">
                  {Math.round(audioState.natureVolume * 125)}%
                </span>
              </div>
            </div>

            {/* Channel 2: Tanpura Meditation Drone */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                audioState.isTanpuraPlaying
                  ? isLight
                    ? "bg-amber-50/90 border-amber-400 shadow-md"
                    : "bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-950 border-amber-500/50 shadow-lg shadow-amber-950/30"
                  : isLight
                  ? "bg-white border-stone-200"
                  : "bg-slate-950/70 border-amber-500/20"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      audioState.isTanpuraPlaying
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 border border-amber-500/30 text-amber-400"
                    }`}
                  >
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-amber-300">Tanpura Drone (तम्पूरा नाद)</h4>
                      {audioState.isTanpuraPlaying && (
                        <span className="flex gap-0.5 items-end h-3">
                          <span className="w-0.5 h-3 bg-amber-400 animate-pulse"></span>
                          <span className="w-0.5 h-2 bg-amber-300 animate-pulse delay-75"></span>
                          <span className="w-0.5 h-3.5 bg-amber-400 animate-pulse delay-150"></span>
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isLight ? "text-stone-600" : "text-amber-200/70"}`}>
                      Authentic Indian classical 4-string acoustic overtone resonance
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleToggleTanpura}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    audioState.isTanpuraPlaying
                      ? "bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400"
                      : isLight
                      ? "bg-stone-200 hover:bg-stone-300 text-stone-800"
                      : "bg-slate-900 border border-amber-500/40 text-amber-300 hover:text-amber-100"
                  }`}
                >
                  {audioState.isTanpuraPlaying ? "Playing" : "Turn On"}
                </button>
              </div>

              {/* Tanpura Tuning Details */}
              <div className="flex flex-wrap items-center gap-2 my-3 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/30 text-amber-200">
                  Pa (G#3 ~207.6 Hz)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/30 text-amber-200">
                  Madhya Sa (C#4 ~277.2 Hz)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/30 text-amber-200">
                  Kharja Sa (C#3 ~138.6 Hz)
                </span>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 pt-2 border-t border-amber-500/20">
                <Volume2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.02"
                  value={audioState.tanpuraVolume}
                  onChange={(e) => soundscape.setTanpuraVolume(parseFloat(e.target.value))}
                  disabled={!audioState.isTanpuraPlaying}
                  className="flex-1 accent-amber-500 h-1.5 rounded-lg bg-slate-800 cursor-pointer disabled:opacity-40"
                />
                <span className="text-xs font-mono text-amber-300 w-10 text-right">
                  {Math.round(audioState.tanpuraVolume * 125)}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Sound Samplers: Temple Bell & Flute */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-amber-300/80 font-medium">
              Audio Chime Tests:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => soundscape.playTempleBell()}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-950 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-1.5 transition-colors"
                title="Play Sanctum Temple Bell"
              >
                <Bell className="w-3 h-3 text-amber-400" />
                <span>Temple Bell</span>
              </button>
              <button
                onClick={() => soundscape.playFluteChime()}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-950 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-1.5 transition-colors"
                title="Play Bansuri Raga Bhupali Arpeggio"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Bansuri Flute</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between text-xs ${
            isLight ? "border-amber-200 bg-amber-50/90 text-stone-600" : "border-amber-500/20 bg-slate-950/80 text-amber-300/70"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Soundscape persists across all tabs and chat sessions.</span>
          </div>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-4 py-1.5 rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
