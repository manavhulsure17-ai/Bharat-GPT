import React, { useState, useEffect } from "react";
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  BookOpen,
  Volume2,
  Sparkles,
} from "lucide-react";
import { SankalpaItem, NavigationTab, IndicLanguageCode, AppTheme } from "../types";
import { sankalpaService, SankalpaProgressStats } from "../services/sankalpaService";
import { SANKALPA_CATEGORIES } from "../data/sankalpaPresetsData";
import { soundscape } from "../services/audioSynth";
import { AudioTranscribeButton } from "./AudioTranscribeButton";
import { toast } from "../services/toastService";

interface SankalpaDashboardWidgetProps {
  onNavigateToSankalpa: () => void;
  selectedLanguage: IndicLanguageCode;
  theme?: AppTheme;
}

export const SankalpaDashboardWidget: React.FC<SankalpaDashboardWidgetProps> = ({
  onNavigateToSankalpa,
  selectedLanguage,
  theme = "deep_night",
}) => {
  const isLight = theme === "temple_ivory";
  const [items, setItems] = useState<SankalpaItem[]>([]);
  const [stats, setStats] = useState<SankalpaProgressStats>(() => sankalpaService.getStats());

  useEffect(() => {
    const unsub = sankalpaService.subscribe((updatedItems) => {
      setItems(updatedItems);
      setStats(sankalpaService.getStats());
    });
    return () => unsub();
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayItems = items.filter((i) => i.targetDate === todayStr);
  const primaryItem = todayItems[0] || null;
  const isFulfilled = primaryItem?.status === "fulfilled";

  const handleToggleFulfill = (item: SankalpaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.status === "fulfilled") {
      sankalpaService.updateFulfillment(item.id, "in_progress");
    } else {
      sankalpaService.updateFulfillment(item.id, "fulfilled");
    }
  };

  const categoryMeta = primaryItem
    ? SANKALPA_CATEGORIES[primaryItem.category] || SANKALPA_CATEGORIES.shanti
    : SANKALPA_CATEGORIES.shanti;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 mb-4">
      <div
        className={`relative overflow-hidden rounded-xl border p-4 sm:p-5 transition-all shadow-md ${
          isLight
            ? "bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-yellow-50/80 border-amber-300/80 shadow-amber-900/5"
            : "bg-gradient-to-r from-[#0d1424] via-[#101a30] to-[#0a1020] border-amber-500/30 shadow-black/40"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
          {/* Left: Title & Concept */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/30 border border-amber-500/30 text-amber-500 flex-shrink-0 mt-0.5">
              <Flame className="w-5 h-5 fill-amber-500 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/40">
                  Daily Sankalpa
                </span>
                <span className="text-xs font-indic text-amber-400 font-medium">
                  दैनिक संकल्प • Sacred Intention
                </span>
                <span className="text-[11px] font-mono font-bold text-orange-500 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-orange-500" />
                  {stats.streakDays}d Streak
                </span>
              </div>

              {primaryItem ? (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-amber-100 font-sans">
                      "{primaryItem.title}"
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${categoryMeta.badgeBg} ${categoryMeta.badgeBorder} ${categoryMeta.badgeText}`}
                    >
                      {categoryMeta.icon} {primaryItem.categoryLabel || categoryMeta.name}
                    </span>
                  </div>

                  {primaryItem.mantraOrAffirmation && (
                    <div className="text-[11px] font-indic text-amber-300/80 flex items-center gap-1.5 mt-0.5">
                      <span>ॐ {primaryItem.mantraOrAffirmation}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p
                  className={`text-xs ${
                    isLight ? "text-stone-600" : "text-amber-200/70"
                  }`}
                >
                  No intention consecrated for today yet. Anchor your mind with a mindful resolve to guide your day.
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
            {primaryItem ? (
              <>
                <button
                  onClick={(e) => handleToggleFulfill(primaryItem, e)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    isFulfilled
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                      : isLight
                      ? "bg-white hover:bg-emerald-50 border-stone-300 hover:border-emerald-400 text-stone-700 hover:text-emerald-800"
                      : "bg-slate-900 hover:bg-emerald-950/50 border-amber-500/30 text-amber-200 hover:text-emerald-300 hover:border-emerald-400"
                  }`}
                >
                  {isFulfilled ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Fulfilled (पूर्ण)</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Mark Fulfilled</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onNavigateToSankalpa}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-all hover:scale-[1.02]"
                >
                  <span>Open Journal</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </>
            ) : (
              <>
                <AudioTranscribeButton
                  language={selectedLanguage}
                  size="sm"
                  isLight={isLight}
                  buttonText="Speak Intention"
                  onTranscribe={(text) => {
                    sankalpaService.saveSankalpa({
                      title: text,
                      category: "shanti",
                      targetDate: todayStr,
                    });
                    toast.show("🕉️ Sankalpa transcribed & consecrated for today!", "success", { duration: 4000 });
                  }}
                />

                <button
                  onClick={onNavigateToSankalpa}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Set Intention</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
