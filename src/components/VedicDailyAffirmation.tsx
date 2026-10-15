import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Sparkles,
  Sun,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Share2,
  MessageSquare,
  Compass,
  Feather,
  Flame,
  Shield,
  Heart,
  Timer,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import {
  VedicAffirmationItem,
  VEDIC_AFFIRMATIONS_COLLECTION,
  getDailyVedicAffirmation,
} from "../data/vedicAffirmationsData";
import { IndicLanguageCode, SavedItem } from "../types";
import { soundscape, SpeechState } from "../services/audioSynth";
import { toast } from "../services/toastService";
import { karmaService } from "../services/karmaService";

interface VedicDailyAffirmationProps {
  selectedLanguage?: IndicLanguageCode;
  onSaveItem?: (item: SavedItem) => void;
  onAskAboutAffirmation?: (prompt: string) => void;
  theme?: "deep_night" | "temple_ivory";
}

type AffirmationCategory = "all" | "wisdom" | "effort" | "peace" | "compassion" | "abundance" | "strength" | "courage";

const CATEGORY_TABS: { id: AffirmationCategory; label: string; indic: string }[] = [
  { id: "all", label: "All Affirmations", indic: "सर्वे" },
  { id: "wisdom", label: "Wisdom", indic: "धी" },
  { id: "effort", label: "Pure Action", indic: "कर्म" },
  { id: "peace", label: "Peace", indic: "शान्ति" },
  { id: "courage", label: "Courage", indic: "अभय" },
  { id: "strength", label: "Strength", indic: "आत्मबल" },
  { id: "abundance", label: "Abundance", indic: "पूर्णता" },
  { id: "compassion", label: "Compassion", indic: "करुणा" },
];

const AUTO_ROTATE_INTERVAL_MS = 12000;

export const VedicDailyAffirmation: React.FC<VedicDailyAffirmationProps> = ({
  selectedLanguage = "English",
  onSaveItem,
  onAskAboutAffirmation,
  theme = "deep_night",
}) => {
  const isLight = theme === "temple_ivory";

  // Filter category
  const [selectedCategory, setSelectedCategory] = useState<AffirmationCategory>("all");

  // Filtered pool
  const filteredAffirmations = useMemo(() => {
    if (selectedCategory === "all") {
      return VEDIC_AFFIRMATIONS_COLLECTION;
    }
    return VEDIC_AFFIRMATIONS_COLLECTION.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  // Current active index in filteredAffirmations
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Auto-rotation states
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Audio recitation states
  const [speechState, setSpeechState] = useState<SpeechState>({
    isSpeaking: false,
    isPaused: false,
    speakingId: null,
    activeLanguage: "Sanskrit",
    currentChunk: 0,
    totalChunks: 1,
    progressPercent: 0,
    playbackRate: 0.9,
  });

  // UI helpers
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isDhyanaMode, setIsDhyanaMode] = useState<boolean>(false);
  const [dhyanaSecondsLeft, setDhyanaSecondsLeft] = useState<number>(60);
  const [isDhyanaActive, setIsDhyanaActive] = useState<boolean>(false);

  // Guard index out of range when category changes
  useEffect(() => {
    setCurrentIndex(0);
    setProgressPercent(0);
  }, [selectedCategory]);

  const activeItem: VedicAffirmationItem =
    filteredAffirmations[currentIndex] || VEDIC_AFFIRMATIONS_COLLECTION[0];

  const utteranceId = `vedic-affirmation-${activeItem.id}`;

  // Subscribe to speech state
  useEffect(() => {
    const unsubscribe = soundscape.subscribe((state) => {
      if (state.speakingId === utteranceId) {
        setSpeechState(state);
      } else {
        setSpeechState((prev) => ({
          ...prev,
          isSpeaking: false,
          isPaused: false,
          speakingId: null,
        }));
      }
    });
    return () => unsubscribe();
  }, [utteranceId]);

  // Auto-rotation timer logic
  useEffect(() => {
    if (!isAutoPlaying || speechState.isSpeaking || isDhyanaActive) {
      return;
    }

    const stepMs = 100;
    const increment = (stepMs / AUTO_ROTATE_INTERVAL_MS) * 100;

    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          // Advance to next shloka
          setCurrentIndex((idx) => (idx + 1) % filteredAffirmations.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [isAutoPlaying, speechState.isSpeaking, isDhyanaActive, filteredAffirmations.length]);

  // Contemplation / Dhyana 60s timer
  useEffect(() => {
    if (!isDhyanaActive) return;

    if (dhyanaSecondsLeft <= 0) {
      setIsDhyanaActive(false);
      soundscape.playTempleBell();
      toast.show("🕉️ Contemplation complete! May this sacred affirmation guide your actions today.", "success", { duration: 5000 });
      karmaService.addKarma(25, `Mindful Affirmation Dhyana • ${activeItem.source}`, "wisdom");
      return;
    }

    const interval = setInterval(() => {
      setDhyanaSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isDhyanaActive, dhyanaSecondsLeft, activeItem]);

  // Rotation Navigation Handlers
  const handleNext = useCallback(() => {
    soundscape.stopSpeaking();
    setCurrentIndex((prev) => (prev + 1) % filteredAffirmations.length);
    setProgressPercent(0);
  }, [filteredAffirmations.length]);

  const handlePrev = useCallback(() => {
    soundscape.stopSpeaking();
    setCurrentIndex((prev) => (prev - 1 + filteredAffirmations.length) % filteredAffirmations.length);
    setProgressPercent(0);
  }, [filteredAffirmations.length]);

  const handleShuffle = useCallback(() => {
    soundscape.stopSpeaking();
    if (filteredAffirmations.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * filteredAffirmations.length);
    if (nextIdx === currentIndex) {
      nextIdx = (nextIdx + 1) % filteredAffirmations.length;
    }
    setCurrentIndex(nextIdx);
    setProgressPercent(0);
    soundscape.playFluteChime();
  }, [filteredAffirmations.length, currentIndex]);

  const handleJumpToToday = useCallback(() => {
    soundscape.stopSpeaking();
    const todayItem = getDailyVedicAffirmation(new Date());
    setSelectedCategory("all");
    const foundIdx = VEDIC_AFFIRMATIONS_COLLECTION.findIndex((item) => item.id === todayItem.id);
    setCurrentIndex(foundIdx !== -1 ? foundIdx : 0);
    setProgressPercent(0);
    soundscape.playTempleBell();
    toast.show("Loaded today's synchronized Vedic Affirmation.", "info", { duration: 3000 });
  }, []);

  const handleToggleAutoPlay = () => {
    setIsAutoPlaying((prev) => !prev);
    setProgressPercent(0);
  };

  // Audio Chanting & Pronunciation
  const handleToggleAudio = () => {
    if (speechState.isSpeaking) {
      soundscape.stopSpeaking();
      return;
    }

    soundscape.playTempleBell();
    karmaService.addKarma(10, `Affirmation Chanting • ${activeItem.source}`, "wisdom");

    // Clean narration text: Sanskrit recitation followed by English affirmation
    const chantText = `${activeItem.sanskrit}. In English: ${activeItem.englishTranslation}. Today's personal affirmation: ${activeItem.dailyAffirmation}`;

    soundscape.speakText(
      chantText,
      selectedLanguage === "English" ? "English" : "Sanskrit",
      utteranceId,
      () => {
        // onEnd
      },
      () => {
        // onStart
      },
      {
        rate: 0.88,
        pitch: 0.98,
      }
    );
  };

  // Copy to Clipboard
  const handleCopy = async () => {
    const textToCopy = `✨ Vedic Daily Affirmation (दैनिक वैदिक संकल्प)\n\n📜 ${activeItem.source}\n🕉️ ${activeItem.sanskrit}\n\n🔤 ${activeItem.transliteration}\n\n📖 Translation: "${activeItem.englishTranslation}"\n\n🌟 Daily Sankalpa / Affirmation:\n"${activeItem.dailyAffirmation}"\n\n💭 Reflection: ${activeItem.reflectionPrompt}\n\n~ Explored on Prajna BharatGPT`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast.show("Vedic Affirmation copied to clipboard!", "success", { duration: 3000 });
      karmaService.addKarma(5, "Shared Vedic Affirmation", "wisdom");
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.show("Unable to copy to clipboard", "error", { duration: 3000 });
    }
  };

  // Share
  const handleShare = async () => {
    const shareTitle = `Vedic Affirmation: ${activeItem.theme}`;
    const shareText = `🕉️ ${activeItem.sanskrit}\n\n"${activeItem.dailyAffirmation}"\n\nSource: ${activeItem.source}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href,
        });
        toast.show("Affirmation shared successfully!", "success", { duration: 3000 });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    handleCopy();
  };

  // Save to Sacred Vault
  const handleSave = () => {
    if (!onSaveItem) return;

    const savedItem: SavedItem = {
      id: `affirmation-${activeItem.id}-${Date.now()}`,
      type: "shloka",
      title: `Affirmation: ${activeItem.theme}`,
      snippet: `"${activeItem.dailyAffirmation}" (${activeItem.source})`,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      data: activeItem,
    };

    onSaveItem(savedItem);
    setIsSaved(true);
    soundscape.playFluteChime();
    toast.show("Sacred affirmation saved to your Vault!", "success", { duration: 3000 });
    karmaService.addKarma(10, `Saved Affirmation • ${activeItem.theme}`, "wisdom");
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Inquire with AI
  const handleAskAI = () => {
    if (!onAskAboutAffirmation) return;
    const prompt = `Please illuminate today's sacred Vedic Affirmation from ${activeItem.source}:\n\nSanskrit Shloka:\n"${activeItem.sanskrit}"\n\nTranslation:\n"${activeItem.englishTranslation}"\n\nDaily Affirmation:\n"${activeItem.dailyAffirmation}"\n\nHow can I internalize and apply this ancient wisdom to overcome modern stress, cultivate mental strength, and act with dharmic clarity today?`;
    onAskAboutAffirmation(prompt);
  };

  // Dhyana Mode Toggle
  const handleStartDhyana = () => {
    setIsDhyanaMode(true);
    setIsDhyanaActive(true);
    setDhyanaSecondsLeft(60);
    soundscape.playTempleBell();
    // Start peaceful tanpura if not active
    if (!soundscape.isAnySoundscapeActive()) {
      soundscape.toggleTanpura(true, 0.25);
    }
  };

  const handleStopDhyana = () => {
    setIsDhyanaActive(false);
    setIsDhyanaMode(false);
  };

  return (
    <section
      id="vedic-daily-affirmation"
      aria-label="Vedic Daily Affirmation"
      className="w-full max-w-5xl mx-auto px-3 sm:px-4 pt-2"
    >
      <div
        className={`relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-2xl ${
          isLight
            ? "bg-gradient-to-b from-amber-50/95 via-orange-50/90 to-amber-100/90 border-amber-300/80 hover:border-amber-400"
            : "bg-gradient-to-b from-[#141b2d] via-[#0f172a] to-[#090d16] border-amber-500/35 hover:border-amber-500/55"
        }`}
      >
        {/* Subtle Sacred Devanagari Watermark */}
        <div
          aria-hidden="true"
          className="absolute -top-6 -right-6 text-9xl font-serif text-amber-500/5 select-none pointer-events-none tracking-tighter"
        >
          ॐ
        </div>

        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-amber-500/10 to-transparent blur-2xl pointer-events-none"
        />

        {/* Auto-rotation Progress Line */}
        <div className="w-full h-1 bg-amber-500/15 relative overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 transition-all duration-100 ease-linear ${
              isAutoPlaying && !speechState.isSpeaking && !isDhyanaActive ? "opacity-100" : "opacity-30"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-4 sm:p-7 relative z-10 space-y-5">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
            {/* Title & Daily Badge */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md border ${
                  isLight
                    ? "bg-amber-200/60 border-amber-400/60 text-amber-900"
                    : "bg-gradient-to-br from-amber-500/30 to-orange-600/30 border-amber-500/40 text-amber-300"
                }`}
              >
                <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className={`font-royal text-lg sm:text-xl font-bold tracking-wide ${
                      isLight ? "text-amber-950" : "text-amber-100"
                    }`}
                  >
                    Vedic Daily Affirmation{" "}
                    <span className="text-amber-500 font-serif text-base sm:text-lg">/ दैनिक संकल्प</span>
                  </h2>
                </div>
                {/* Zero-pill metadata text with typographic separators */}
                <div
                  className={`text-xs flex flex-wrap items-center gap-2 mt-0.5 font-medium ${
                    isLight ? "text-amber-900/70" : "text-amber-300/70"
                  }`}
                >
                  <span className="font-semibold text-amber-400">{activeItem.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeItem.themeIndic}</span>
                  <span aria-hidden="true">·</span>
                  <span>Rotating Shloka #{currentIndex + 1} of {filteredAffirmations.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Utility Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Jump to Today's Sacred Affirmation */}
              <button
                type="button"
                onClick={handleJumpToToday}
                title="Synchronize with today's calendar shloka"
                className={`px-2.5 py-1 text-xs rounded-xl border flex items-center gap-1.5 transition-all ${
                  isLight
                    ? "bg-amber-100/70 hover:bg-amber-200/70 text-amber-900 border-amber-300/70"
                    : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border-amber-500/30"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Today's Sankalpa</span>
                <span className="sm:hidden">Today</span>
              </button>

              {/* Contemplation / Dhyana 60s Mode */}
              <button
                type="button"
                onClick={isDhyanaMode ? handleStopDhyana : handleStartDhyana}
                title="60-second Mindful Contemplation"
                className={`px-2.5 py-1 text-xs rounded-xl border flex items-center gap-1.5 transition-all ${
                  isDhyanaActive
                    ? "bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/30"
                    : isLight
                    ? "bg-white hover:bg-amber-50 text-amber-900 border-amber-300/70"
                    : "bg-slate-800/80 hover:bg-slate-700/80 text-amber-200 border-amber-500/30"
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{isDhyanaActive ? `${dhyanaSecondsLeft}s Dhyana` : "Reflect"}</span>
              </button>

              {/* Auto-play Play / Pause Toggle */}
              <button
                type="button"
                onClick={handleToggleAutoPlay}
                title={isAutoPlaying ? "Pause auto-rotation" : "Start auto-rotation"}
                className={`p-1.5 rounded-xl border transition-all ${
                  isAutoPlaying
                    ? isLight
                      ? "bg-amber-200/50 text-amber-900 border-amber-400/60"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : isLight
                    ? "bg-slate-200 text-slate-700 border-slate-300"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
                aria-label={isAutoPlaying ? "Pause auto-rotation" : "Start auto-rotation"}
              >
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Interactive Category Filter Pills (Functional Buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1 rounded-xl whitespace-nowrap font-medium transition-all duration-200 flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-semibold border-amber-400 shadow-sm shadow-amber-500/20"
                      : isLight
                      ? "bg-white/70 hover:bg-white text-slate-700 border-amber-200/60"
                      : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60 hover:text-amber-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] ${isActive ? "text-slate-900/80" : "text-amber-400/70"}`}>
                    ({tab.indic})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dhyana Mode Alert / Guidance Bar */}
          {isDhyanaMode && (
            <div
              className={`rounded-2xl p-3 border transition-all duration-300 flex items-center justify-between gap-3 ${
                isLight
                  ? "bg-amber-100/90 border-amber-400/70 text-amber-950"
                  : "bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-amber-500/40 text-amber-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold">
                  {dhyanaSecondsLeft}s
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-amber-300">
                    Sacred Stillness Contemplation (ध्यान)
                  </p>
                  <p className="text-xs opacity-80">
                    Inhale calm, exhale disturbance. Internalize this affirmation into your heart.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleStopDhyana}
                className="text-xs px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30"
              >
                End Early
              </button>
            </div>
          )}

          {/* Main Shloka & Affirmation Card Body */}
          <div
            className={`rounded-2xl p-4 sm:p-6 border transition-all duration-300 relative ${
              isLight
                ? "bg-white/80 border-amber-200 shadow-inner"
                : "bg-slate-900/60 border-amber-500/20"
            }`}
          >
            {/* Top Source and Theme Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs">
                <Feather className="w-3.5 h-3.5 text-amber-400" />
                <span
                  className={`font-semibold tracking-wide ${
                    isLight ? "text-amber-900" : "text-amber-300"
                  }`}
                >
                  {activeItem.source}
                </span>
                {activeItem.deityOrSage && (
                  <>
                    <span aria-hidden="true" className="text-amber-500/40">·</span>
                    <span className="text-slate-400 hidden sm:inline">{activeItem.deityOrSage}</span>
                  </>
                )}
              </div>

              {activeItem.mantraSeed && (
                <span className="text-xs font-serif text-amber-400/90 tracking-wider">
                  बीज: {activeItem.mantraSeed}
                </span>
              )}
            </div>

            {/* Sanskrit Shloka in Devanagari */}
            <div className="my-3 text-center sm:text-left">
              <div
                className={`text-lg sm:text-2xl font-royal font-bold leading-relaxed tracking-wide select-text whitespace-pre-line ${
                  isLight ? "text-amber-950" : "text-amber-100"
                }`}
                style={{ textShadow: isLight ? "none" : "0 2px 10px rgba(245, 158, 11, 0.15)" }}
              >
                {activeItem.sanskrit}
              </div>

              {/* Roman Transliteration */}
              <div className="mt-2 text-xs sm:text-sm font-sans italic text-amber-400/90 whitespace-pre-line select-text">
                {activeItem.transliteration}
              </div>
            </div>

            {/* English Translation */}
            <div
              className={`mt-4 pt-3 border-t text-sm sm:text-base leading-relaxed select-text ${
                isLight
                  ? "border-amber-200/70 text-slate-700"
                  : "border-slate-800 text-slate-200"
              }`}
            >
              <span className="font-semibold text-amber-400 mr-2">Translation:</span>
              <span className="italic font-serif">"{activeItem.englishTranslation}"</span>
            </div>

            {/* Daily Affirmation / Sankalpa Highlight Box */}
            <div
              className={`mt-5 rounded-2xl p-4 border transition-all ${
                isLight
                  ? "bg-gradient-to-r from-orange-100/70 via-amber-100/60 to-yellow-100/70 border-amber-300 text-amber-950 shadow-sm"
                  : "bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-600/15 border-amber-500/40 text-amber-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      My Affirmation for Today <span className="font-serif">/ दैनिक संकल्प</span>
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base font-medium leading-relaxed select-text">
                    "{activeItem.dailyAffirmation}"
                  </p>
                  <p className="text-xs text-amber-300/80 font-serif pt-0.5">
                    {activeItem.dailyAffirmationIndic}
                  </p>
                </div>
              </div>
            </div>

            {/* Reflection Prompt */}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <Compass className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
              <span className="italic">
                <strong className="text-amber-400/80 not-italic">Daily Reflection:</strong>{" "}
                {activeItem.reflectionPrompt}
              </span>
            </div>
          </div>

          {/* Action Toolbar & Carousel Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Carousel Step Controls (< Prev, Indicator Dots, Next >) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Vedic Affirmation"
                className={`p-2 rounded-xl border transition-all ${
                  isLight
                    ? "bg-white hover:bg-amber-100 text-slate-700 border-amber-300"
                    : "bg-slate-800/80 hover:bg-slate-700 text-amber-200 border-amber-500/30"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Shloka Selector Dots */}
              <div className="flex items-center gap-1 px-1">
                {filteredAffirmations.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      soundscape.stopSpeaking();
                      setCurrentIndex(idx);
                      setProgressPercent(0);
                    }}
                    title={`${item.theme} (${item.source})`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-6 bg-gradient-to-r from-amber-400 to-orange-400"
                        : "w-2 bg-slate-600/50 hover:bg-amber-400/50"
                    }`}
                    aria-label={`Jump to shloka ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Vedic Affirmation"
                className={`p-2 rounded-xl border transition-all ${
                  isLight
                    ? "bg-white hover:bg-amber-100 text-slate-700 border-amber-300"
                    : "bg-slate-800/80 hover:bg-slate-700 text-amber-200 border-amber-500/30"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Shuffle button */}
              <button
                type="button"
                onClick={handleShuffle}
                title="Discover random inspiring affirmation"
                aria-label="Discover random affirmation"
                className={`p-2 rounded-xl border transition-all ${
                  isLight
                    ? "bg-white hover:bg-amber-100 text-slate-700 border-amber-300"
                    : "bg-slate-800/80 hover:bg-slate-700 text-amber-200 border-amber-500/30"
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>

            {/* Interaction Buttons (Listen, Bookmark, Copy, Share, Ask AI) */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Audio Listen */}
              <button
                type="button"
                onClick={handleToggleAudio}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium border flex items-center gap-1.5 transition-all ${
                  speechState.isSpeaking
                    ? "bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20"
                    : isLight
                    ? "bg-white hover:bg-amber-100 text-amber-950 border-amber-300"
                    : "bg-slate-800/80 hover:bg-slate-700 text-amber-200 border-amber-500/30"
                }`}
                title={speechState.isSpeaking ? "Stop Chanting" : "Listen to Sanskrit Chanting & Translation"}
              >
                {speechState.isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                    <span>Stop Chanting</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Listen Chant</span>
                  </>
                )}
              </button>

              {/* Save to Vault */}
              {onSaveItem && (
                <button
                  type="button"
                  onClick={handleSave}
                  title="Save affirmation to sacred vault"
                  className={`p-1.5 sm:px-2.5 sm:py-1.5 text-xs rounded-xl border flex items-center gap-1.5 transition-all ${
                    isSaved
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : isLight
                      ? "bg-white hover:bg-amber-100 text-slate-700 border-amber-300"
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Save</span>
                    </>
                  )}
                </button>
              )}

              {/* Copy */}
              <button
                type="button"
                onClick={handleCopy}
                title="Copy affirmation and shloka"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 text-xs rounded-xl border flex items-center gap-1.5 transition-all ${
                  isCopied
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : isLight
                    ? "bg-white hover:bg-amber-100 text-slate-700 border-amber-300"
                    : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700"
                }`}
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span className="hidden sm:inline">{isCopied ? "Copied" : "Copy"}</span>
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                title="Share this affirmation"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 text-xs rounded-xl border flex items-center gap-1.5 transition-all ${
                  isLight
                    ? "bg-white hover:bg-amber-100 text-slate-700 border-amber-300"
                    : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700"
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* Ask BharatGPT */}
              {onAskAboutAffirmation && (
                <button
                  type="button"
                  onClick={handleAskAI}
                  title="Ask BharatGPT how to apply this affirmation"
                  className="px-3 py-1.5 text-xs rounded-xl font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-200 border border-amber-500/40 flex items-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Enlighten Me</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
