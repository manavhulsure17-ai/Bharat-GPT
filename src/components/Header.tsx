import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Globe,
  BookOpen,
  Compass,
  MessageSquare,
  Scroll,
  Award,
  Languages,
  Bookmark,
  HelpCircle,
  Cpu,
  ShieldCheck,
  LogOut,
  User,
  QrCode,
  Sun,
  Moon,
  Search,
  Flame,
  Trophy,
  Trees,
  Headphones,
  SlidersHorizontal
} from "lucide-react";
import { INDIC_LANGUAGES } from "../data/configData";
import { IndicLanguageCode, NavigationTab, AppUser, AppTheme, UserKarmaProfile } from "../types";
import { soundscape, SoundscapeState } from "../services/audioSynth";
import { karmaService } from "../services/karmaService";
import { QrModal } from "./QrModal";
import { SoundscapeModal } from "./SoundscapeModal";

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedLanguage: IndicLanguageCode;
  setSelectedLanguage: (lang: IndicLanguageCode) => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  onOpenDeployGuide: () => void;
  onOpenSearch?: () => void;
  onOpenKarmaModal?: () => void;
  karmaProfile?: UserKarmaProfile;
  savedCount: number;
  currentUser: AppUser | null;
  onLogout: () => void;
  theme?: AppTheme;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedLanguage,
  setSelectedLanguage,
  isAudioPlaying,
  onToggleAudio,
  onOpenDeployGuide,
  onOpenSearch,
  onOpenKarmaModal,
  karmaProfile,
  savedCount,
  currentUser,
  onLogout,
  theme = "deep_night",
  onToggleTheme,
}) => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSoundscapeModalOpen, setIsSoundscapeModalOpen] = useState(false);
  const [soundscapeState, setSoundscapeState] = useState<SoundscapeState>(() =>
    soundscape.getSoundscapeState()
  );

  useEffect(() => {
    const unsubscribe = soundscape.subscribeSoundscape((state) => {
      setSoundscapeState(state);
    });
    return () => unsubscribe();
  }, []);

  const isLight = theme === "temple_ivory";

  const levelInfo = karmaService.getLevelInfo(karmaProfile?.totalPoints);
  const unlockedBadgesCount = karmaProfile?.badges.filter((b) => b.unlocked).length || 1;

  const isAnyAudioActive = soundscapeState.isTanpuraPlaying || soundscapeState.isNaturePlaying;
  const isBothActive = soundscapeState.isTanpuraPlaying && soundscapeState.isNaturePlaying;
  const isNatureOnly = !soundscapeState.isTanpuraPlaying && soundscapeState.isNaturePlaying;
  const isTanpuraOnly = soundscapeState.isTanpuraPlaying && !soundscapeState.isNaturePlaying;

  const navItems: { id: NavigationTab; label: string; indic: string; icon: any }[] = [
    { id: "chat", label: "Bharat AI Chat", indic: "संवाद", icon: MessageSquare },
    { id: "explorer", label: "Heritage Explorer", indic: "विरासत", icon: Compass },
    { id: "story", label: "Katha Storyteller", indic: "कथा-वाचन", icon: Scroll },
    { id: "gita", label: "Gita & Wisdom", indic: "गीता श्लोक", icon: BookOpen },
    { id: "quiz", label: "Gyan Pariksha", indic: "ज्ञान परीक्षा", icon: Award },
    { id: "translate", label: "Bhasha Sangam", indic: "भाषा संगम", icon: Languages },
    { id: "vault", label: `Vault (${savedCount})`, indic: "स्मृति कोष", icon: Bookmark },
  ];

  // If user is Admin, insert Admin Panel into navigation
  if (currentUser && currentUser.role === "admin") {
    navItems.push({
      id: "admin",
      label: "Admin Panel",
      indic: "प्रशासन",
      icon: ShieldCheck,
    });
  }

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md border-b shadow-xl transition-colors ${
        isLight
          ? "bg-[#faf7f2]/95 border-amber-300/60 text-stone-900"
          : "bg-[#0c111e]/90 border-amber-500/20 text-amber-100"
      }`}
    >
      {/* Top Banner / Sacred Quote Bar */}
      <div
        className={`border-b px-4 py-1 text-xs flex items-center justify-between transition-colors ${
          isLight
            ? "bg-amber-100/90 border-amber-200 text-stone-800"
            : "bg-gradient-to-r from-amber-950/80 via-orange-950/80 to-amber-950/80 border-amber-600/20 text-amber-200/80"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="text-amber-600 dark:text-amber-400 font-serif font-bold">ॐ</span>
          <span className="font-indic tracking-wide font-medium">वसुधैव कुटुम्बकम् • The World is One Family</span>
          <span className="hidden md:inline opacity-40">|</span>
          <span className={`hidden md:inline text-[11px] ${isLight ? "text-stone-600" : "text-amber-300/80"}`}>
            Indic Civilizational AI & Heritage Wisdom
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Karma & Badges Quick Pill */}
          {onOpenKarmaModal && (
            <button
              onClick={onOpenKarmaModal}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded shadow-sm transition-all border font-bold ${
                isLight
                  ? "bg-amber-400/25 hover:bg-amber-400/40 text-amber-950 border-amber-400 shadow-amber-900/10"
                  : "bg-gradient-to-r from-amber-500/30 to-orange-500/30 hover:from-amber-500/40 hover:to-orange-500/40 text-amber-200 border-amber-400/60 shadow-amber-950/60"
              }`}
              title="Open Karma Points & Badges Profile"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span>{karmaProfile ? karmaProfile.totalPoints : 50} Karma</span>
              <span className="opacity-60 hidden sm:inline">•</span>
              <span className="font-indic font-normal text-[10px] hidden sm:inline">
                Lvl {levelInfo.current.level} {levelInfo.current.title}
              </span>
              <span className="flex items-center gap-0.5 text-orange-500 font-bold ml-0.5">
                <Flame className="w-3 h-3 fill-orange-500" />
                <span>{karmaProfile ? karmaProfile.streakDays : 1}d</span>
              </span>
            </button>
          )}

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded shadow-sm transition-all border font-medium ${
                isLight
                  ? "bg-stone-200/90 hover:bg-stone-300/80 text-amber-900 border-amber-300"
                  : "bg-slate-900 hover:bg-slate-800 text-amber-200 border-amber-500/40"
              }`}
              title={isLight ? "Switch to Deep Night Theme" : "Switch to Temple Ivory Light Theme"}
            >
              {isLight ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-700" />
                  <span className="hidden sm:inline">Night Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Temple Ivory</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setIsQrModalOpen(true)}
            className={`flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded shadow-sm transition-colors border ${
              isLight
                ? "bg-amber-500/15 hover:bg-amber-500/25 border-amber-400 text-amber-900"
                : "text-amber-200 hover:text-amber-100 bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/40"
            }`}
            title="Scan QR Code to open on Mobile"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold">Mobile QR</span>
          </button>
          <button
            onClick={onOpenDeployGuide}
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded transition-colors border ${
              isLight
                ? "bg-stone-200/80 hover:bg-stone-300 text-stone-700 border-stone-300"
                : "text-amber-300 hover:text-amber-100 bg-amber-900/40 hover:bg-amber-800/60 border-amber-500/30"
            }`}
            title="View Technical Setup & Deployment Guide"
          >
            <HelpCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="font-medium">Setup Guide</span>
          </button>
          <div
            className={`flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded border ${
              isLight
                ? "text-emerald-800 bg-emerald-100/90 border-emerald-300"
                : "text-emerald-400 bg-emerald-950/50 border-emerald-500/30"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">Gemini 3.7 Flash</span>
          </div>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand Title */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab("chat")}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-0.5 shadow-lg shadow-orange-950/50 flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-serif text-amber-300 group-hover:rotate-12 transition-transform">
                  भ
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-royal text-xl sm:text-2xl font-bold tracking-wider text-saffron-gradient">
                  PRAJNA BHARAT GPT
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
                  Indic AI
                </span>
              </div>
              <p className="text-xs text-amber-300/70 font-indic">
                भारत ज्ञान प्रकाश • Civilizational Intelligence
              </p>
            </div>
          </button>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Search Button */}
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                  isLight
                    ? "bg-amber-100/90 border-amber-300 text-amber-900"
                    : "bg-slate-900/80 border-amber-500/30 text-amber-300 hover:text-amber-100"
                }`}
                title="Search Gita wisdom, stories, history (⌘K)"
              >
                <Search className="w-4 h-4 text-amber-500" />
              </button>
            )}

            {/* Mobile Soundscape Studio Button */}
            <button
              onClick={() => setIsSoundscapeModalOpen(true)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                isBothActive
                  ? "bg-gradient-to-r from-amber-500/30 to-emerald-500/30 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/30"
                  : isNatureOnly
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-sm shadow-emerald-500/30"
                  : isTanpuraOnly
                  ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/30"
                  : "bg-slate-900/60 border-amber-500/30 text-amber-400/80 hover:text-amber-200"
              }`}
              title="Sacred Soundscapes & Zen Nature Audio Studio"
            >
              {isBothActive ? (
                <>
                  <span className="text-xs">🪷</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </>
              ) : isNatureOnly ? (
                <>
                  <Trees className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </>
              ) : isTanpuraOnly ? (
                <>
                  <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                </>
              ) : (
                <Headphones className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Global Search Bar (Desktop & Tablet) */}
        {onOpenSearch && (
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-3">
            <button
              onClick={onOpenSearch}
              className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border text-xs transition-all group shadow-sm ${
                isLight
                  ? "bg-white hover:bg-amber-50 border-amber-300/90 text-stone-600 shadow-amber-950/5 hover:border-amber-400"
                  : "bg-slate-900/85 hover:bg-slate-900 border-amber-500/30 hover:border-amber-400/60 text-amber-200/70 hover:text-amber-100 shadow-black/40"
              }`}
              title="Search Gita wisdom, story library, history database (Press ⌘K or Ctrl+K)"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Search className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate font-medium">Search Gita, stories, history...</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <kbd
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                    isLight
                      ? "bg-amber-100 border-amber-300 text-stone-700"
                      : "bg-black/50 border-amber-500/20 text-amber-300/90"
                  }`}
                >
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>
        )}

        {/* Global Controls: Language, Audio & Karma Profile */}
        <div className="flex items-center gap-2 sm:gap-3 self-end md:self-auto">
          {/* Main Karma Profile Interactive Pill (Desktop / Tablet) */}
          {onOpenKarmaModal && (
            <button
              onClick={onOpenKarmaModal}
              className={`hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm group ${
                isLight
                  ? "bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 hover:from-amber-200 hover:to-orange-100 border-amber-400/80 text-amber-950 shadow-amber-900/10"
                  : "bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 hover:border-amber-400 border-amber-500/40 text-amber-200 shadow-black/60"
              }`}
              title="Click to view Karma level, unlockable badges, and daily darshan bonus"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-sm border border-amber-400/40 group-hover:scale-110 transition-transform">
                {levelInfo.current.icon}
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold text-amber-500">
                    {karmaProfile ? karmaProfile.totalPoints : 50}
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">Karma</span>
                </div>
                <div className="text-[10px] font-medium opacity-75 leading-tight flex items-center gap-1">
                  <span>Lvl {levelInfo.current.level} {levelInfo.current.title}</span>
                  <span>•</span>
                  <span className="text-orange-400 flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5 fill-orange-500" />
                    {karmaProfile?.streakDays || 1}d
                  </span>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-1 pl-1.5 border-l border-amber-500/30 text-[10px] text-amber-400">
                <Trophy className="w-3 h-3 text-amber-500" />
                <span>{unlockedBadgesCount}</span>
              </div>
            </button>
          )}

          {/* Soundscapes Control Hub (Tanpura & Zen Nature) */}
          <div className="hidden sm:flex items-center rounded-xl border p-0.5 transition-all shadow-sm group bg-slate-900/80 border-amber-500/30 hover:border-amber-400/60">
            <button
              onClick={() => setIsSoundscapeModalOpen(true)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isBothActive
                  ? "bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 text-amber-200 border border-amber-400/50"
                  : isNatureOnly
                  ? "bg-emerald-950/60 text-emerald-200 border border-emerald-400/50"
                  : isTanpuraOnly
                  ? "bg-amber-950/60 text-amber-200 border border-amber-400/50"
                  : "text-amber-300/80 hover:text-amber-100"
              }`}
              title="Open Soundscapes & Zen Nature Controls (Volume & Presets)"
            >
              {isBothActive ? (
                <>
                  <span className="text-sm">🪷</span>
                  <span className="font-semibold text-amber-200">
                    Ashram Harmony: <strong className="text-emerald-300">On</strong>
                  </span>
                  <span className="flex gap-0.5 items-end h-3 ml-0.5">
                    <span className="w-0.5 h-3 bg-amber-400 animate-pulse"></span>
                    <span className="w-0.5 h-2 bg-emerald-400 animate-pulse delay-75"></span>
                    <span className="w-0.5 h-3.5 bg-teal-300 animate-pulse delay-150"></span>
                  </span>
                </>
              ) : isNatureOnly ? (
                <>
                  <Trees className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="font-semibold text-emerald-200">
                    Zen Nature: <strong className="text-emerald-300">On</strong>
                  </span>
                  <span className="flex gap-0.5 items-end h-3 ml-0.5">
                    <span className="w-0.5 h-3 bg-emerald-400 animate-pulse"></span>
                    <span className="w-0.5 h-2 bg-teal-300 animate-pulse delay-75"></span>
                  </span>
                </>
              ) : isTanpuraOnly ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span className="font-semibold text-amber-200">
                    Tanpura: <strong className="text-amber-300">On</strong>
                  </span>
                  <span className="flex gap-0.5 items-end h-3 ml-0.5">
                    <span className="w-0.5 h-3 bg-amber-400 animate-pulse"></span>
                    <span className="w-0.5 h-2 bg-amber-300 animate-pulse delay-75"></span>
                  </span>
                </>
              ) : (
                <>
                  <Headphones className="w-3.5 h-3.5 text-amber-400/70" />
                  <span>Soundscapes</span>
                </>
              )}
            </button>

            {/* Quick Toggle / Mixer Settings Icon */}
            <button
              onClick={() => {
                if (isAnyAudioActive) {
                  soundscape.setSoundscapePreset("off");
                } else {
                  soundscape.setSoundscapePreset("both");
                }
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isAnyAudioActive
                  ? "text-rose-300 hover:text-rose-100 hover:bg-rose-950/40"
                  : "text-amber-400/60 hover:text-amber-200 hover:bg-amber-950/40"
              }`}
              title={isAnyAudioActive ? "Mute all ambient soundscapes" : "Quick start Ashram Harmony (Tanpura + Nature)"}
            >
              {isAnyAudioActive ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Indic Language Selector */}
          <div className="relative flex items-center bg-slate-900/80 border border-amber-500/30 hover:border-amber-400/60 rounded-lg px-2.5 py-1 text-xs text-amber-200 shadow-sm transition-colors">
            <Globe className="w-3.5 h-3.5 text-amber-400 mr-2 flex-shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as IndicLanguageCode)}
              className="bg-transparent text-amber-100 focus:outline-none cursor-pointer pr-1 py-0.5 font-medium text-xs"
            >
              {INDIC_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#0e1628] text-amber-100">
                  {lang.native} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          {/* User Account / Profile Badge & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-1 border-l border-amber-500/20">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-amber-200 truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-amber-400/60 uppercase font-mono">
                  {currentUser.role === "admin" ? "Super Admin" : "Explorer"}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-rose-100 text-xs font-medium transition-colors"
                title="Sign out of Prajna BharatGPT"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1.5 scrollbar-none border-t border-amber-500/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? isLight
                      ? "bg-amber-500/25 text-amber-950 border border-amber-400/80 shadow-sm font-bold"
                      : "bg-gradient-to-r from-amber-500/25 to-orange-500/20 text-amber-200 border border-amber-500/50 shadow-sm shadow-amber-950/60 font-semibold"
                    : isLight
                    ? "text-stone-600 hover:text-stone-900 hover:bg-amber-100/50 border border-transparent"
                    : "text-amber-200/60 hover:text-amber-100 hover:bg-amber-950/20 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (isLight ? "text-amber-700" : "text-amber-400") : (isLight ? "text-stone-400" : "text-amber-400/50")}`} />
                <span>{item.label}</span>
                <span className={`text-[10px] hidden lg:inline font-indic ${isActive ? (isLight ? "text-amber-800 font-semibold" : "text-amber-300/80") : (isLight ? "text-stone-400" : "text-amber-400/30")}`}>
                  ({item.indic})
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* QR Code Modal for Mobile Quick Access */}
      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        theme={theme}
      />

      {/* Sacred Soundscape & Zen Nature Studio Modal */}
      <SoundscapeModal
        isOpen={isSoundscapeModalOpen}
        onClose={() => setIsSoundscapeModalOpen(false)}
        isLight={isLight}
      />
    </header>
  );
};
