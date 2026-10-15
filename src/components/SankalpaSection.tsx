import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Flame,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  MessageSquare,
  Copy,
  Check,
  Calendar,
  Compass,
  ArrowRight,
  TrendingUp,
  Award,
  Trash2,
  Edit3,
  X,
  RotateCcw,
  Heart,
  ChevronDown,
  ChevronUp,
  Share2,
  Mic,
  Lightbulb,
  Clock,
  Shield,
  Layers
} from "lucide-react";
import {
  SankalpaCategory,
  SankalpaFulfillmentStatus,
  SankalpaItem,
  SankalpaWisdomReminder,
  IndicLanguageCode,
  SavedItem,
  AppTheme,
} from "../types";
import { sankalpaService, SankalpaProgressStats } from "../services/sankalpaService";
import { SANKALPA_CATEGORIES, SANKALPA_PRESETS, SankalpaPreset } from "../data/sankalpaPresetsData";
import { AudioTranscribeButton } from "./AudioTranscribeButton";
import { soundscape } from "../services/audioSynth";
import { toast } from "../services/toastService";
import { karmaService } from "../services/karmaService";

interface SankalpaSectionProps {
  selectedLanguage: IndicLanguageCode;
  onSaveItem: (item: SavedItem) => void;
  onAskBharatGPT?: (prompt: string, persona?: any) => void;
  theme?: AppTheme;
}

export const SankalpaSection: React.FC<SankalpaSectionProps> = ({
  selectedLanguage,
  onSaveItem,
  onAskBharatGPT,
  theme = "deep_night",
}) => {
  const isLight = theme === "temple_ivory";

  const [items, setItems] = useState<SankalpaItem[]>([]);
  const [stats, setStats] = useState<SankalpaProgressStats>(() => sankalpaService.getStats());
  const [activeFilter, setActiveFilter] = useState<"today" | "all" | "fulfilled" | "presets">("today");

  // Wisdom Reminder state
  const [wisdomReminder, setWisdomReminder] = useState<SankalpaWisdomReminder | null>(() =>
    sankalpaService.getStoredWisdomReminder()
  );
  const [isLoadingWisdom, setIsLoadingWisdom] = useState(false);
  const [isSpeakingWisdom, setIsSpeakingWisdom] = useState(false);
  const [isCopiedWisdom, setIsCopiedWisdom] = useState(false);
  const [isWisdomSaved, setIsWisdomSaved] = useState(false);

  // Intention Creation / Edit Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newIndicTitle, setNewIndicTitle] = useState("");
  const [newCategory, setNewCategory] = useState<SankalpaCategory>("shanti");
  const [newMantra, setNewMantra] = useState("");
  const [newWhy, setNewWhy] = useState("");
  const [newTargetDate, setNewTargetDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Reflection Modal state
  const [reflectionModalItem, setReflectionModalItem] = useState<SankalpaItem | null>(null);
  const [reflectionText, setReflectionText] = useState("");

  // Subscribe to service
  useEffect(() => {
    const unsubscribe = sankalpaService.subscribe((updatedItems) => {
      setItems(updatedItems);
      setStats(sankalpaService.getStats());
    });
    return () => unsubscribe();
  }, []);

  // Fetch initial wisdom reminder if not present
  useEffect(() => {
    if (!wisdomReminder) {
      loadWisdomReminder(false);
    }
  }, []);

  const loadWisdomReminder = async (forceRefresh: boolean = false) => {
    setIsLoadingWisdom(true);
    try {
      const res = await sankalpaService.fetchWisdomReminder(selectedLanguage, forceRefresh);
      setWisdomReminder(res);
      if (forceRefresh) {
        soundscape.playTempleBell();
        toast.show("✨ Fresh Vedic Wisdom Reminder received for your journey!", "success", { duration: 3500 });
      }
    } catch (e) {
      console.warn("Failed to load wisdom reminder", e);
    } finally {
      setIsLoadingWisdom(false);
    }
  };

  const handleOpenCreateModal = (preset?: SankalpaPreset) => {
    setEditingItemId(null);
    if (preset) {
      setNewTitle(preset.title);
      setNewIndicTitle(preset.indicTitle);
      setNewCategory(preset.category);
      setNewMantra(preset.mantraOrAffirmation);
      setNewWhy(preset.whyItMatters);
    } else {
      setNewTitle("");
      setNewIndicTitle("");
      setNewCategory("shanti");
      setNewMantra(SANKALPA_CATEGORIES.shanti.defaultMantra);
      setNewWhy("");
    }
    setNewTargetDate(new Date().toISOString().split("T")[0]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (item: SankalpaItem) => {
    setEditingItemId(item.id);
    setNewTitle(item.title);
    setNewIndicTitle(item.indicTitle || "");
    setNewCategory(item.category);
    setNewMantra(item.mantraOrAffirmation || SANKALPA_CATEGORIES[item.category].defaultMantra);
    setNewWhy(item.whyItMatters || "");
    setNewTargetDate(item.targetDate);
    setIsCreateModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.show("Please enter your spiritual intention statement.", "warning");
      return;
    }

    sankalpaService.saveSankalpa({
      id: editingItemId || undefined,
      title: newTitle,
      indicTitle: newIndicTitle || undefined,
      category: newCategory,
      mantraOrAffirmation: newMantra || SANKALPA_CATEGORIES[newCategory].defaultMantra,
      whyItMatters: newWhy || undefined,
      targetDate: newTargetDate,
    });

    setIsCreateModalOpen(false);
  };

  const handleToggleFulfillment = (item: SankalpaItem) => {
    if (item.status === "fulfilled") {
      sankalpaService.updateFulfillment(item.id, "in_progress");
      toast.show("Sankalpa marked in-progress.", "info", { duration: 2000 });
    } else {
      // Open reflection modal or mark directly
      sankalpaService.updateFulfillment(item.id, "fulfilled");
    }
  };

  const handleOpenReflectionModal = (item: SankalpaItem) => {
    setReflectionModalItem(item);
    setReflectionText(item.reflectionNotes || "");
  };

  const handleSaveReflection = () => {
    if (!reflectionModalItem) return;
    sankalpaService.updateFulfillment(
      reflectionModalItem.id,
      reflectionModalItem.status === "in_progress" ? "fulfilled" : reflectionModalItem.status,
      reflectionText
    );
    karmaService.addKarma(5, "Contemplative Sankalpa Journaling", "wisdom");
    setReflectionModalItem(null);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Remove this Sankalpa from your journal?")) {
      sankalpaService.deleteSankalpa(id);
    }
  };

  // Recite Wisdom Shloka
  const handleToggleRecitation = () => {
    if (!wisdomReminder) return;
    if (isSpeakingWisdom) {
      soundscape.stopSpeaking();
      setIsSpeakingWisdom(false);
    } else {
      setIsSpeakingWisdom(true);
      const textToSpeak = `${wisdomReminder.shlokaSanskrit}. ${wisdomReminder.shlokaTranslation}. ${wisdomReminder.guidanceText}`;
      soundscape.speakText(
        textToSpeak,
        "Sanskrit",
        "wisdom-reminder",
        () => setIsSpeakingWisdom(false),
        () => setIsSpeakingWisdom(true)
      );
    }
  };

  const handleCopyWisdom = async () => {
    if (!wisdomReminder) return;
    const text = `🕉️ Sacred Sankalpa Wisdom\n${wisdomReminder.source}\n\n${wisdomReminder.shlokaSanskrit}\n${wisdomReminder.shlokaTransliteration}\n\n"${wisdomReminder.shlokaTranslation}"\n\nGuidance: ${wisdomReminder.guidanceText}\n\nDaily Nudge: "${wisdomReminder.dailyNudge}"`;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopiedWisdom(true);
      toast.show("Wisdom reminder copied to clipboard!", "success", { duration: 2500 });
      setTimeout(() => setIsCopiedWisdom(false), 2500);
    } catch {
      toast.show("Failed to copy text.", "error");
    }
  };

  const handleSaveWisdomToVault = () => {
    if (!wisdomReminder) return;
    const vaultItem: SavedItem = {
      id: `sankalpa-wisdom-${Date.now()}`,
      type: "shloka",
      title: `Sankalpa Wisdom: ${wisdomReminder.virtueTheme}`,
      snippet: `${wisdomReminder.shlokaSanskrit} — "${wisdomReminder.shlokaTranslation}"`,
      date: new Date().toLocaleDateString(),
      data: {
        source: wisdomReminder.source,
        sanskrit: wisdomReminder.shlokaSanskrit,
        transliteration: wisdomReminder.shlokaTransliteration,
        translation: wisdomReminder.shlokaTranslation,
        significance: `${wisdomReminder.guidanceText}\n\nDaily Practice: ${wisdomReminder.microPractice.title} - ${wisdomReminder.microPractice.instruction}`,
      },
    };
    onSaveItem(vaultItem);
    setIsWisdomSaved(true);
    soundscape.playTempleBell();
    toast.show("✨ Inscribed into your Sacred Vault!", "success", { duration: 3000 });
  };

  const handleAskAboutWisdom = () => {
    if (!wisdomReminder || !onAskBharatGPT) return;
    const prompt = `Please elaborate on this sacred verse from ${wisdomReminder.source} for my daily Sankalpa practice:\n"${wisdomReminder.shlokaSanskrit}"\n(${wisdomReminder.shlokaTranslation})\nHow does cultivating ${wisdomReminder.virtueTheme} deepen spiritual growth and peace in everyday modern life?`;
    onAskBharatGPT(prompt, "sage");
  };

  // Filtered Items
  const todayStr = new Date().toISOString().split("T")[0];
  const displayedItems = useMemo(() => {
    switch (activeFilter) {
      case "today":
        return items.filter((i) => i.targetDate === todayStr);
      case "fulfilled":
        return items.filter((i) => i.status === "fulfilled");
      case "all":
      default:
        return items;
    }
  }, [items, activeFilter, todayStr]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Hero / Sacred Header Banner */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 sm:p-7 shadow-xl transition-all ${
          isLight
            ? "bg-gradient-to-br from-amber-50 via-orange-50/60 to-amber-100/40 border-amber-300/80 shadow-amber-900/5"
            : "bg-gradient-to-br from-[#0c1222] via-[#10182c] to-[#0a0f1d] border-amber-500/30 shadow-black/50"
        }`}
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Title & Spiritual Concept */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/40">
                <Flame className="w-3.5 h-3.5 fill-amber-500 animate-pulse" />
                Vedic Intention Sadhana
              </span>
              <span
                className={`text-xs font-indic ${
                  isLight ? "text-amber-800" : "text-amber-400/80"
                }`}
              >
                मनसा वाचा कर्मणा • Manasa Vacha Karmana
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-royal font-bold text-saffron-gradient tracking-wide">
              Sankalpa Journal • संकल्प साधन
            </h1>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isLight ? "text-stone-700" : "text-amber-200/80"
              }`}
            >
              In Vedic tradition, a <em>Sankalpa</em> is a solemn vow consecrated in the heart to align daily thought, speech, and action with higher Dharma. Record your intentions, speak reflections via voice, and receive tailored AI wisdom.
            </p>
          </div>

          {/* Quick Metrics & Action */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Streak Counter */}
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold ${
                isLight
                  ? "bg-white border-orange-300 text-orange-950 shadow-sm"
                  : "bg-slate-900/90 border-orange-500/40 text-orange-200"
              }`}
            >
              <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-500">
                <Flame className="w-4 h-4 fill-orange-500" />
              </div>
              <div>
                <div className="text-[10px] text-orange-500 uppercase tracking-wider font-mono">
                  Sadhana Streak
                </div>
                <div className="text-sm font-bold font-mono">
                  {stats.streakDays} {stats.streakDays === 1 ? "Day" : "Days"}
                </div>
              </div>
            </div>

            {/* Fulfilled Metric */}
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold ${
                isLight
                  ? "bg-white border-emerald-300 text-emerald-950 shadow-sm"
                  : "bg-slate-900/90 border-emerald-500/40 text-emerald-200"
              }`}
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-emerald-500 uppercase tracking-wider font-mono">
                  Fulfilled
                </div>
                <div className="text-sm font-bold font-mono">
                  {stats.fulfilledCount} / {stats.totalCount} ({stats.fulfillmentRate}%)
                </div>
              </div>
            </div>

            {/* Inscribe Intention Button */}
            <button
              onClick={() => handleOpenCreateModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-orange-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Inscribe Sankalpa</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 pt-4 border-t border-amber-500/15">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className={isLight ? "text-stone-700" : "text-amber-300/80"}>
              Today's Fulfillment Rate:{" "}
              <strong>
                {stats.todayFulfilledCount} of {stats.todayCount} completed
              </strong>
            </span>
            <span className="font-mono text-amber-500 font-bold">
              {stats.todayCount > 0
                ? `${Math.round((stats.todayFulfilledCount / stats.todayCount) * 100)}%`
                : "No intentions set for today yet"}
            </span>
          </div>
          <div
            className={`w-full h-2 rounded-full overflow-hidden ${
              isLight ? "bg-stone-200" : "bg-slate-800"
            }`}
          >
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-500 rounded-full"
              style={{
                width: `${
                  stats.todayCount > 0
                    ? Math.round((stats.todayFulfilledCount / stats.todayCount) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* AI-Generated Wisdom Reminder Card */}
      {wisdomReminder && (
        <div
          className={`relative rounded-2xl border p-5 sm:p-6 shadow-lg transition-all ${
            isLight
              ? "bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-yellow-50/50 border-amber-300/90 shadow-amber-950/5"
              : "bg-gradient-to-br from-[#0e1629] via-[#121c33] to-[#0a1020] border-amber-500/40 shadow-black/40"
          }`}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold font-royal text-amber-400">
                    AI Wisdom Guidance • आत्म-प्रेरणा
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono">
                    {wisdomReminder.source}
                  </span>
                </div>
                <p
                  className={`text-xs ${
                    isLight ? "text-stone-600" : "text-amber-300/70"
                  }`}
                >
                  Theme: <strong>{wisdomReminder.virtueTheme}</strong> • Tailored to your streak & spiritual intentions
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={handleToggleRecitation}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isSpeakingWisdom
                    ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse font-bold"
                    : isLight
                    ? "bg-white hover:bg-amber-100/80 border-amber-300 text-amber-900"
                    : "bg-slate-900/80 hover:bg-slate-800 border-amber-500/30 text-amber-300"
                }`}
                title={isSpeakingWisdom ? "Stop Chanting" : "Recite Shloka with Temple Drone"}
              >
                {isSpeakingWisdom ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Recite</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSaveWisdomToVault}
                disabled={isWisdomSaved}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isWisdomSaved
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold"
                    : isLight
                    ? "bg-white hover:bg-amber-100/80 border-amber-300 text-amber-900"
                    : "bg-slate-900/80 hover:bg-slate-800 border-amber-500/30 text-amber-300"
                }`}
                title="Save this wisdom reminder to Sacred Vault"
              >
                {isWisdomSaved ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                    <span>Save</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyWisdom}
                className={`p-1.5 rounded-lg border text-xs transition-all ${
                  isCopiedWisdom
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                    : isLight
                    ? "bg-white hover:bg-amber-100/80 border-amber-300 text-amber-900"
                    : "bg-slate-900/80 hover:bg-slate-800 border-amber-500/30 text-amber-300"
                }`}
                title="Copy Wisdom Reminder"
              >
                {isCopiedWisdom ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-500" />}
              </button>

              <button
                onClick={() => loadWisdomReminder(true)}
                disabled={isLoadingWisdom}
                className={`p-1.5 rounded-lg border text-xs transition-all ${
                  isLoadingWisdom
                    ? "opacity-50 cursor-wait"
                    : isLight
                    ? "bg-white hover:bg-amber-100/80 border-amber-300 text-amber-900"
                    : "bg-slate-900/80 hover:bg-slate-800 border-amber-500/30 text-amber-300"
                }`}
                title="Generate Fresh AI Wisdom Reminder"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isLoadingWisdom ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Shloka Display */}
          <div className="py-4 space-y-2.5">
            <div
              className={`p-4 rounded-xl border text-center ${
                isLight
                  ? "bg-white/80 border-amber-200/90 shadow-sm"
                  : "bg-slate-950/60 border-amber-500/20"
              }`}
            >
              <div className="text-base sm:text-lg font-indic font-bold text-amber-300 tracking-wide">
                {wisdomReminder.shlokaSanskrit}
              </div>
              <div
                className={`text-xs italic font-serif mt-1 ${
                  isLight ? "text-stone-600" : "text-amber-200/60"
                }`}
              >
                {wisdomReminder.shlokaTransliteration}
              </div>
              <div
                className={`text-xs sm:text-sm font-medium mt-2 pt-2 border-t border-amber-500/10 ${
                  isLight ? "text-stone-800" : "text-amber-100"
                }`}
              >
                "{wisdomReminder.shlokaTranslation}"
              </div>
            </div>

            {/* Guidance & Micro Practice Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Guidance & Progress */}
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  isLight
                    ? "bg-amber-500/5 border-amber-200 text-stone-700"
                    : "bg-slate-900/60 border-amber-500/20 text-amber-200/85"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-amber-500">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Personalized Guidance for Your Journey</span>
                </div>
                <p className="leading-relaxed">{wisdomReminder.guidanceText}</p>
                <p
                  className={`text-[11px] font-medium pt-1.5 border-t border-amber-500/10 ${
                    isLight ? "text-amber-900" : "text-amber-300"
                  }`}
                >
                  🌱 <em>{wisdomReminder.progressReflection}</em>
                </p>
              </div>

              {/* Micro Practice & Daily Nudge */}
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  isLight
                    ? "bg-emerald-500/5 border-emerald-200 text-stone-700"
                    : "bg-slate-900/60 border-emerald-500/20 text-emerald-200/90"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mindful Micro-Practice: {wisdomReminder.microPractice.title}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 font-mono">
                    {wisdomReminder.microPractice.duration}
                  </span>
                </div>
                <p className="leading-relaxed">{wisdomReminder.microPractice.instruction}</p>
                <div className="pt-1.5 border-t border-emerald-500/10 text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Nudge: "{wisdomReminder.dailyNudge}"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          {onAskBharatGPT && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleAskAboutWisdom}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  isLight
                    ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                    : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border-amber-500/40"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>Deepen Inquiry with BharatGPT</span>
                <ArrowRight className="w-3 h-3 text-amber-500" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Intention Management & Filter Navigation */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-amber-500/15">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => setActiveFilter("today")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === "today"
                  ? isLight
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                    : "bg-amber-500/30 text-amber-200 border border-amber-400 font-bold"
                  : isLight
                  ? "text-stone-600 hover:bg-stone-200/60"
                  : "text-amber-200/60 hover:text-amber-100 hover:bg-slate-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Today's Intentions ({stats.todayCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === "all"
                  ? isLight
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                    : "bg-amber-500/30 text-amber-200 border border-amber-400 font-bold"
                  : isLight
                  ? "text-stone-600 hover:bg-stone-200/60"
                  : "text-amber-200/60 hover:text-amber-100 hover:bg-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Active ({stats.totalCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter("fulfilled")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === "fulfilled"
                  ? isLight
                    ? "bg-emerald-600 text-white font-bold shadow-sm"
                    : "bg-emerald-500/30 text-emerald-200 border border-emerald-400 font-bold"
                  : isLight
                  ? "text-stone-600 hover:bg-stone-200/60"
                  : "text-amber-200/60 hover:text-amber-100 hover:bg-slate-900"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fulfilled Archive ({stats.fulfilledCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter("presets")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === "presets"
                  ? isLight
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                    : "bg-amber-500/30 text-amber-200 border border-amber-400 font-bold"
                  : isLight
                  ? "text-stone-600 hover:bg-stone-200/60"
                  : "text-amber-200/60 hover:text-amber-100 hover:bg-slate-900"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Vedic Presets ({SANKALPA_PRESETS.length})</span>
            </button>
          </div>

          {/* Quick Voice Inscribe Shortcut */}
          <div className="flex items-center gap-2">
            <AudioTranscribeButton
              language={selectedLanguage}
              size="sm"
              isLight={isLight}
              buttonText="Speak Intention"
              onTranscribe={(transcribedText) => {
                setEditingItemId(null);
                setNewTitle(transcribedText);
                setNewCategory("shanti");
                setNewMantra(SANKALPA_CATEGORIES.shanti.defaultMantra);
                setNewTargetDate(new Date().toISOString().split("T")[0]);
                setIsCreateModalOpen(true);
                toast.show("Intention spoken! Review and save.", "info");
              }}
            />
          </div>
        </div>

        {/* Preset Templates View */}
        {activeFilter === "presets" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SANKALPA_PRESETS.map((preset) => {
              const meta = SANKALPA_CATEGORIES[preset.category];
              return (
                <div
                  key={preset.id}
                  className={`rounded-xl border p-4 flex flex-col justify-between transition-all hover:border-amber-400/80 shadow-sm ${
                    isLight ? "bg-white border-amber-200" : "bg-slate-900/70 border-amber-500/25"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}
                      >
                        <span>{meta.icon}</span>
                        <span>{meta.name}</span>
                      </span>
                      <span className="text-[10px] text-amber-400/70 font-mono">
                        {preset.scriptureReference}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-amber-200 font-sans leading-snug">
                      {preset.title}
                    </h4>

                    <div className="text-xs font-indic text-amber-300/90 font-medium">
                      {preset.indicTitle}
                    </div>

                    <p
                      className={`text-xs italic ${
                        isLight ? "text-stone-600" : "text-amber-200/70"
                      }`}
                    >
                      "{preset.whyItMatters}"
                    </p>

                    <div
                      className={`p-2 rounded-lg text-[11px] font-mono border ${
                        isLight
                          ? "bg-amber-50 border-amber-200 text-stone-700"
                          : "bg-black/40 border-amber-500/20 text-amber-300/80"
                      }`}
                    >
                      ॐ {preset.mantraOrAffirmation}
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-amber-500/10 flex justify-end">
                    <button
                      onClick={() => handleOpenCreateModal(preset)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow transition-all hover:scale-[1.02]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adopt This Sankalpa</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Regular Intentions List */}
        {activeFilter !== "presets" && (
          <>
            {displayedItems.length === 0 ? (
              <div
                className={`rounded-2xl border p-8 sm:p-12 text-center space-y-3 ${
                  isLight
                    ? "bg-white/80 border-amber-200"
                    : "bg-slate-900/40 border-amber-500/20"
                }`}
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                  🕉️
                </div>
                <h3 className="text-base font-bold text-amber-300 font-royal">
                  {activeFilter === "today"
                    ? "No Sankalpa Inscribed for Today"
                    : activeFilter === "fulfilled"
                    ? "No Fulfilled Sankalpas Yet"
                    : "No Intentions Found"}
                </h3>
                <p
                  className={`text-xs max-w-md mx-auto ${
                    isLight ? "text-stone-600" : "text-amber-200/60"
                  }`}
                >
                  {activeFilter === "today"
                    ? "Consecrate today with a conscious spiritual resolve. Speak your intention with your microphone or choose from our sacred templates."
                    : "Set daily goals of kindness, mindfulness, and discipline to cultivate spiritual strength."}
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handleOpenCreateModal()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Set Daily Sankalpa</span>
                  </button>
                  <button
                    onClick={() => setActiveFilter("presets")}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      isLight
                        ? "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300"
                        : "bg-slate-800 hover:bg-slate-700 text-amber-200 border-amber-500/30"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Explore Templates</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedItems.map((item) => {
                  const meta = SANKALPA_CATEGORIES[item.category] || SANKALPA_CATEGORIES.shanti;
                  const isFulfilled = item.status === "fulfilled";

                  return (
                    <div
                      key={item.id}
                      className={`relative rounded-xl border p-4 sm:p-5 flex flex-col justify-between transition-all ${
                        isFulfilled
                          ? isLight
                            ? "bg-emerald-50/70 border-emerald-300/90 shadow-sm"
                            : "bg-[#0b161f] border-emerald-500/40 shadow-sm"
                          : isLight
                          ? "bg-white border-amber-200/90 shadow-sm hover:border-amber-400"
                          : "bg-slate-900/80 border-amber-500/25 hover:border-amber-400/60 shadow-md"
                      }`}
                    >
                      {/* Top Row: Category & Status */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}
                          >
                            <span>{meta.icon}</span>
                            <span>{item.categoryLabel || meta.name}</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            {item.targetDate && (
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                  item.targetDate === todayStr
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30 font-semibold"
                                    : isLight
                                    ? "bg-stone-100 text-stone-600 border-stone-200"
                                    : "bg-black/30 text-amber-200/50 border-amber-500/10"
                                }`}
                              >
                                {item.targetDate === todayStr ? "Today" : item.targetDate}
                              </span>
                            )}

                            <button
                              onClick={() => handleToggleFulfillment(item)}
                              className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                                isFulfilled
                                  ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                                  : isLight
                                  ? "bg-stone-100 hover:bg-emerald-100 border-stone-300 text-stone-700 hover:text-emerald-800 hover:border-emerald-400"
                                  : "bg-slate-950/80 hover:bg-emerald-950/60 border-amber-500/30 text-amber-200/70 hover:text-emerald-300 hover:border-emerald-500/50"
                              }`}
                              title={isFulfilled ? "Mark Incomplete" : "Mark as Fulfilled (पूर्ण)"}
                            >
                              {isFulfilled ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Fulfilled (पूर्ण)</span>
                                </>
                              ) : (
                                <>
                                  <Circle className="w-3 h-3 text-amber-500" />
                                  <span>In Progress</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Intention Title */}
                        <div>
                          <h4
                            className={`text-sm sm:text-base font-bold font-sans leading-snug ${
                              isFulfilled
                                ? isLight
                                  ? "text-emerald-950 line-through opacity-85"
                                  : "text-emerald-200 line-through opacity-85"
                                : isLight
                                ? "text-stone-900"
                                : "text-amber-100"
                            }`}
                          >
                            {item.title}
                          </h4>

                          {item.indicTitle && (
                            <div className="text-xs font-indic font-medium text-amber-400/90 mt-0.5">
                              {item.indicTitle}
                            </div>
                          )}
                        </div>

                        {/* Motivation & Mantra */}
                        {item.whyItMatters && (
                          <p
                            className={`text-xs ${
                              isLight ? "text-stone-600" : "text-amber-200/70"
                            }`}
                          >
                            <span className="font-semibold text-amber-500">Spiritual Purpose:</span>{" "}
                            {item.whyItMatters}
                          </p>
                        )}

                        {item.mantraOrAffirmation && (
                          <div
                            className={`p-2 rounded-lg text-xs font-mono border flex items-center justify-between gap-2 ${
                              isLight
                                ? "bg-amber-50/80 border-amber-200/80 text-amber-950"
                                : "bg-black/30 border-amber-500/15 text-amber-300/80"
                            }`}
                          >
                            <div className="truncate">
                              <span className="text-amber-500 font-bold mr-1">ॐ</span>
                              <span>{item.mantraOrAffirmation}</span>
                            </div>
                            <button
                              onClick={() => {
                                soundscape.speakText(item.mantraOrAffirmation!, "Sanskrit", `mantra-${item.id}`);
                                soundscape.playTempleBell();
                              }}
                              className="p-1 hover:text-amber-200 text-amber-500 transition-colors"
                              title="Listen to Mantra Chant"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Evening Reflection / Journal Notes */}
                        {item.reflectionNotes && (
                          <div
                            className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                              isLight
                                ? "bg-stone-50 border-stone-200 text-stone-700"
                                : "bg-slate-950/70 border-amber-500/20 text-amber-200/90"
                            }`}
                          >
                            <div className="flex items-center gap-1 font-bold text-amber-400 text-[11px]">
                              <span>🪷 Evening Mindful Reflection:</span>
                            </div>
                            <p className="italic leading-relaxed">{item.reflectionNotes}</p>
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-3 mt-3 border-t border-amber-500/10 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenReflectionModal(item)}
                          className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-all ${
                            item.reflectionNotes
                              ? isLight
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : isLight
                              ? "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300"
                              : "bg-slate-800 hover:bg-slate-700 text-amber-200/70 border-amber-500/20"
                          }`}
                        >
                          <Edit3 className="w-3 h-3 text-amber-500" />
                          <span>{item.reflectionNotes ? "Edit Reflection" : "+ Add Reflection"}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className={`p-1.5 rounded-md border text-xs transition-all ${
                              isLight
                                ? "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200"
                                : "bg-slate-850 hover:bg-slate-800 text-amber-200/60 hover:text-amber-100 border-amber-500/15"
                            }`}
                            title="Edit Intention"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="p-1.5 rounded-md border text-xs bg-rose-950/30 hover:bg-rose-900/60 text-rose-300 border-rose-500/20 transition-all"
                            title="Delete Sankalpa"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Intention Creation / Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto ${
              isLight
                ? "bg-[#faf7f2] border-amber-300 text-stone-900"
                : "bg-[#0b101d] border-amber-500/40 text-amber-100"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="text-base sm:text-lg font-royal font-bold text-amber-400">
                  {editingItemId ? "Revise Sankalpa • संकल्प संपादन" : "Inscribe Sacred Sankalpa • नया संकल्प"}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-amber-500/20 text-amber-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              {/* Intention Title with Voice Recording Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-amber-400">
                    Spiritual Intention Statement *
                  </label>
                  <AudioTranscribeButton
                    language={selectedLanguage}
                    size="sm"
                    isLight={isLight}
                    buttonText="Speak with Mic"
                    onTranscribe={(text) => {
                      setNewTitle((prev) => (prev ? `${prev} ${text}` : text));
                    }}
                  />
                </div>
                <textarea
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Today I will maintain inner calm and take 3 deep breaths before responding to tension..."
                  rows={2}
                  className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border transition-all focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isLight
                      ? "bg-white border-amber-300 text-stone-900"
                      : "bg-slate-900/90 border-amber-500/30 text-amber-100"
                  }`}
                  required
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1.5">
                  Vedic Virtue / Domain
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(SANKALPA_CATEGORIES) as SankalpaCategory[]).map((catKey) => {
                    const cat = SANKALPA_CATEGORIES[catKey];
                    const isSelected = newCategory === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => {
                          setNewCategory(catKey);
                          if (!newMantra || newMantra === SANKALPA_CATEGORIES[newCategory].defaultMantra) {
                            setNewMantra(cat.defaultMantra);
                          }
                        }}
                        className={`p-2 rounded-lg border text-left text-xs transition-all ${
                          isSelected
                            ? "bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-sm"
                            : isLight
                            ? "bg-white hover:bg-stone-100 border-stone-200 text-stone-700"
                            : "bg-slate-900/60 hover:bg-slate-800 border-amber-500/20 text-amber-200/60"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{cat.icon}</span>
                          <span className="truncate">{cat.name.split(" ")[0]}</span>
                        </div>
                        <div className="text-[10px] opacity-70 font-indic mt-0.5 truncate">
                          {cat.indicName}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Supporting Sanskrit Mantra */}
              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1">
                  Supporting Sanskrit Mantra / Affirmation
                </label>
                <input
                  type="text"
                  value={newMantra}
                  onChange={(e) => setNewMantra(e.target.value)}
                  placeholder="e.g. ॐ शान्तिः शान्तिः शान्तिः"
                  className={`w-full px-3 py-2 rounded-xl text-xs border font-indic transition-all focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isLight
                      ? "bg-white border-amber-300 text-stone-900"
                      : "bg-slate-900/90 border-amber-500/30 text-amber-100"
                  }`}
                />
              </div>

              {/* Spiritual Motivation */}
              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1">
                  Why this matters to your soul (Motivation)
                </label>
                <input
                  type="text"
                  value={newWhy}
                  onChange={(e) => setNewWhy(e.target.value)}
                  placeholder="e.g. To stay aligned with my higher self and avoid unnecessary reactive stress..."
                  className={`w-full px-3 py-2 rounded-xl text-xs border transition-all focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isLight
                      ? "bg-white border-amber-300 text-stone-900"
                      : "bg-slate-900/90 border-amber-500/30 text-amber-100"
                  }`}
                />
              </div>

              {/* Target Date */}
              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs border transition-all focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isLight
                      ? "bg-white border-amber-300 text-stone-900"
                      : "bg-slate-900/90 border-amber-500/30 text-amber-100"
                  }`}
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-amber-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold ${
                    isLight
                      ? "bg-stone-200 hover:bg-stone-300 text-stone-800 border-stone-300"
                      : "bg-slate-800 hover:bg-slate-700 text-amber-200 border-amber-500/20"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs shadow-md"
                >
                  {editingItemId ? "Save Changes" : "Consecrate Sankalpa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mindful Evening Reflection Modal */}
      {reflectionModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl relative ${
              isLight
                ? "bg-[#faf7f2] border-amber-300 text-stone-900"
                : "bg-[#0b101d] border-amber-500/40 text-amber-100"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-spin-slow" />
                <h3 className="text-base sm:text-lg font-royal font-bold text-amber-400">
                  Mindful Reflection • आत्म-चिंतन
                </h3>
              </div>
              <button
                onClick={() => setReflectionModalItem(null)}
                className="p-1.5 rounded-lg hover:bg-amber-500/20 text-amber-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div
                className={`p-3 rounded-xl border text-xs ${
                  isLight ? "bg-amber-50/70 border-amber-200" : "bg-slate-900/60 border-amber-500/20"
                }`}
              >
                <div className="font-bold text-amber-400 mb-0.5">
                  Intention: {reflectionModalItem.title}
                </div>
                <div className="text-[11px] opacity-75">
                  Category: {reflectionModalItem.categoryLabel}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-amber-400">
                    Your Contemplation & Experience
                  </label>
                  <AudioTranscribeButton
                    language={selectedLanguage}
                    size="sm"
                    isLight={isLight}
                    buttonText="Speak Reflection"
                    onTranscribe={(text) => {
                      setReflectionText((prev) => (prev ? `${prev} ${text}` : text));
                    }}
                  />
                </div>
                <textarea
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Reflect on today's resolve: How did the mind respond? Where did you feel peace or resistance? What did you discover? (You can speak your reflection with the mic button above)..."
                  rows={4}
                  className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border transition-all focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isLight
                      ? "bg-white border-amber-300 text-stone-900"
                      : "bg-slate-900/90 border-amber-500/30 text-amber-100"
                  }`}
                />
              </div>

              <div className="pt-3 border-t border-amber-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReflectionModalItem(null)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold ${
                    isLight
                      ? "bg-stone-200 hover:bg-stone-300 text-stone-800 border-stone-300"
                      : "bg-slate-800 hover:bg-slate-700 text-amber-200 border-amber-500/20"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReflection}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md"
                >
                  Save Reflection & Fulfill (+5 Karma)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
