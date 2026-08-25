import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  BookOpen,
  Scroll,
  Landmark,
  Sparkles,
  ArrowRight,
  Bookmark,
  MessageSquare,
  History,
  Tag,
  Check,
  Compass,
  CornerDownLeft,
  SlidersHorizontal
} from "lucide-react";
import {
  searchBharatKnowledge,
  SearchResultItem,
  SearchDomain,
  getPopularSearchSuggestions
} from "../services/searchService";
import { NavigationTab, SavedItem, AppTheme } from "../types";
import { soundscape } from "../services/audioSynth";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToResult: (result: SearchResultItem) => void;
  onAskBharatGPT: (prompt: string) => void;
  onSaveItem: (item: SavedItem) => void;
  theme?: AppTheme;
}

const RECENT_SEARCHES_KEY = "bharat_gpt_recent_searches_v1";

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateToResult,
  onAskBharatGPT,
  onSaveItem,
  theme = "deep_night",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<SearchDomain>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set());
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const isLight = theme === "temple_ivory";

  // Focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search results calculation
  const results = searchBharatKnowledge(searchQuery, selectedDomain);
  const popularSuggestions = getPopularSearchSuggestions();

  // Reset selected index when query or domain changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, selectedDomain]);

  // Save recent search
  const addRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const next = prev.filter((t) => t !== term);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (err) {
      console.error(err);
    }
  };

  // Keyboard navigation handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (results.length > 0) {
          setSelectedIndex((prev) => (prev + 1) % results.length);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (results.length > 0) {
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        }
      } else if (e.key === "Enter" && results.length > 0 && results[selectedIndex]) {
        e.preventDefault();
        handleSelectResult(results[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current && results.length > 0) {
      const activeEl = resultsContainerRef.current.querySelector(
        `[data-result-index="${selectedIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex, results.length]);

  const handleSelectResult = (item: SearchResultItem) => {
    addRecentSearch(searchQuery || item.title);
    soundscape.playTempleBell();
    onNavigateToResult(item);
    onClose();
  };

  const handleAskAbout = (e: React.MouseEvent, item: SearchResultItem) => {
    e.stopPropagation();
    addRecentSearch(item.title);
    soundscape.playFluteChime();
    const prompt =
      item.targetPayload?.askPrompt ||
      item.keyVerseOrPrompt ||
      `Please explain the historical, spiritual, and philosophical significance of ${item.title}.`;
    onAskBharatGPT(prompt);
    onClose();
  };

  const handleSaveSearchResult = (e: React.MouseEvent, item: SearchResultItem) => {
    e.stopPropagation();
    soundscape.playTempleBell();
    const savedType =
      item.domain === "gita"
        ? "shloka"
        : item.domain === "story"
        ? "story"
        : "heritage";

    const saved: SavedItem = {
      id: `search-saved-${item.id}`,
      type: savedType,
      title: item.title,
      snippet: item.snippet,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      data: item,
    };

    onSaveItem(saved);
    setSavedItemIds((prev) => new Set(prev).add(item.id));
  };

  const domainTabs = [
    { id: "all", label: "All Topics", indic: "समस्त", icon: Sparkles },
    { id: "gita", label: "Gita & Vedic", indic: "गीता व वेद", icon: BookOpen },
    { id: "story", label: "Story Library", indic: "कथा साहित्य", icon: Scroll },
    { id: "history", label: "History & Heritage", indic: "इतिहास व धरोहर", icon: Landmark },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-3 sm:px-4 backdrop-blur-md bg-black/70 animate-in fade-in duration-150">
      {/* Background click dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border transition-all z-10 flex flex-col max-h-[85vh] ${
          isLight
            ? "bg-[#faf7f2] border-amber-300/80 text-stone-900 shadow-amber-950/20"
            : "bg-[#0b101d] border-amber-500/40 text-amber-100 shadow-black/80"
        }`}
      >
        {/* Header Search Input */}
        <div
          className={`p-4 border-b flex items-center gap-3 ${
            isLight ? "bg-amber-100/70 border-amber-200" : "bg-slate-900/90 border-amber-500/20"
          }`}
        >
          <Search className={`w-5 h-5 flex-shrink-0 ${isLight ? "text-amber-700" : "text-amber-400"}`} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across Gita wisdom, 18 chapters, stories, history, monuments, sciences..."
            className={`w-full bg-transparent text-sm sm:text-base placeholder:text-stone-400 dark:placeholder:text-amber-200/40 focus:outline-none font-medium ${
              isLight ? "text-stone-900" : "text-amber-100"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-stone-500 dark:text-amber-400/70"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className={`px-2 py-1 rounded text-xs border font-medium transition-colors ${
              isLight
                ? "bg-stone-200 hover:bg-stone-300 text-stone-700 border-stone-300"
                : "bg-slate-800 hover:bg-slate-700 text-amber-200 border-amber-500/30"
            }`}
          >
            ESC
          </button>
        </div>

        {/* Domain Filter Tabs */}
        <div
          className={`px-4 py-2 border-b flex items-center justify-between overflow-x-auto scrollbar-none gap-2 ${
            isLight ? "bg-amber-50/80 border-amber-200/80" : "bg-[#080d19] border-amber-500/10"
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            {domainTabs.map((tab) => {
              const Icon = tab.icon;
              const isTabActive = selectedDomain === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDomain(tab.id as SearchDomain)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isTabActive
                      ? isLight
                        ? "bg-amber-600 text-white shadow-sm font-semibold"
                        : "bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold shadow-md shadow-amber-950/50"
                      : isLight
                      ? "text-stone-600 hover:text-stone-900 hover:bg-amber-200/50"
                      : "text-amber-200/60 hover:text-amber-100 hover:bg-amber-950/30"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <span className={`text-[11px] font-mono whitespace-nowrap hidden sm:inline ${isLight ? "text-stone-500" : "text-amber-400/60"}`}>
            {searchQuery ? `${results.length} topics found` : "Universal Knowledge Search"}
          </span>
        </div>

        {/* Modal Body & Results */}
        <div ref={resultsContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* If query is empty, show Popular Suggestions and Recent Searches */}
          {!searchQuery && (
            <div className="space-y-5 py-2">
              {/* Recent Searches (if any) */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-stone-600" : "text-amber-300/80"}`}>
                      <History className="w-3.5 h-3.5 text-amber-500" />
                      Recent Searches
                    </span>
                    <button
                      onClick={clearAllRecent}
                      className="text-[11px] text-amber-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          inputRef.current?.focus();
                        }}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          isLight
                            ? "bg-stone-200/80 hover:bg-stone-300/80 text-stone-800 border-amber-200"
                            : "bg-slate-900/80 hover:bg-slate-800 text-amber-200 border-amber-500/30"
                        }`}
                      >
                        <span>{term}</span>
                        <span
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="hover:text-rose-400 p-0.5 rounded-full"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Curated Topics */}
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2.5 ${isLight ? "text-stone-600" : "text-amber-300/80"}`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Popular Indic Topics
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {popularSuggestions.map((sug) => {
                    const iconMap = {
                      gita: BookOpen,
                      story: Scroll,
                      history: Landmark,
                      all: Sparkles,
                    };
                    const Icon = iconMap[sug.domain] || Sparkles;
                    const badgeColor =
                      sug.domain === "gita"
                        ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30"
                        : sug.domain === "story"
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                        : "text-orange-700 dark:text-orange-400 bg-orange-500/10 border-orange-500/30";

                    return (
                      <button
                        key={sug.label}
                        onClick={() => {
                          setSearchQuery(sug.query);
                          inputRef.current?.focus();
                        }}
                        className={`text-left p-2.5 rounded-xl border flex items-center justify-between group transition-all ${
                          isLight
                            ? "bg-white hover:bg-amber-100/60 border-amber-200/80 shadow-sm"
                            : "bg-slate-900/60 hover:bg-slate-900 border-amber-500/20 hover:border-amber-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className={`p-1.5 rounded-lg border flex-shrink-0 ${badgeColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className={`text-xs font-semibold truncate ${isLight ? "text-stone-800" : "text-amber-100"}`}>
                              {sug.label}
                            </p>
                            <span className={`text-[10px] uppercase font-mono ${isLight ? "text-stone-500" : "text-amber-400/60"}`}>
                              {sug.domain === "gita" ? "Gita & Vedic" : sug.domain === "story" ? "Story Katha" : "History & Heritage"}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400 dark:text-amber-400/40 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Prompt Helper */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  isLight
                    ? "bg-amber-100/60 border-amber-200 text-stone-700 text-xs"
                    : "bg-amber-950/20 border-amber-500/20 text-amber-200/70 text-xs"
                }`}
              >
                <CornerDownLeft className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Pro Tip:</strong> Type keywords like{" "}
                  <code className="text-amber-600 dark:text-amber-300 font-mono font-bold">Chapter 2</code>,{" "}
                  <code className="text-amber-600 dark:text-amber-300 font-mono font-bold">Konark</code>,{" "}
                  <code className="text-amber-600 dark:text-amber-300 font-mono font-bold">Arjuna</code>, or{" "}
                  <code className="text-amber-600 dark:text-amber-300 font-mono font-bold">Rigveda</code> to instantly surface verses, story episodes, and monuments.
                </p>
              </div>
            </div>
          )}

          {/* Results List */}
          {searchQuery && results.length > 0 && (
            <div className="space-y-2.5">
              {results.map((result, idx) => {
                const isSelected = idx === selectedIndex;
                const isItemSaved = savedItemIds.has(result.id);

                const iconMap = {
                  gita: BookOpen,
                  story: Scroll,
                  history: Landmark,
                };
                const Icon = iconMap[result.domain] || Sparkles;

                const domainColor =
                  result.domain === "gita"
                    ? "text-amber-600 dark:text-amber-300 bg-amber-500/15 border-amber-500/30"
                    : result.domain === "story"
                    ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/30"
                    : "text-orange-700 dark:text-orange-300 bg-orange-500/15 border-orange-500/30";

                return (
                  <div
                    key={result.id}
                    data-result-index={idx}
                    onClick={() => handleSelectResult(result)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative ${
                      isSelected
                        ? isLight
                          ? "bg-amber-100 border-amber-400 shadow-md ring-2 ring-amber-400/40"
                          : "bg-slate-900 border-amber-400 shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/50"
                        : isLight
                        ? "bg-white hover:bg-amber-50 border-amber-200/80 shadow-sm"
                        : "bg-[#0f1627]/80 hover:bg-[#141d33] border-amber-500/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg border flex-shrink-0 mt-0.5 ${domainColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border font-mono bg-slate-900/10 dark:bg-slate-900/60 border-amber-500/30 text-amber-700 dark:text-amber-300">
                              {result.badge}
                            </span>
                            <span className={`text-[11px] font-medium ${isLight ? "text-stone-500" : "text-amber-300/60"}`}>
                              {result.subCategory}
                            </span>
                          </div>

                          <h4 className={`text-sm sm:text-base font-bold group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors ${
                            isLight ? "text-stone-900" : "text-amber-100"
                          }`}>
                            {result.title}
                          </h4>

                          {result.indicTitle && (
                            <p className={`text-xs font-indic mt-0.5 ${isLight ? "text-amber-800" : "text-amber-300/80"}`}>
                              {result.indicTitle}
                            </p>
                          )}

                          <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                            isLight ? "text-stone-600" : "text-amber-200/70"
                          }`}>
                            {result.snippet}
                          </p>

                          {result.details && (
                            <p className={`text-[11px] mt-1 italic line-clamp-1 ${
                              isLight ? "text-stone-500" : "text-amber-400/60"
                            }`}>
                              {result.details}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons on Result Card */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 flex-shrink-0">
                        {/* Bookmark to Vault */}
                        <button
                          onClick={(e) => handleSaveSearchResult(e, result)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            isItemSaved
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                              : isLight
                              ? "bg-stone-100 hover:bg-stone-200 text-stone-600 border-stone-300"
                              : "bg-slate-800 hover:bg-slate-700 text-amber-300/70 border-amber-500/20"
                          }`}
                          title="Save to Vault"
                        >
                          {isItemSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        </button>

                        {/* Ask Prajna BharatGPT Button */}
                        <button
                          onClick={(e) => handleAskAbout(e, result)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                            isLight
                              ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                              : "bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border-amber-500/40"
                          }`}
                          title="Ask Prajna BharatGPT AI about this topic"
                        >
                          <MessageSquare className="w-3 h-3 text-amber-500" />
                          <span className="hidden sm:inline">Ask AI</span>
                        </button>

                        {/* Open Target Tab Button */}
                        <button
                          onClick={() => handleSelectResult(result)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isLight
                              ? "bg-amber-600 hover:bg-amber-700 text-white"
                              : "bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-slate-950 shadow-sm"
                          }`}
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No results fallback */}
          {searchQuery && results.length === 0 && (
            <div className="text-center py-10 px-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`text-base font-bold ${isLight ? "text-stone-800" : "text-amber-100"}`}>
                  No direct database matches for &ldquo;{searchQuery}&rdquo;
                </h4>
                <p className={`text-xs mt-1 max-w-md mx-auto ${isLight ? "text-stone-600" : "text-amber-300/70"}`}>
                  Prajna BharatGPT can still synthesize deep civilizational insights on this topic using Gemini 3.7 Flash.
                </p>
              </div>

              <button
                onClick={() => {
                  onAskBharatGPT(`Tell me about ${searchQuery} in Indian history, Vedic philosophy, and civilizational wisdom.`);
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-xs shadow-lg shadow-orange-950/40 hover:brightness-110 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask Prajna BharatGPT to research &ldquo;{searchQuery}&rdquo;</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div
          className={`p-3 border-t flex flex-wrap items-center justify-between text-[11px] font-medium gap-2 ${
            isLight ? "bg-amber-100/60 border-amber-200 text-stone-600" : "bg-[#070b14] border-amber-500/20 text-amber-300/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">ESC</kbd>
              Close
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-serif font-bold">ॐ</span>
            <span>Gita Wisdom • Story Library • Historical Database</span>
          </div>
        </div>
      </div>
    </div>
  );
};
