import React, { useState } from "react";
import {
  Sparkles,
  Flame,
  Award,
  Trophy,
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen,
  Compass,
  Scroll,
  Languages,
  Bookmark,
  Calendar,
  X,
  Zap,
  Info,
  Gift,
} from "lucide-react";
import { UserKarmaProfile, AppTheme, UserBadge } from "../types";
import { karmaService } from "../services/karmaService";
import { KARMA_LEVELS } from "../data/karmaBadgesData";
import { soundscape } from "../services/audioSynth";
import confetti from "canvas-confetti";

interface KarmaBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: UserKarmaProfile;
  theme?: AppTheme;
  onNavigateTab?: (tab: any) => void;
}

export const KarmaBadgeModal: React.FC<KarmaBadgeModalProps> = ({
  isOpen,
  onClose,
  profile: propProfile,
  theme = "deep_night",
  onNavigateTab,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  if (!isOpen) return null;

  const profile = propProfile || karmaService.getProfile();
  const isLight = theme === "temple_ivory";
  const { current: currentLevel, next: nextLevel, progressPercent } = karmaService.getLevelInfo(
    profile.totalPoints
  );

  const today = new Date().toISOString().split("T")[0];
  const canClaimDailyBonus = profile.dailyBonusClaimedDate !== today;

  const unlockedCount = profile.badges.filter((b) => b.unlocked).length;
  const totalBadges = profile.badges.length;

  const handleClaimDaily = () => {
    setIsClaiming(true);
    soundscape.playTempleBell();
    const success = karmaService.claimDailyBonus();
    if (success) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#f59e0b", "#fbbf24", "#d97706", "#ea580c"],
      });
    }
    setTimeout(() => setIsClaiming(false), 500);
  };

  const filteredBadges = profile.badges.filter((b) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unlocked") return b.unlocked;
    if (activeFilter === "locked") return !b.unlocked;
    return b.category === activeFilter;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all transform ${
          isLight
            ? "bg-[#faf7f2] border-amber-300 text-stone-900 shadow-amber-950/20"
            : "bg-[#0b101d] border-amber-500/40 text-amber-100 shadow-black/80"
        }`}
      >
        {/* Modal Top Header with Level & Karma Status */}
        <div
          className={`relative p-5 sm:p-6 border-b overflow-hidden ${
            isLight
              ? "bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 border-amber-300"
              : "bg-gradient-to-r from-amber-950/90 via-slate-900 to-orange-950/90 border-amber-500/30"
          }`}
        >
          {/* Subtle Decorative Background Glyphs */}
          <div className="absolute right-3 top-0 opacity-10 text-8xl font-serif select-none pointer-events-none text-amber-500">
            ॐ
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl border shadow-lg ${
                  isLight
                    ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-amber-300 shadow-amber-600/30"
                    : "bg-gradient-to-br from-amber-500/30 via-orange-600/40 to-amber-400/20 border-amber-400/60 text-amber-200 shadow-amber-950/80"
                }`}
              >
                {currentLevel.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                      isLight
                        ? "bg-amber-500/20 text-amber-900 border-amber-400"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    Level {currentLevel.level} • {currentLevel.title}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-orange-500">
                    <Flame className="w-4 h-4 fill-orange-500 animate-pulse" />
                    <span>{profile.streakDays} Day Streak</span>
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-royal mt-1 text-saffron-gradient">
                  {currentLevel.indicTitle}
                </h2>
                <p
                  className={`text-xs max-w-md mt-0.5 line-clamp-1 sm:line-clamp-none ${
                    isLight ? "text-stone-600" : "text-amber-200/80"
                  }`}
                >
                  {currentLevel.description}
                </p>
              </div>
            </div>

            {/* Close Button & Total Karma Pill */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isLight
                    ? "text-stone-500 hover:text-stone-800 bg-white/80 border-stone-300"
                    : "text-amber-400/70 hover:text-amber-200 bg-slate-900/80 border-amber-500/30"
                }`}
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 shadow-sm ${
                  isLight
                    ? "bg-white border-amber-300 text-amber-950 font-bold"
                    : "bg-black/60 border-amber-400/50 text-amber-200 font-bold"
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
                <span className="text-sm sm:text-base font-extrabold tracking-tight">
                  {profile.totalPoints.toLocaleString()}
                </span>
                <span className="text-[11px] uppercase tracking-wider font-semibold opacity-75">
                  Karma
                </span>
              </div>
            </div>
          </div>

          {/* Level Progress Bar & Daily Darshan Bonus */}
          <div className="mt-4 pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-lg">
              <div className="flex items-center justify-between text-xs mb-1 font-medium">
                <span className={isLight ? "text-stone-700" : "text-amber-200/90"}>
                  {nextLevel
                    ? `Progress to Level ${nextLevel.level} (${nextLevel.title})`
                    : "Max Enlightenment Tier Attained"}
                </span>
                <span className="font-bold text-amber-500">
                  {nextLevel
                    ? `${profile.totalPoints} / ${nextLevel.minPoints} Karma (${progressPercent}%)`
                    : `${profile.totalPoints} Karma`}
                </span>
              </div>
              <div className={`h-2.5 w-full rounded-full overflow-hidden ${isLight ? "bg-stone-300/80" : "bg-slate-800"}`}>
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 transition-all duration-700 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Daily Bonus Button */}
            {canClaimDailyBonus ? (
              <button
                onClick={handleClaimDaily}
                disabled={isClaiming}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-md transition-all transform hover:scale-105 active:scale-95 ${
                  isLight
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600"
                    : "bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-slate-950 border-amber-300 shadow-amber-950/60"
                }`}
              >
                <Gift className="w-4 h-4 animate-bounce" />
                <span>Claim Daily Darshan (+35 Karma)</span>
              </button>
            ) : (
              <div
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border ${
                  isLight
                    ? "bg-emerald-100/90 border-emerald-300 text-emerald-900 font-semibold"
                    : "bg-emerald-950/50 border-emerald-500/40 text-emerald-300 font-medium"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Daily Darshan Claimed for Today</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick Learning Stats Grid */}
          <div>
            <h3
              className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${
                isLight ? "text-stone-700" : "text-amber-300/80"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Learning & Reflection Milestones</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
              <div
                className={`p-3 rounded-xl border ${
                  isLight ? "bg-white border-amber-200/80" : "bg-slate-900/60 border-amber-500/20"
                }`}
              >
                <div className="text-xl sm:text-2xl font-extrabold text-amber-500 font-serif">
                  {profile.stats.gitaVersesRead}
                </div>
                <div className="text-[11px] font-medium mt-0.5 opacity-80">Gita Verses & Guidance</div>
              </div>
              <div
                className={`p-3 rounded-xl border ${
                  isLight ? "bg-white border-amber-200/80" : "bg-slate-900/60 border-amber-500/20"
                }`}
              >
                <div className="text-xl sm:text-2xl font-extrabold text-orange-500 font-serif">
                  {profile.stats.dailyWisdomReadCount}
                </div>
                <div className="text-[11px] font-medium mt-0.5 opacity-80">Daily Wisdom Reads</div>
              </div>
              <div
                className={`p-3 rounded-xl border ${
                  isLight ? "bg-white border-amber-200/80" : "bg-slate-900/60 border-amber-500/20"
                }`}
              >
                <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-serif">
                  {profile.stats.heritageTopicsExplored}
                </div>
                <div className="text-[11px] font-medium mt-0.5 opacity-80">Heritage Topics Explored</div>
              </div>
              <div
                className={`p-3 rounded-xl border ${
                  isLight ? "bg-white border-amber-200/80" : "bg-slate-900/60 border-amber-500/20"
                }`}
              >
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-serif">
                  {unlockedCount} / {totalBadges}
                </div>
                <div className="text-[11px] font-medium mt-0.5 opacity-80">Badges Unlocked</div>
              </div>
            </div>
          </div>

          {/* Badges Section with Category Filters */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm sm:text-base font-royal">
                  Sacred Badges of Honor (उपाधि कोष)
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {unlockedCount} / {totalBadges} Unlocked
                </span>
              </div>

              {/* Badges Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                {[
                  { id: "all", label: "All" },
                  { id: "unlocked", label: "Unlocked" },
                  { id: "gita", label: "Gita" },
                  { id: "wisdom", label: "Wisdom" },
                  { id: "heritage", label: "Heritage" },
                  { id: "mastery", label: "Mastery" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      activeFilter === f.id
                        ? isLight
                          ? "bg-amber-500 text-white font-bold"
                          : "bg-amber-500/30 text-amber-200 border border-amber-400/50 font-bold"
                        : isLight
                        ? "text-stone-600 hover:bg-amber-100"
                        : "text-amber-200/60 hover:text-amber-100 hover:bg-slate-900"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredBadges.map((badge) => {
                const isUnlocked = badge.unlocked;
                return (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer group flex items-start gap-3 ${
                      isUnlocked
                        ? isLight
                          ? "bg-white border-amber-300 hover:border-amber-500 shadow-sm hover:shadow-md"
                          : "bg-gradient-to-br from-slate-900/90 to-[#0e1628] border-amber-500/40 hover:border-amber-400 shadow-md shadow-amber-950/30"
                        : isLight
                        ? "bg-stone-100/70 border-stone-300/80 opacity-70 hover:opacity-90"
                        : "bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-85"
                    }`}
                  >
                    {/* Badge Icon */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border shadow-sm ${
                        isUnlocked
                          ? isLight
                            ? "bg-amber-100 border-amber-300 text-amber-900 group-hover:scale-105 transition-transform"
                            : "bg-amber-500/20 border-amber-400/50 text-amber-200 group-hover:scale-105 transition-transform"
                          : isLight
                          ? "bg-stone-200 border-stone-300 grayscale"
                          : "bg-slate-900 border-slate-700 grayscale"
                      }`}
                    >
                      {badge.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`font-bold text-xs sm:text-sm truncate ${
                            isUnlocked
                              ? isLight
                                ? "text-stone-900"
                                : "text-amber-200"
                              : "text-stone-500"
                          }`}
                        >
                          {badge.name}
                        </h4>
                        {isUnlocked ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                            ✓ Unlocked
                          </span>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] font-indic text-amber-500 truncate">
                        {badge.indicName}
                      </p>
                      <p
                        className={`text-[11px] mt-1 line-clamp-2 leading-tight ${
                          isLight ? "text-stone-600" : "text-amber-100/70"
                        }`}
                      >
                        {badge.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Badge Details Modal / Card */}
          {selectedBadge && (
            <div
              className={`p-4 rounded-xl border ${
                isLight
                  ? "bg-amber-50/90 border-amber-300 text-stone-900"
                  : "bg-gradient-to-r from-amber-950/60 to-slate-900/90 border-amber-400/50 text-amber-100"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedBadge.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base font-royal text-saffron-gradient">
                        {selectedBadge.name} ({selectedBadge.indicName})
                      </h4>
                      {selectedBadge.rarity && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {selectedBadge.rarity}
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-90 mt-0.5">{selectedBadge.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="text-xs px-2 py-1 rounded border opacity-75 hover:opacity-100"
                >
                  Close
                </button>
              </div>
              <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                <div>
                  <strong className="text-amber-500">Requirement: </strong>
                  <span>{selectedBadge.criteria}</span>
                </div>
                {selectedBadge.unlocked && selectedBadge.unlockedAt && (
                  <div className="text-emerald-500 font-medium">
                    Unlocked on: {selectedBadge.unlockedAt}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Karma Activity History Ledger */}
          <div>
            <h3
              className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${
                isLight ? "text-stone-700" : "text-amber-300/80"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Recent Dharmic Karma Ledger</span>
            </h3>
            <div
              className={`rounded-xl border divide-y max-h-48 overflow-y-auto ${
                isLight
                  ? "bg-white border-amber-200/80 divide-amber-100"
                  : "bg-slate-900/60 border-amber-500/20 divide-slate-800"
              }`}
            >
              {profile.history.length === 0 ? (
                <div className="p-4 text-center text-xs opacity-60">
                  No karma points logged yet. Explore Gita or History to begin!
                </div>
              ) : (
                profile.history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 flex items-center justify-between text-xs gap-2 hover:bg-amber-500/5 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      <span className="font-medium truncate">{item.activity}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="opacity-50 text-[10px]">{item.timestamp}</span>
                      <span className="font-bold text-amber-500 font-mono">
                        +{item.points} Karma
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div
          className={`p-3.5 sm:p-4 border-t flex flex-wrap items-center justify-between gap-2 ${
            isLight
              ? "bg-amber-50/80 border-amber-200"
              : "bg-slate-950 border-amber-500/20"
          }`}
        >
          <div className="flex items-center gap-2 text-xs opacity-80">
            <Info className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Earn Karma by exploring Gita verses, reading daily wisdom, completing stories, and taking quizzes.
            </span>
          </div>

          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
              isLight
                ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600"
                : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/50"
            }`}
          >
            Continue Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
