import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MessageSquare,
  Sun,
  Scroll,
  Feather,
  Compass,
  Info,
  Music,
} from "lucide-react";
import { VedicVerseItem, getDailyVedicVerse, VEDIC_WISDOM_COLLECTION } from "../data/vedicWisdomData";
import { fetchDailyVedicWisdom, fetchRandomVedicWisdom } from "../services/vedicWisdomService";
import { IndicLanguageCode, SavedItem } from "../types";
import { soundscape, SpeechState } from "../services/audioSynth";
import { Skeleton } from "./SkeletonLoader";
import { AudioTTSPlayerBar } from "./AudioTTSPlayerBar";
import { toast } from "../services/toastService";
import { karmaService } from "../services/karmaService";

interface VedicWisdomWidgetProps {
  selectedLanguage: IndicLanguageCode;
  onSaveItem: (item: SavedItem) => void;
  onAskAboutVerse?: (prompt: string) => void;
}

export const VedicWisdomWidget: React.FC<VedicWisdomWidgetProps> = ({
  selectedLanguage,
  onSaveItem,
  onAskAboutVerse,
}) => {
  const [verse, setVerse] = useState<VedicVerseItem>(() => getDailyVedicVerse(new Date()));
  const [dateLabel, setDateLabel] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showWordBreakdown, setShowWordBreakdown] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"translation" | "breakdown" | "contemplation">("translation");

  // Audio & TTS engine states
  const [speechState, setSpeechState] = useState<SpeechState>({
    isSpeaking: false,
    isPaused: false,
    speakingId: null,
    activeLanguage: selectedLanguage,
    currentChunk: 0,
    totalChunks: 1,
    progressPercent: 0,
    playbackRate: 0.9,
  });
  const [selectedSpeed, setSelectedSpeed] = useState<number>(0.85);
  const [isDroneEnabled, setIsDroneEnabled] = useState<boolean>(true);
  const [narrationMode, setNarrationMode] = useState<string>("full");

  // Fetch daily verse on initial mount
  useEffect(() => {
    let isMounted = true;
    const loadDailyWisdom = async () => {
      setIsLoading(true);
      try {
        const response = await fetchDailyVedicWisdom(selectedLanguage);
        if (isMounted) {
          setVerse(response.verse);
          setDateLabel(response.dateLabel);
        }
      } catch (err) {
        console.error("Error loading daily Vedic wisdom:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDailyWisdom();
    return () => {
      isMounted = false;
    };
  }, [selectedLanguage]);

  // Audio pronunciation sync
  const widgetUtteranceId = `vedic-widget-${verse.id}`;

  useEffect(() => {
    const unsubscribe = soundscape.subscribe((state) => {
      if (state.speakingId === widgetUtteranceId) {
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
  }, [widgetUtteranceId]);

  const handleStartRecitation = (
    mode: string = narrationMode,
    speed: number = selectedSpeed,
    drone: boolean = isDroneEnabled
  ) => {
    soundscape.playTempleBell();
    karmaService.addKarma(20, `Vedic Wisdom Recitation • ${verse.source}`, "wisdom");
    karmaService.recordActivity("dailyWisdomReadCount", 1);

    let recitationText = "";
    let speechLang = selectedLanguage === "English" ? "English" : "Sanskrit";

    if (mode === "sanskrit_only") {
      recitationText = `${verse.sanskrit}. ${verse.transliteration}`;
      speechLang = "Sanskrit";
    } else if (mode === "translation_only") {
      recitationText = `Vedic insight from ${verse.source}. Translation: ${verse.englishTranslation}. Daily contemplation: ${verse.dailyContemplation}`;
      speechLang = selectedLanguage;
    } else {
      // Full recitation
      recitationText = `Sacred Vedic verse from ${verse.source}. ${verse.sanskrit}. Meaning in English: ${verse.englishTranslation}. Daily contemplation: ${verse.dailyContemplation}`;
      speechLang = selectedLanguage === "English" ? "English" : "Sanskrit";
    }

    soundscape.speakText(
      recitationText,
      speechLang,
      widgetUtteranceId,
      () => {},
      () => {},
      {
        rate: speed,
        enableAmbientDrone: drone,
      }
    );
  };

  const handlePauseRecitation = () => {
    soundscape.pauseSpeaking();
  };

  const handleResumeRecitation = () => {
    soundscape.resumeSpeaking();
  };

  const handleStopRecitation = () => {
    soundscape.stopSpeaking();
  };

  const handleSpeedChange = (speed: number) => {
    setSelectedSpeed(speed);
    if (speechState.isSpeaking || speechState.isPaused) {
      handleStartRecitation(narrationMode, speed, isDroneEnabled);
    }
  };

  const handleToggleDrone = (enabled: boolean) => {
    setIsDroneEnabled(enabled);
    if (speechState.isSpeaking) {
      soundscape.toggleTanpura(enabled, 0.12);
    }
  };

  // Pronounce single Sanskrit word from breakdown
  const handlePronounceWord = (word: string, meaning: string) => {
    soundscape.speakText(`${word}, meaning ${meaning}`, "Sanskrit", `word-${word}`, undefined, undefined, {
      rate: 0.8,
    });
  };

  // Copy to clipboard
  const handleCopy = () => {
    const textToCopy = `✨ Vedic Wisdom of the Day (${verse.source})\n\n🕉️ ${verse.sanskrit}\n\n📖 Transliteration:\n${verse.transliteration}\n\n🌟 Translation:\n"${verse.englishTranslation}"\n\n💡 Daily Contemplation:\n${verse.dailyContemplation}\n\n— Via Prajna BharatGPT (Indic Heritage Platform)`;

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast.success("Vedic Shloka copied to clipboard!", { title: "Copied Shloka" });
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Save to Smriti Kosh Vault
  const handleSave = () => {
    const savedItem: SavedItem = {
      id: `vedic-daily-${verse.id}-${Date.now()}`,
      type: "shloka",
      title: `Vedic Wisdom: ${verse.theme}`,
      snippet: `"${verse.englishTranslation.substring(0, 100)}..." (${verse.source})`,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      data: verse,
    };

    onSaveItem(savedItem);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Cycle next / random verse
  const handleFetchAnotherVerse = async () => {
    setIsLoading(true);
    soundscape.stopSpeaking();
    try {
      const nextVerse = await fetchRandomVedicWisdom();
      setVerse(nextVerse);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Inquire with AI
  const handleInquireWithAI = () => {
    if (onAskAboutVerse) {
      const prompt = `Please enlighten me on today's sacred Vedic verse from ${verse.source}:\n\n"${verse.sanskrit}"\n("${verse.englishTranslation}")\n\nWhat is the deep metaphysical meaning, historical context, and how can I apply its wisdom to modern work and daily life?`;
      onAskAboutVerse(prompt);
    }
  };


  return (
    <section
      id="vedic-wisdom-widget"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4 golden-selection-zone"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/95 via-amber-950/40 to-slate-950/95 border border-amber-500/30 hover:border-amber-500/50 shadow-2xl hover:shadow-amber-500/10 backdrop-blur-md transition-all duration-300">
        {/* Glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Top Header Ribbon */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-900/30 text-slate-950 font-bold">
              <Sun className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Vedic Wisdom of the Day
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  {verse.vedicCategory}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/70 font-mono">
                {dateLabel || "Daily Sacred Contemplation"} • {verse.source}
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Recitation with Equalizer */}
            <button
              onClick={() => {
                if (speechState.isSpeaking || speechState.isPaused) {
                  handleStopRecitation();
                } else {
                  handleStartRecitation();
                }
              }}
              title={speechState.isSpeaking ? "Stop recitation" : "Recite Sanskrit verse and translation in natural voice"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                speechState.isSpeaking
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30 font-semibold"
                  : "bg-slate-800/80 hover:bg-slate-750 text-amber-200 border-amber-500/30 hover:border-amber-400"
              }`}
            >
              {speechState.isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Stop Chanting</span>
                  {/* Equalizer bars animation */}
                  <span className="flex items-center gap-0.5 ml-1">
                    <span className="w-0.5 h-2.5 bg-slate-950 animate-bounce rounded-full" style={{ animationDelay: "0ms" }} />
                    <span className="w-0.5 h-3.5 bg-slate-950 animate-bounce rounded-full" style={{ animationDelay: "150ms" }} />
                    <span className="w-0.5 h-2 bg-slate-950 animate-bounce rounded-full" style={{ animationDelay: "300ms" }} />
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Listen Verse</span>
                </>
              )}
            </button>

            {/* Random Next Verse */}
            <button
              onClick={handleFetchAnotherVerse}
              disabled={isLoading}
              title="Explore another sacred Vedic verse"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-amber-300 border border-amber-500/30 hover:border-amber-400 text-xs flex items-center gap-1 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
              <span className="hidden sm:inline">Inspire Me</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              title="Copy verse and translation"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-amber-300 border border-amber-500/30 hover:border-amber-400 text-xs flex items-center gap-1 transition-all"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCopied ? "Copied" : "Share"}</span>
            </button>

            {/* Save to Vault */}
            <button
              onClick={handleSave}
              title="Save to Smriti Kosh Vault"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-amber-300 border border-amber-500/30 hover:border-amber-400 text-xs flex items-center gap-1 transition-all"
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
            </button>

            {/* Ask AI / Contemplate */}
            {onAskAboutVerse && (
              <button
                onClick={handleInquireWithAI}
                title="Discuss this verse with Vedic Sage in Prajna BharatGPT"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs transition-all shadow-sm shadow-amber-900/40"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contemplate</span>
              </button>
            )}

            {/* Expand / Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse widget" : "Expand widget"}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-400/80 hover:text-amber-200 border border-amber-500/20 text-xs transition-all"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Main Content */}
        {isExpanded ? (
          isLoading ? (
            <div className="p-5 sm:p-6 relative z-10 space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 p-5 sm:p-6 rounded-xl bg-slate-950/70 border border-amber-500/25 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="w-36 h-4 rounded" />
                    <Skeleton className="w-20 h-4 rounded" />
                  </div>
                  <Skeleton className="w-full h-7 rounded-lg" />
                  <Skeleton className="w-4/5 h-7 rounded-lg" />
                  <div className="pt-2 border-t border-amber-500/15">
                    <Skeleton className="w-11/12 h-3.5 rounded" />
                  </div>
                </div>
                <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-slate-950/70 border border-amber-500/25 space-y-3">
                  <Skeleton className="w-40 h-4 rounded" />
                  <Skeleton className="w-full h-4 rounded" />
                  <Skeleton className="w-full h-4 rounded" />
                  <Skeleton className="w-3/4 h-4 rounded" />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-6 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Sanskrit Verse & Calligraphy */}
                <div className="lg:col-span-7 space-y-4">
                {/* Devanagari Sanskrit Container */}
                <div className="p-5 sm:p-6 rounded-xl bg-slate-950/70 border border-amber-500/25 hover:border-amber-500/45 shadow-inner hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-2 right-3 text-4xl text-amber-500/10 font-serif select-none pointer-events-none">
                    ॐ
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-amber-400/90 tracking-wide uppercase flex items-center gap-1.5">
                      <Scroll className="w-3.5 h-3.5 text-amber-500" />
                      मूल संस्कृत मन्त्र (Mula Mantra)
                    </span>
                    {verse.chhandas && (
                      <span className="text-[10px] text-amber-400/60 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {verse.chhandas}
                      </span>
                    )}
                  </div>

                  {/* Sacred Devanagari verse */}
                  <div className="text-xl sm:text-2xl font-serif font-bold text-amber-200 leading-relaxed tracking-wide whitespace-pre-line my-3 drop-shadow-sm">
                    {verse.sanskrit}
                  </div>

                  {/* Transliteration */}
                  <div className="mt-3 pt-3 border-t border-amber-500/15 text-xs sm:text-sm text-amber-300/80 italic font-mono leading-relaxed whitespace-pre-line">
                    {verse.transliteration}
                  </div>
                </div>

                {/* Audio TTS Player Bar */}
                <AudioTTSPlayerBar
                  speechState={speechState}
                  onPlay={(mode, speed, drone) =>
                    handleStartRecitation(mode || narrationMode, speed || selectedSpeed, drone ?? isDroneEnabled)
                  }
                  onPause={handlePauseRecitation}
                  onResume={handleResumeRecitation}
                  onStop={handleStopRecitation}
                  onSpeedChange={handleSpeedChange}
                  onToggleDrone={handleToggleDrone}
                  selectedSpeed={selectedSpeed}
                  isDroneEnabled={isDroneEnabled}
                  modes={[
                    { id: "full", label: "Full Sacred Recitation" },
                    { id: "sanskrit_only", label: "Sanskrit Mantra Only" },
                    { id: "translation_only", label: "English Translation" },
                  ]}
                  activeMode={narrationMode}
                  onModeChange={(m) => setNarrationMode(m)}
                  title={`${verse.theme} (${verse.source})`}
                  subtitle={`Language: ${selectedLanguage === "English" ? "English / Sanskrit" : selectedLanguage} • Ambient Drone: ${isDroneEnabled ? "Active" : "Off"}`}
                  theme="dark"
                />

                {/* Navigation Pills between Tabs */}
                <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2">
                  <button
                    onClick={() => setActiveTab("translation")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02] ${
                      activeTab === "translation"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20"
                        : "text-amber-400/60 hover:text-amber-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <Feather className="w-3.5 h-3.5" />
                    English Translation
                  </button>

                  <button
                    onClick={() => setActiveTab("breakdown")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02] ${
                      activeTab === "breakdown"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20"
                        : "text-amber-400/60 hover:text-amber-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <Scroll className="w-3.5 h-3.5" />
                    Word Breakdown ({verse.wordBreakdown.length})
                  </button>

                  <button
                    onClick={() => setActiveTab("contemplation")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02] ${
                      activeTab === "contemplation"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20"
                        : "text-amber-400/60 hover:text-amber-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Daily Chintan
                  </button>
                </div>

                {/* Tab 1: English Translation */}
                {activeTab === "translation" && (
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 hover:border-amber-500/40 text-sm text-amber-100/90 leading-relaxed font-serif shadow-inner hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300">
                    <span className="text-xl text-amber-400 font-serif leading-none mr-1.5">“</span>
                    {verse.englishTranslation}
                    <span className="text-xl text-amber-400 font-serif leading-none ml-1.5">”</span>
                  </div>
                )}

                {/* Tab 2: Word Breakdown (Padachheda) with Click to Pronounce */}
                {activeTab === "breakdown" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 pr-2 custom-scrollbar">
                    {verse.wordBreakdown.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePronounceWord(item.word, item.meaning)}
                        className="text-left p-2.5 rounded-lg bg-slate-950/60 hover:bg-amber-950/40 border border-amber-500/15 hover:border-amber-400/40 text-xs flex items-center justify-between group transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-md hover:shadow-amber-500/10"
                        title={`Click to listen pronunciation of ${item.word}`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-amber-300 font-serif group-hover:text-amber-200">{item.word}</span>
                          <span className="text-amber-200/70 text-[11px] mt-0.5">{item.meaning}</span>
                        </div>
                        <Volume2 className="w-3 h-3 text-amber-500/60 group-hover:text-amber-400 group-hover:scale-110 transition-all ml-2 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab 3: Daily Chintan */}
                {activeTab === "contemplation" && (
                  <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-500/30 hover:border-amber-500/50 text-xs sm:text-sm text-amber-200 leading-relaxed space-y-2 shadow-inner hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Practical Daily Application:
                    </div>
                    <p className="text-amber-100/80">{verse.dailyContemplation}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Context, Seer & Deep Insights */}
              <div className="lg:col-span-5 space-y-3.5">
                {/* Theme & Source Card */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/20 hover:border-amber-500/40 space-y-2.5 shadow-md hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center justify-between text-xs text-amber-400/80 border-b border-amber-500/15 pb-2">
                    <span className="font-semibold">Core Theme:</span>
                    <span className="text-amber-300 font-medium">{verse.theme}</span>
                  </div>

                  {verse.vedicSeer && (
                    <div className="flex items-center justify-between text-xs text-amber-400/80 border-b border-amber-500/15 pb-2">
                      <span className="font-semibold">Vedic Rishi / Seer:</span>
                      <span className="text-amber-200 font-mono text-[11px]">{verse.vedicSeer}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider block mb-1">
                      Philosophical Essence (दार्शनिक सार)
                    </span>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      {verse.philosophicalEssence}
                    </p>
                  </div>
                </div>

                {/* Action Call to Action */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 hover:border-amber-500/50 flex items-center justify-between gap-3 shadow-md hover:shadow-lg hover:shadow-amber-500/15 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="text-xs text-amber-200">
                    <span className="font-semibold block text-amber-300">Seek deeper Vedic guidance?</span>
                    <span className="text-[11px] text-amber-300/70">Inquire with the Vedic Sage persona in Prajna BharatGPT.</span>
                  </div>
                  {onAskAboutVerse && (
                    <button
                      onClick={handleInquireWithAI}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap transition-all shadow-md shadow-amber-900/30 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ask Sage</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
          /* Compact View Bar */
          <div className="px-5 py-3 flex items-center justify-between gap-4 text-xs text-amber-200">
            <div className="flex items-center gap-3 truncate">
              <span className="font-serif text-amber-300 font-bold truncate">
                {verse.sanskrit.split("\n")[0]}
              </span>
              <span className="text-amber-400/50 hidden sm:inline">•</span>
              <span className="italic text-amber-200/80 truncate hidden sm:inline">
                "{verse.englishTranslation}"
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-amber-400 hover:text-amber-300 font-medium text-xs whitespace-nowrap flex items-center gap-1"
            >
              <span>View Verse</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
