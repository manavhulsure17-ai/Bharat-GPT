import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  Bookmark,
  Copy,
  Check,
  Flame,
  Lightbulb,
  Award,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  CircleDot,
  Compass,
  Info
} from "lucide-react";
import { SHLOKA_WISDOM_COLLECTION } from "../data/shlokasData";
import { GITA_CHAPTERS_DATA } from "../data/gitaChaptersData";
import { IndicLanguageCode, SavedItem, ShlokaItem, GitaChapter } from "../types";
import { fetchShlokaGuidance } from "../services/geminiService";
import { soundscape } from "../services/audioSynth";
import { ShlokaSkeleton } from "./SkeletonLoader";
import { toast } from "../services/toastService";
import { karmaService } from "../services/karmaService";
import { InteractiveTextHighlight } from "./InteractiveTextHighlight";

interface GitaWisdomSectionProps {
  selectedLanguage: IndicLanguageCode;
  onSaveItem: (item: SavedItem) => void;
  initialChapterNumber?: number | null;
  initialShlokaId?: string | null;
  onClearInitialSelection?: () => void;
}

const LOCAL_STORAGE_KEY = "bharat_gita_explored_chapters_v1";

export const GitaWisdomSection: React.FC<GitaWisdomSectionProps> = ({
  selectedLanguage,
  onSaveItem,
  initialChapterNumber,
  initialShlokaId,
  onClearInitialSelection,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeShloka, setActiveShloka] = useState<ShlokaItem>(SHLOKA_WISDOM_COLLECTION[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Gita Chapters Exploration State
  const [exploredChapters, setExploredChapters] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return new Set(parsed);
        }
      }
    } catch {
      // Fallback
    }
    // Default: Chapter 2 is explored initially as it's the active canonical shloka
    return new Set([2]);
  });

  const [selectedChapter, setSelectedChapter] = useState<GitaChapter>(GITA_CHAPTERS_DATA[1]); // Default to Chapter 2
  const [activeYogaSection, setActiveYogaSection] = useState<"all" | "karma" | "bhakti" | "jnana">("all");

  // Handle incoming selection from global search bar
  useEffect(() => {
    if (initialChapterNumber) {
      const chap = GITA_CHAPTERS_DATA.find((c) => c.chapterNumber === initialChapterNumber);
      if (chap) {
        setSelectedChapter(chap);
        setExploredChapters((prev) => new Set(prev).add(chap.chapterNumber));
      }
    }
    if (initialShlokaId) {
      const shloka = SHLOKA_WISDOM_COLLECTION.find((s) => s.id === initialShlokaId);
      if (shloka) {
        setActiveShloka(shloka);
      }
    }
    if ((initialChapterNumber || initialShlokaId) && onClearInitialSelection) {
      onClearInitialSelection();
    }
  }, [initialChapterNumber, initialShlokaId]);

  // Save to local storage whenever explored chapters change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(exploredChapters)));
    } catch (e) {
      console.error("Failed to persist Gita progress to localStorage", e);
    }
  }, [exploredChapters]);

  const lifeThemes = [
    { label: "Anxiety & Overthinking", query: "Anxiety, stress, and obsessing over outcomes", chapterNum: 2 },
    { label: "Finding Dharma & Purpose", query: "Confusion regarding career, life purpose, and true duty", chapterNum: 3 },
    { label: "Mastering the Restless Mind", query: "Meditation, digital distractions, and focus control", chapterNum: 6 },
    { label: "Overcoming Fear & Paralysis", query: "Fear of failure, self-doubt, and hesitation in taking action", chapterNum: 1 },
    { label: "Cultivating Pure Devotion", query: "Compassion, emotional peace, and equanimity in praise or blame", chapterNum: 12 },
    { label: "Leadership & Action", query: "Setting moral example, duty without greed, and selfless service", chapterNum: 3 },
    { label: "Cosmic Perspective", query: "Transcending petty worries through cosmic vision of time", chapterNum: 11 },
    { label: "Ultimate Liberation", query: "Courage, surrender of dogmas, and supreme inner freedom", chapterNum: 18 },
  ];

  const markChapterExplored = (chapterNum: number) => {
    setExploredChapters((prev) => {
      const next = new Set(prev);
      next.add(chapterNum);
      return next;
    });
  };

  const toggleChapterStatus = (chapterNum: number) => {
    soundscape.playTempleBell();
    setExploredChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterNum)) {
        next.delete(chapterNum);
      } else {
        next.add(chapterNum);
      }
      return next;
    });
  };

  const handleSelectChapter = (chapter: GitaChapter) => {
    const isNew = !exploredChapters.has(chapter.chapterNumber);
    setSelectedChapter(chapter);
    markChapterExplored(chapter.chapterNumber);
    soundscape.playTempleBell();

    if (isNew) {
      karmaService.addKarma(
        20,
        `Gita Chapter ${chapter.chapterNumber} • ${chapter.sanskritTitle}`,
        "gita"
      );
      karmaService.recordActivity("gitaChaptersExplored", 1);
    }
  };

  const handleSeekFromChapter = (chapter: GitaChapter) => {
    setSearchQuery(chapter.suggestedQuery);
    handleSearchShloka(chapter.suggestedQuery, chapter.chapterNumber);
  };

  const handleSearchShloka = async (customTopic?: string, explicitChapterNum?: number) => {
    const query = (customTopic || searchQuery).trim();
    if (!query || isLoading) return;

    setIsLoading(true);
    soundscape.playTempleBell();

    if (explicitChapterNum) {
      markChapterExplored(explicitChapterNum);
    }

    try {
      const shloka = await fetchShlokaGuidance(query, selectedLanguage);
      setActiveShloka(shloka);

      karmaService.addKarma(
        25,
        `Gita Guidance • ${shloka.source || "Sacred Shloka"}`,
        "gita"
      );
      karmaService.recordActivity("gitaVersesRead", 1);

      // Auto-detect chapter from shloka metadata or source string
      const match = (shloka.chapterVerse || shloka.source || "").match(/chapter\s*(\d+)/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num >= 1 && num <= 18) {
          markChapterExplored(num);
          const found = GITA_CHAPTERS_DATA.find((c) => c.chapterNumber === num);
          if (found) setSelectedChapter(found);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronize speech state
  useEffect(() => {
    const unsubscribe = soundscape.subscribe((state) => {
      if (state.isSpeaking && state.speakingId) {
        setSpeakingId(state.speakingId);
      } else if (!state.isSpeaking) {
        setSpeakingId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSpeakShloka = (shloka: ShlokaItem) => {
    if (speakingId === shloka.id) {
      soundscape.stopSpeaking();
      setSpeakingId(null);
    } else {
      setSpeakingId(shloka.id);
      const textToRecite = `${shloka.source}. ${shloka.sanskrit}. Translation: ${shloka.translation}. Life Guidance: ${shloka.lifeGuidance}`;
      soundscape.speakText(
        textToRecite,
        "Sanskrit",
        shloka.id,
        () => setSpeakingId(null),
        () => setSpeakingId(shloka.id)
      );
    }
  };

  const handleSaveShloka = (shloka: ShlokaItem) => {
    onSaveItem({
      id: "shloka-save-" + shloka.id,
      type: "shloka",
      title: `${shloka.source} (${shloka.theme})`,
      snippet: shloka.translation,
      date: new Date().toLocaleDateString(),
      data: shloka,
    });
    setSavedIds((prev) => new Set(prev).add(shloka.id));
    soundscape.playTempleBell();
  };

  const handleCopy = () => {
    const text = `${activeShloka.source}\n${activeShloka.sanskrit}\n\n${activeShloka.transliteration}\n\nMeaning:\n${activeShloka.translation}\n\nGuidance:\n${activeShloka.lifeGuidance}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Gita Shloka and guidance copied to clipboard!", { title: "Copied Shloka" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetProgress = () => {
    if (window.confirm("Reset your 18 Chapters exploration progress?")) {
      setExploredChapters(new Set());
      soundscape.playTempleBell();
      toast.info("Chapter exploration progress has been reset.", { title: "Progress Reset" });
    }
  };

  const handleExploreAll = () => {
    const all = new Set(GITA_CHAPTERS_DATA.map((c) => c.chapterNumber));
    setExploredChapters(all);
    soundscape.playTempleBell();
    toast.success("Marked all 18 Chapters as explored! 🌟", { title: "Gita Journey" });
    karmaService.addKarma(100, "Jnana Yajna • Explored all 18 Gita Chapters", "gita");
    karmaService.recordActivity("gitaChaptersExplored", 18);
    karmaService.unlockBadge("gita-jnana-yogi");
  };

  // Progress metrics calculation
  const totalChapters = 18;
  const exploredCount = exploredChapters.size;
  const progressPercent = Math.round((exploredCount / totalChapters) * 100);

  // Filter chapters based on 3 major Shatkas / divisions of Gita
  const filteredChapters = GITA_CHAPTERS_DATA.filter((chapter) => {
    if (activeYogaSection === "karma") return chapter.chapterNumber >= 1 && chapter.chapterNumber <= 6;
    if (activeYogaSection === "bhakti") return chapter.chapterNumber >= 7 && chapter.chapterNumber <= 12;
    if (activeYogaSection === "jnana") return chapter.chapterNumber >= 13 && chapter.chapterNumber <= 18;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8 golden-selection-zone relative">
      {/* Interactive Golden Highlight Tooltip on text selection */}
      <InteractiveTextHighlight sectionName="Gita Wisdom" />

      {/* Title & Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs text-amber-300">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>भगवद्गीता एवं सुभाषित • Eternal Indic Oracle</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-royal font-bold text-saffron-gradient">
          VEDIC & GITA WISDOM ORACLE
        </h2>
        <p className="text-xs sm:text-sm text-amber-200/80">
          Discover timeless Sanskrit shlokas and Upanishadic wisdom synthesized directly for your modern dilemmas, decisions, and inner peace.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* GITA 18 CHAPTERS VISUAL PROGRESS TRACKER */}
      {/* ========================================================================= */}
      <section
        id="gita-chapter-progress-tracker"
        className="bg-gradient-to-b from-[#101828] via-[#0c1322] to-[#090e1a] border-2 border-amber-500/40 hover:border-amber-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-0.5 space-y-6 relative overflow-hidden transition-all duration-300"
      >
        {/* Background Mandala Watermark */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Progress Tracker Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪷</span>
              <h3 className="font-royal text-base sm:text-lg font-bold text-amber-200 flex items-center gap-2">
                अष्टादश अध्याय यात्रा • 18 Chapters Progress Tracker
              </h3>
            </div>
            <p className="text-xs text-amber-400/80">
              Track your journey through the 18 profound yogas of the Bhagavad Gita (700 Verses).
            </p>
          </div>

          {/* Metric Pill and Quick Actions */}
          <div className="flex items-center gap-2 sm:self-center">
            <div className="bg-amber-950/60 border border-amber-500/40 hover:border-amber-500/60 px-3.5 py-1.5 rounded-2xl flex items-center gap-2.5 shadow-inner hover:shadow-md hover:shadow-amber-500/10 hover:scale-[1.02] transition-all duration-200">
              <Award className={`w-4 h-4 ${exploredCount === 18 ? "text-emerald-400" : "text-amber-400"}`} />
              <div className="text-right">
                <span className="text-xs font-bold text-amber-100 block">
                  {exploredCount} / {totalChapters} Chapters
                </span>
                <span className="text-[10px] text-amber-400 font-medium">
                  {progressPercent}% Complete
                </span>
              </div>
            </div>

            <button
              onClick={exploredCount === 18 ? handleResetProgress : handleExploreAll}
              className="p-2 rounded-xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-amber-100 text-xs transition-all hover:scale-105 hover:shadow-md hover:shadow-amber-500/10"
              title={exploredCount === 18 ? "Reset Progress" : "Mark All 18 Chapters as Explored"}
            >
              {exploredCount === 18 ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Visual Progress Bar & Milestones */}
        <div className="space-y-2">
          <div className="w-full bg-slate-900/90 rounded-full h-3.5 p-0.5 border border-amber-500/30 overflow-hidden shadow-inner flex items-center">
            <div
              className="bg-gradient-to-r from-amber-600 via-amber-400 to-orange-500 h-full rounded-full transition-all duration-700 ease-out shadow-lg shadow-amber-500/40 relative"
              style={{ width: `${Math.max(progressPercent, 4)}%` }}
            >
              {progressPercent > 10 && (
                <span className="absolute inset-0 flex items-center justify-end pr-1.5 text-[9px] font-extrabold text-slate-950">
                  {progressPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Three Shatka Milestones Indicators */}
          <div className="grid grid-cols-3 text-[11px] font-medium pt-1 text-center text-amber-400/80">
            <div className="border-r border-amber-500/20 px-1">
              <span className="font-semibold text-amber-200">Karma Yoga</span>
              <span className="block text-[10px] text-amber-400/60">Ch. 1 – 6</span>
            </div>
            <div className="border-r border-amber-500/20 px-1">
              <span className="font-semibold text-amber-200">Bhakti Yoga</span>
              <span className="block text-[10px] text-amber-400/60">Ch. 7 – 12</span>
            </div>
            <div className="px-1">
              <span className="font-semibold text-amber-200">Jnana Yoga</span>
              <span className="block text-[10px] text-amber-400/60">Ch. 13 – 18</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs for 3 Shatkas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-amber-500/15">
          <button
            onClick={() => setActiveYogaSection("all")}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-[1.02] ${
              activeYogaSection === "all"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "bg-slate-900/60 text-amber-300/80 hover:text-amber-100 hover:bg-slate-800"
            }`}
          >
            All 18 Chapters
          </button>
          <button
            onClick={() => setActiveYogaSection("karma")}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-[1.02] ${
              activeYogaSection === "karma"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "bg-slate-900/60 text-amber-300/80 hover:text-amber-100 hover:bg-slate-800"
            }`}
          >
            Karma Yoga (1-6)
          </button>
          <button
            onClick={() => setActiveYogaSection("bhakti")}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-[1.02] ${
              activeYogaSection === "bhakti"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "bg-slate-900/60 text-amber-300/80 hover:text-amber-100 hover:bg-slate-800"
            }`}
          >
            Bhakti Yoga (7-12)
          </button>
          <button
            onClick={() => setActiveYogaSection("jnana")}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-[1.02] ${
              activeYogaSection === "jnana"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "bg-slate-900/60 text-amber-300/80 hover:text-amber-100 hover:bg-slate-800"
            }`}
          >
            Jnana Yoga (13-18)
          </button>
        </div>

        {/* 18 Chapters Interactive Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {filteredChapters.map((chapter) => {
            const isExplored = exploredChapters.has(chapter.chapterNumber);
            const isSelected = selectedChapter.chapterNumber === chapter.chapterNumber;

            return (
              <button
                key={chapter.chapterNumber}
                onClick={() => handleSelectChapter(chapter)}
                className={`relative group p-2.5 rounded-2xl border text-left transition-all duration-200 hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/15 flex flex-col justify-between ${
                  isSelected
                    ? "bg-gradient-to-b from-amber-950/90 to-orange-950/80 border-amber-400 shadow-lg shadow-amber-500/25 ring-1 ring-amber-400"
                    : isExplored
                    ? "bg-slate-900/80 border-amber-500/50 hover:border-amber-400 text-amber-100"
                    : "bg-slate-950/60 border-slate-800 hover:border-amber-500/30 text-amber-400/50 hover:text-amber-200"
                }`}
              >
                {/* Chapter Number & Status Indicator */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isExplored
                        ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/40"
                        : "bg-slate-800 text-amber-400/60"
                    }`}
                  >
                    {chapter.chapterNumber}
                  </span>

                  {isExplored ? (
                    <span className="flex items-center text-amber-300 text-[10px]" title="Explored">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600 group-hover:text-amber-400/60">
                      <CircleDot className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Chapter Titles */}
                <div>
                  <h4 className="font-indic text-xs font-bold text-amber-200 line-clamp-1">
                    {chapter.sanskritTitle.split(" ")[0]}
                  </h4>
                  <p className="text-[10px] text-amber-300/70 line-clamp-1">
                    {chapter.englishTitle}
                  </p>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[9px] text-amber-400/50">
                  <span>{chapter.verseCount} verses</span>
                  {isSelected && <span className="text-amber-300 font-bold">Active</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Chapter Deep Dive Card */}
        {selectedChapter && (
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#0e1628] border border-amber-500/30 hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center font-bold text-amber-300 text-sm">
                  {selectedChapter.chapterNumber}
                </span>
                <div>
                  <h4 className="font-royal text-sm sm:text-base font-bold text-amber-200 flex items-center gap-2">
                    <span>{selectedChapter.sanskritTitle}</span>
                    <span className="text-xs font-normal text-amber-400/80">({selectedChapter.transliteration})</span>
                  </h4>
                  <p className="text-xs text-amber-300/70">
                    {selectedChapter.englishTitle} • {selectedChapter.verseCount} Verses • Theme: <strong className="text-amber-200">{selectedChapter.theme}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleChapterStatus(selectedChapter.chapterNumber)}
                  className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all hover:scale-[1.02] ${
                    exploredChapters.has(selectedChapter.chapterNumber)
                      ? "bg-amber-500/20 border-amber-400 text-amber-200"
                      : "bg-slate-900 border-amber-500/30 text-amber-400/80 hover:text-amber-100"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{exploredChapters.has(selectedChapter.chapterNumber) ? "Explored" : "Mark Explored"}</span>
                </button>

                <button
                  onClick={() => handleSeekFromChapter(selectedChapter)}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/50 transition-all hover:scale-[1.03]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Seek Shloka from Ch. {selectedChapter.chapterNumber}</span>
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
              {selectedChapter.coreSummary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-900/80 border border-amber-500/20 hover:border-amber-500/40 rounded-xl p-3 shadow-inner hover:shadow-md hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-200">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/80 block mb-1">
                  Core Philosophical Insight (सार)
                </span>
                <p className="text-xs text-amber-200 font-medium">
                  {selectedChapter.keyInsight}
                </p>
              </div>

              <div className="bg-slate-900/80 border border-amber-500/20 hover:border-amber-500/40 rounded-xl p-3 shadow-inner hover:shadow-md hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-200">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/80 block mb-1">
                  Key Sanskrit Verse Snippet
                </span>
                <p className="text-xs font-indic text-amber-300 italic">
                  "{selectedChapter.keyVerseSnippet}"
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Inquiry & Life Dilemma Search */}
      <div className="bg-[#0f172a]/95 border border-amber-500/30 hover:border-amber-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300 space-y-4">
        <label className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Ask Gita on your situation, emotion, or life question:
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. 'Feeling overwhelmed by career goals and fear of making the wrong choice...'"
            className="flex-1 bg-slate-900/90 border border-amber-500/30 focus:border-amber-400 rounded-xl px-4 py-3 text-xs sm:text-sm text-amber-100 placeholder:text-amber-400/40 focus:outline-none transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleSearchShloka()}
          />
          <button
            onClick={() => handleSearchShloka()}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-5 sm:px-7 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-950/60 transition-all hover:scale-[1.03]"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Seek Shloka</span>
          </button>
        </div>

        {/* Life Theme Pills */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] text-amber-400/60 font-medium block">
            Common Inquiries & Chapters:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {lifeThemes.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(item.query);
                  handleSearchShloka(item.query, item.chapterNum);
                }}
                className="bg-slate-900/80 hover:bg-amber-950/50 text-amber-300/80 hover:text-amber-100 border border-amber-500/20 hover:border-amber-500/50 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-200 hover:scale-[1.03] hover:shadow-sm hover:shadow-amber-500/20 flex-shrink-0 flex items-center gap-1.5"
              >
                <span>{item.label}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full">
                  Ch. {item.chapterNum}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured / Active Shloka Card */}
      {isLoading ? (
        <ShlokaSkeleton />
      ) : (
        <div className="bg-gradient-to-b from-[#11192e] to-[#0b101e] border-2 border-amber-500/40 hover:border-amber-500/60 rounded-3xl p-6 sm:p-10 shadow-2xl hover:shadow-amber-500/15 hover:-translate-y-0.5 transition-all duration-300 space-y-8 relative overflow-hidden bg-mandala-pattern">
          {/* Card Top Details */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <span className="text-xl">🕉️</span>
              <div>
                <h3 className="font-royal text-lg sm:text-xl font-bold text-amber-200">
                  {activeShloka.source} {activeShloka.chapterVerse && `• ${activeShloka.chapterVerse}`}
                </h3>
                <span className="text-xs text-amber-400/80 font-medium">
                  Theme: {activeShloka.theme}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSpeakShloka(activeShloka)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all hover:scale-105 ${
                  speakingId === activeShloka.id
                    ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse shadow-md shadow-amber-500/30"
                    : "bg-slate-900 text-amber-200 border-amber-500/30 hover:bg-amber-950/50"
                }`}
                title="Recite Sanskrit Shloka aloud"
              >
                {speakingId === activeShloka.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="hidden sm:inline">Recite</span>
              </button>

              <button
                onClick={handleCopy}
                className="p-2 rounded-xl bg-slate-900 text-amber-200 border border-amber-500/30 hover:bg-amber-950/50 text-xs flex items-center gap-1.5 transition-all hover:scale-105"
                title="Copy Shloka & Meaning"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={() => handleSaveShloka(activeShloka)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all hover:scale-105 ${
                  savedIds.has(activeShloka.id)
                    ? "bg-emerald-950 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20"
                    : "bg-slate-900 text-amber-200 border-amber-500/30 hover:bg-amber-950/50"
                }`}
                title="Save to Vault"
              >
                <Bookmark className="w-4 h-4" fill={savedIds.has(activeShloka.id) ? "currentColor" : "none"} />
                <span className="hidden sm:inline">{savedIds.has(activeShloka.id) ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>

          {/* Sanskrit Devanagari Display */}
          <div className="text-center space-y-4 py-4 px-2 sm:px-6 bg-amber-950/20 border border-amber-500/20 hover:border-amber-500/40 rounded-2xl shadow-inner hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300">
            <p className="font-indic text-xl sm:text-2xl md:text-3xl text-saffron-gradient font-bold leading-relaxed whitespace-pre-line">
              {activeShloka.sanskrit}
            </p>
            <p className="text-xs sm:text-sm text-amber-300/80 font-serif italic tracking-wide">
              {activeShloka.transliteration}
            </p>
          </div>

          {/* Word by Word Meaning (Padacheda) */}
          {activeShloka.wordMeaning && activeShloka.wordMeaning.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400">
                Word-by-Word Sanskrit Breakdown (पदच्छेद एवं शब्दार्थ)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {activeShloka.wordMeaning.map((wm, i) => (
                  <div
                    key={i}
                    className="bg-slate-900/70 border border-amber-500/15 hover:border-amber-500/40 rounded-xl p-2.5 text-xs shadow-sm hover:shadow-md hover:shadow-amber-500/10 hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span className="font-bold text-amber-300 block font-indic">{wm.word}</span>
                    <span className="text-amber-200/70 text-[11px] block mt-0.5">{wm.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Translation */}
          <div className="space-y-2 bg-[#0e1628] border-l-4 border-amber-500 hover:border-amber-400 rounded-r-2xl p-4 sm:p-5 shadow-inner hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300">
            <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400">
              Essence & Meaning (भावार्थ)
            </h4>
            <p className="text-xs sm:text-sm text-amber-100 font-serif leading-relaxed">
              {activeShloka.translation}
            </p>
            {activeShloka.context && (
              <p className="text-[11px] text-amber-400/60 mt-1 italic">
                Context: {activeShloka.context}
              </p>
            )}
          </div>

          {/* Real-Life Practical Application Guidance */}
          <div className="space-y-2 bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-slate-900 border border-orange-500/30 hover:border-orange-500/50 rounded-2xl p-5 shadow-md hover:shadow-xl hover:shadow-orange-500/15 hover:-translate-y-0.5 transition-all duration-300">
            <h4 className="text-xs uppercase font-bold tracking-wider text-orange-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-orange-400" />
              Practical Modern Application (दैनिक जीवन में उपयोग)
            </h4>
            <div className="text-xs sm:text-sm text-amber-100 whitespace-pre-line leading-relaxed">
              {activeShloka.lifeGuidance}
            </div>
          </div>
        </div>
      )}

      {/* Curated Classic Library Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-royal font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          Explore Timeless Canonical Shlokas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SHLOKA_WISDOM_COLLECTION.map((shloka) => (
            <button
              key={shloka.id}
              onClick={() => {
                setActiveShloka(shloka);
                if (shloka.chapterVerse) {
                  const match = shloka.chapterVerse.match(/chapter\s*(\d+)/i);
                  if (match && match[1]) {
                    const num = parseInt(match[1], 10);
                    markChapterExplored(num);
                    const found = GITA_CHAPTERS_DATA.find((c) => c.chapterNumber === num);
                    if (found) setSelectedChapter(found);
                  }
                }
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/15 ${
                activeShloka.id === shloka.id
                  ? "bg-amber-950/60 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/40"
                  : "bg-slate-900/60 border-amber-500/20 text-amber-200/80 hover:border-amber-500/50 hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-1">
                <span>{shloka.source}</span>
                <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-amber-300">
                  {shloka.theme}
                </span>
              </div>
              <p className="font-indic text-sm text-amber-200 font-semibold line-clamp-1">
                {shloka.sanskrit.split("\n")[0]}
              </p>
              <p className="text-xs text-amber-300/60 line-clamp-2 mt-1">
                {shloka.translation}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
