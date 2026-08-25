import React, { useState, useEffect } from "react";
import {
  Calendar,
  Sparkles,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MessageSquare,
  Landmark,
  Compass,
  Scroll,
  Sun,
  Shield,
  Microscope,
  Palette,
  Flag,
  BookOpen,
  Radio,
  Clock,
  MapPin,
  Flame,
  Music,
} from "lucide-react";
import {
  HistoryCategory,
  HistoryEventItem,
  IndicLanguageCode,
  SavedItem,
  VedicPanchangInfo,
} from "../types";
import {
  fetchTodayInHistory,
  getLocalHistoryForDate,
  TodayInHistoryResponse,
} from "../services/historyService";
import { soundscape, SpeechState } from "../services/audioSynth";
import { AudioTTSPlayerBar } from "./AudioTTSPlayerBar";
import { toast } from "../services/toastService";
import { karmaService } from "../services/karmaService";

interface TodayInHistoryCardProps {
  selectedLanguage: IndicLanguageCode;
  onSaveItem: (item: SavedItem) => void;
  onAskAboutEvent?: (prompt: string) => void;
}

export const TodayInHistoryCard: React.FC<TodayInHistoryCardProps> = ({
  selectedLanguage,
  onSaveItem,
  onAskAboutEvent,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [historyData, setHistoryData] = useState<TodayInHistoryResponse>(() =>
    getLocalHistoryForDate(new Date())
  );
  const [selectedCategory, setSelectedCategory] = useState<HistoryCategory>("all");
  const [selectedEventIndex, setSelectedEventIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Audio Playback & TTS Engine States
  const [speechState, setSpeechState] = useState<SpeechState>({
    isSpeaking: false,
    isPaused: false,
    speakingId: null,
    activeLanguage: selectedLanguage,
    currentChunk: 0,
    totalChunks: 1,
    progressPercent: 0,
    playbackRate: 0.95,
  });
  const [selectedSpeed, setSelectedSpeed] = useState<number>(0.95);
  const [isDroneEnabled, setIsDroneEnabled] = useState<boolean>(false);
  const [narrationMode, setNarrationMode] = useState<string>("full");

  // Load history data when date, language, or category changes
  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetchTodayInHistory(
          currentDate,
          selectedLanguage,
          selectedCategory
        );
        if (isMounted) {
          setHistoryData(response);
          setSelectedEventIndex(0);
          setIsSaved(false);
        }
      } catch (err) {
        console.error("Error loading Today in History:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [currentDate, selectedLanguage, selectedCategory]);

  const activeEvent: HistoryEventItem =
    historyData.events[selectedEventIndex] || historyData.primaryEvent;

  // Audio Speech Sync
  const utteranceId = `history-event-${activeEvent?.id || "today"}`;

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

  const handleStartNarration = (
    mode: string = narrationMode,
    speed: number = selectedSpeed,
    drone: boolean = isDroneEnabled
  ) => {
    if (!activeEvent) return;

    soundscape.playTempleBell();
    karmaService.addKarma(20, `History Chronicle • ${activeEvent.title}`, "wisdom");
    karmaService.recordActivity("dailyWisdomReadCount", 1);

    let narrationText = "";
    if (mode === "summary") {
      narrationText = `Today in Indian History for ${historyData.dateFormatted}. ${activeEvent.title}. Indic chronicle: ${activeEvent.indicTitle || ""}. Era: ${activeEvent.era} (${activeEvent.year || ""}). Summary: ${activeEvent.summary}`;
    } else if (mode === "takeaways") {
      narrationText = `Key Historical Takeaways for ${activeEvent.title}. ${activeEvent.keyTakeaways.join(". ")}. Civilizational significance: ${activeEvent.detailedSignificance}`;
    } else {
      // Full chronicle
      narrationText = `Today in Indian History for ${historyData.dateFormatted}. Milestone: ${activeEvent.title}. Indic chronicle: ${activeEvent.indicTitle || ""}. Era: ${activeEvent.era} ${activeEvent.year ? `(${activeEvent.year})` : ""}. Location: ${activeEvent.location || "Ancient Bharat"}. Summary: ${activeEvent.summary}. Historical significance: ${activeEvent.detailedSignificance}. Key takeaways: ${activeEvent.keyTakeaways.join(". ")}`;
    }

    soundscape.speakText(
      narrationText,
      selectedLanguage,
      utteranceId,
      () => {},
      () => {},
      {
        rate: speed,
        enableAmbientDrone: drone,
      }
    );
  };

  const handlePauseNarration = () => {
    soundscape.pauseSpeaking();
  };

  const handleResumeNarration = () => {
    soundscape.resumeSpeaking();
  };

  const handleStopNarration = () => {
    soundscape.stopSpeaking();
  };

  const handleSpeedChange = (speed: number) => {
    setSelectedSpeed(speed);
    if (speechState.isSpeaking || speechState.isPaused) {
      handleStartNarration(narrationMode, speed, isDroneEnabled);
    }
  };

  const handleToggleDrone = (enabled: boolean) => {
    setIsDroneEnabled(enabled);
    if (speechState.isSpeaking) {
      soundscape.toggleTanpura(enabled, 0.12);
    }
  };

  const handleSaveToVault = () => {
    if (!activeEvent) return;
    const savedItem: SavedItem = {
      id: `history-${activeEvent.id}-${Date.now()}`,
      type: "history",
      title: `[Today in History] ${activeEvent.title} (${activeEvent.year || activeEvent.dateStr})`,
      snippet: activeEvent.summary,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      data: activeEvent,
    };
    onSaveItem(savedItem);
    setIsSaved(true);
    soundscape.playFluteChime();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleShare = () => {
    if (!activeEvent) return;
    const shareText = `📜 Today in Bharatiya History (${historyData.dateFormatted})\n\n🌟 ${activeEvent.title} (${activeEvent.indicTitle})\n🏛️ Era: ${activeEvent.era} | ${activeEvent.year || ""}\n📍 Location: ${activeEvent.location || "Bharat"}\n\n📖 Summary: ${activeEvent.summary}\n\n✨ Key Takeaways:\n${activeEvent.keyTakeaways.map((k) => `• ${k}`).join("\n")}\n\nExplore timeless Indian heritage on Prajna BharatGPT!`;

    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    toast.success("Historical chronicle copied to clipboard!", { title: "Copied History" });
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleNavigateDay = (offset: number) => {
    soundscape.stopSpeaking();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  const handleResetToToday = () => {
    soundscape.stopSpeaking();
    setCurrentDate(new Date());
  };

  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [yearStr, monthStr, dayStr] = e.target.value.split("-");
    const newDate = new Date(
      parseInt(yearStr, 10),
      parseInt(monthStr, 10) - 1,
      parseInt(dayStr, 10)
    );
    soundscape.stopSpeaking();
    setCurrentDate(newDate);
    setShowDatePicker(false);
  };

  const categories: Array<{ id: HistoryCategory; label: string; icon: React.ReactNode }> = [
    { id: "all", label: "All Milestones", icon: <Scroll className="w-3.5 h-3.5" /> },
    { id: "vedic", label: "Vedic & Spiritual", icon: <Flame className="w-3.5 h-3.5" /> },
    { id: "sciences", label: "Sciences & Astronomy", icon: <Microscope className="w-3.5 h-3.5" /> },
    { id: "dynasties", label: "Dynasties & Valor", icon: <Shield className="w-3.5 h-3.5" /> },
    { id: "arts", label: "Arts & Architecture", icon: <Palette className="w-3.5 h-3.5" /> },
    { id: "freedom", label: "Freedom & Renaissance", icon: <Flag className="w-3.5 h-3.5" /> },
  ];

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "vedic":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "sciences":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
      case "dynasties":
        return "bg-orange-500/20 text-orange-300 border-orange-500/40";
      case "arts":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "freedom":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      default:
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
    }
  };

  const isToday =
    currentDate.getDate() === new Date().getDate() &&
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  return (
    <section
      id="today-in-history-card"
      aria-label="Today in Bharatiya History and Vedic Calendar"
      className="w-full max-w-5xl mx-auto px-3 sm:px-4 pt-4"
    >
      <div className="bg-gradient-to-b from-[#11192e] via-[#0d1424] to-[#0a0f1d] border-2 border-amber-500/40 hover:border-amber-500/60 rounded-3xl p-4 sm:p-7 shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-0.5 relative overflow-hidden transition-all duration-300">
        {/* Subtle Background Watermark */}
        <div className="absolute top-2 right-4 text-8xl font-royal text-amber-500/5 select-none pointer-events-none">
          इतिहास
        </div>

        {/* Top Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-500/20 relative z-10">
          {/* Left Title & Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-royal text-lg sm:text-xl font-bold text-amber-100 tracking-wide">
                  Today in History <span className="text-amber-400 font-serif">/ आज का इतिहास</span>
                </h2>
                {historyData.isAiGenerated && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                    Vedic AI Chronology
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-300/70 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>{historyData.dateLabel}</span>
                {isToday && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-1.5 py-0.2 rounded font-bold">
                    TODAY
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right Date Controls & Collapse Toggle */}
          <div className="flex items-center gap-2">
            {/* Day Navigators */}
            <div className="flex items-center bg-slate-950/70 border border-amber-500/30 rounded-xl p-0.5">
              <button
                onClick={() => handleNavigateDay(-1)}
                className="p-1.5 rounded-lg text-amber-300/80 hover:text-amber-200 hover:bg-amber-950/40 transition-colors"
                title="Previous Day"
                aria-label="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetToToday}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  isToday
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-amber-300/70 hover:text-amber-200 hover:bg-amber-950/40"
                }`}
                title="Jump to Today's Calendar Date"
              >
                Today
              </button>

              <button
                onClick={() => handleNavigateDay(1)}
                className="p-1.5 rounded-lg text-amber-300/80 hover:text-amber-200 hover:bg-amber-950/40 transition-colors"
                title="Next Day"
                aria-label="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Date Picker Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-amber-950/50 transition-colors"
                title="Choose calendar date"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Pick Date</span>
              </button>

              {showDatePicker && (
                <div className="absolute right-0 top-full mt-2 z-30 bg-[#0d1424] border border-amber-500/40 rounded-2xl p-3 shadow-2xl space-y-2 w-64 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-200 border-b border-amber-500/20 pb-1.5">
                    <span>Select Calendar Date</span>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="text-amber-400/60 hover:text-amber-300"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="date"
                    value={`${currentDate.getFullYear()}-${String(
                      currentDate.getMonth() + 1
                    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`}
                    onChange={handleManualDateChange}
                    className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-amber-400/70">
                    Explore ancient discoveries and historical moments for any date of the year.
                  </p>
                </div>
              )}
            </div>

            {/* Expand / Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-amber-950/50 transition-colors"
              title={isExpanded ? "Collapse card" : "Expand card"}
              aria-label={isExpanded ? "Collapse card" : "Expand card"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content Body */}
        {isExpanded && (
          <div className="mt-4 space-y-5 relative z-10 animate-fadeIn">
            {/* Vedic Panchang Tithi Banner */}
            {historyData.vedicPanchang && (
              <div className="bg-slate-950/80 border border-amber-500/25 hover:border-amber-500/40 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-amber-200">
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold text-amber-400">पञ्चाङ्ग (Panchang):</span>
                    <span className="text-amber-100 font-medium">{historyData.vedicPanchang.tithi}</span>
                  </div>

                  <span className="text-amber-500/40 hidden sm:inline">•</span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400/80 font-semibold">Masa:</span>
                    <span className="text-amber-100">{historyData.vedicPanchang.masa}</span>
                  </div>

                  <span className="text-amber-500/40 hidden sm:inline">•</span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400/80 font-semibold">Paksha:</span>
                    <span className="text-amber-100">{historyData.vedicPanchang.paksha}</span>
                  </div>

                  <span className="text-amber-500/40 hidden md:inline">•</span>

                  <div className="hidden md:flex items-center gap-1.5">
                    <span className="text-amber-400/80 font-semibold">Ritu:</span>
                    <span className="text-amber-100">{historyData.vedicPanchang.ritu}</span>
                  </div>
                </div>

                {historyData.vedicPanchang.astronomicalInsight && (
                  <div className="text-[11px] font-mono text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    {historyData.vedicPanchang.astronomicalInsight}
                  </div>
                )}
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 hover:scale-[1.03] ${
                    selectedCategory === cat.id
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
                      : "bg-slate-950/60 border border-amber-500/20 text-amber-300/80 hover:text-amber-100 hover:border-amber-400/40 hover:shadow-sm"
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Multiple Events Selector Carousel (if more than 1 event exists on this date) */}
            {historyData.events.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                {historyData.events.map((evt, idx) => (
                  <button
                    key={evt.id}
                    onClick={() => {
                      setSelectedEventIndex(idx);
                      soundscape.stopSpeaking();
                    }}
                    className={`text-left p-3 rounded-2xl border transition-all duration-200 text-xs space-y-1 hover:-translate-y-0.5 hover:shadow-md hover:shadow-amber-500/10 hover:scale-[1.01] ${
                      selectedEventIndex === idx
                        ? "bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/30 text-amber-100 shadow-md"
                        : "bg-slate-950/50 border-amber-500/20 text-amber-300/70 hover:border-amber-500/40 hover:text-amber-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {evt.year || evt.era}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${getCategoryBadgeColor(
                          evt.category
                        )}`}
                      >
                        {evt.category}
                      </span>
                    </div>
                    <p className="font-bold line-clamp-1 text-amber-100">{evt.title}</p>
                    <p className="text-[11px] text-amber-300/60 line-clamp-1">{evt.summary}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Active Featured Event Spotlight */}
            {activeEvent && (
              <div className="bg-gradient-to-b from-[#141d33] to-[#0c1322] border-2 border-amber-500/30 hover:border-amber-500/50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl hover:shadow-2xl hover:shadow-amber-500/15 hover:-translate-y-0.5 transition-all duration-300 space-y-5 relative">
                {/* Event Top Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-amber-500/20">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border ${getCategoryBadgeColor(
                        activeEvent.category
                      )}`}
                    >
                      {activeEvent.category}
                    </span>

                    {activeEvent.year && (
                      <span className="flex items-center gap-1 text-xs bg-slate-950/80 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold font-mono">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {activeEvent.year}
                      </span>
                    )}

                    <span className="text-xs bg-amber-500/10 text-amber-300/90 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
                      {activeEvent.era}
                    </span>

                    {activeEvent.location && (
                      <span className="flex items-center gap-1 text-xs text-amber-300/80 bg-slate-950/60 border border-amber-500/20 px-2.5 py-1 rounded-full">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        {activeEvent.location}
                      </span>
                    )}
                  </div>

                  {/* Audio TTS Player Bar */}
                  <AudioTTSPlayerBar
                    speechState={speechState}
                    onPlay={(mode, speed, drone) =>
                      handleStartNarration(mode || narrationMode, speed || selectedSpeed, drone ?? isDroneEnabled)
                    }
                    onPause={handlePauseNarration}
                    onResume={handleResumeNarration}
                    onStop={handleStopNarration}
                    onSpeedChange={handleSpeedChange}
                    onToggleDrone={handleToggleDrone}
                    selectedSpeed={selectedSpeed}
                    isDroneEnabled={isDroneEnabled}
                    modes={[
                      { id: "full", label: "Complete Chronicle" },
                      { id: "summary", label: "Quick Briefing" },
                      { id: "takeaways", label: "Key Takeaways" },
                    ]}
                    activeMode={narrationMode}
                    onModeChange={(m) => setNarrationMode(m)}
                    title={activeEvent.title}
                    subtitle={`Era: ${activeEvent.era} ${activeEvent.year ? `• Year: ${activeEvent.year}` : ""} • Audio Engine: ${selectedLanguage}`}
                    theme="dark"
                  />
                </div>

                {/* Event Heading & Indic Title */}
                <div className="space-y-1.5">
                  <h3 className="font-royal text-xl sm:text-2xl font-bold text-saffron-gradient leading-tight">
                    {activeEvent.title}
                  </h3>
                  {activeEvent.indicTitle && (
                    <p className="font-serif text-sm sm:text-base text-amber-300/90 font-medium">
                      {activeEvent.indicTitle}
                    </p>
                  )}
                </div>

                {/* Event Summary & Historical Context */}
                <div className="space-y-3 text-sm sm:text-base text-amber-100/95 leading-relaxed font-serif">
                  <p className="font-medium bg-amber-500/10 border-l-4 border-amber-400 p-3 rounded-r-xl text-amber-200">
                    {activeEvent.summary}
                  </p>

                  <div className="whitespace-pre-line text-justify text-amber-100/90 text-sm sm:text-[15px] pt-1">
                    {activeEvent.detailedSignificance}
                  </div>
                </div>

                {/* Key Takeaways & Philosophical Insights */}
                {activeEvent.keyTakeaways && activeEvent.keyTakeaways.length > 0 && (
                  <div className="bg-slate-950/70 border border-amber-500/25 hover:border-amber-500/40 rounded-2xl p-4 space-y-2 shadow-inner hover:shadow-md hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Key Civilizational Takeaways (मुख्य ऐतिहासिक अंतर्दृष्टि)
                    </h4>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-amber-200/90">
                      {activeEvent.keyTakeaways.map((takeaway, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold mt-0.5">•</span>
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Associated Figures & Ancient References */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-amber-300/70 border-t border-amber-500/15">
                  {activeEvent.historicalFigures && activeEvent.historicalFigures.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-amber-400">Historical Figures:</span>
                      <span className="text-amber-200">{activeEvent.historicalFigures.join(", ")}</span>
                    </div>
                  )}

                  {activeEvent.sourceOrReference && (
                    <div className="flex items-center gap-1.5 italic text-amber-400/80">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{activeEvent.sourceOrReference}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Ribbon */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-500/20">
                  {/* Deep Dive with Prajna BharatGPT */}
                  {onAskAboutEvent && (
                    <button
                      onClick={() =>
                        onAskAboutEvent(
                          `Tell me in deep detail about the historical and cultural significance of "${activeEvent.title}" (${activeEvent.era}, ${activeEvent.year || activeEvent.dateStr}). Explain its historical background, archaeological/textual evidence, and lasting impact on Indian heritage.`
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-lg shadow-amber-950/50 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Deep Dive with Prajna BharatGPT</span>
                    </button>
                  )}

                  {/* Bookmark & Share Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveToVault}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                        isSaved
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-slate-900 border-amber-500/30 text-amber-300 hover:bg-amber-950/50 hover:border-amber-400"
                      }`}
                      title="Save this historical milestone to your vault"
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          <span>Saved to Vault!</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                          <span>Save Event</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleShare}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                        isCopied
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-slate-900 border-amber-500/30 text-amber-300 hover:bg-amber-950/50 hover:border-amber-400"
                      }`}
                      title="Copy historical event summary to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Share</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
