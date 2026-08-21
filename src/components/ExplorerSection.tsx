import React, { useState } from "react";
import {
  Compass,
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Bookmark,
  Check,
  Building2,
  Atom,
  BookOpen,
  Music,
  Landmark,
  Crown,
  X
} from "lucide-react";
import { HERITAGE_ITEMS } from "../data/heritageData";
import { HeritageCategory, HeritageItem, SavedItem } from "../types";
import { soundscape } from "../services/audioSynth";
import { ExplorerGridSkeleton } from "./SkeletonLoader";

interface ExplorerSectionProps {
  onAskBharatGPT: (prompt: string) => void;
  onSaveItem: (item: SavedItem) => void;
}

export const ExplorerSection: React.FC<ExplorerSectionProps> = ({
  onAskBharatGPT,
  onSaveItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<HeritageCategory>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalItem, setActiveModalItem] = useState<HeritageItem | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const categories = [
    { id: "all", label: "All Heritage", indic: "समस्त", icon: Compass },
    { id: "architecture", label: "Monuments & Temples", indic: "स्थापत्य", icon: Building2 },
    { id: "sciences", label: "Ancient Sciences & Tech", indic: "प्राचीन विज्ञान", icon: Atom },
    { id: "philosophy", label: "Philosophy & Texts", indic: "दर्शन व ग्रन्थ", icon: BookOpen },
    { id: "arts", label: "Classical Arts & Dance", indic: "कला व संगीत", icon: Music },
    { id: "geography", label: "Sacred Geography", indic: "तीर्थ व भूगोल", icon: Landmark },
    { id: "dynasties", label: "Dynasties & Legends", indic: "साम्राज्य व वीर", icon: Crown },
  ];

  const regions = ["All", "North", "South", "East", "West", "Central", "Northeast", "Pan-India"];

  const filteredItems = HERITAGE_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesRegion = selectedRegion === "All" || item.region === selectedRegion;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.indicTitle.includes(searchQuery) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesRegion && matchesSearch;
  });

  const handleSaveHeritage = (item: HeritageItem) => {
    onSaveItem({
      id: "heritage-save-" + item.id,
      type: "heritage",
      title: item.title,
      snippet: item.summary,
      date: new Date().toLocaleDateString(),
      data: item,
    });
    setSavedIds((prev) => new Set(prev).add(item.id));
    soundscape.playTempleBell();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title & Introduction */}
      <div className="text-center space-y-2 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs text-amber-300">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>विरासत अन्वेषण • Discovery of Indian Civilizational Wonders</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-royal font-bold text-saffron-gradient">
          HERITAGE EXPLORER
        </h2>
        <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed">
          Journey through 5,000 years of astronomical observatories, monolithic temples, metallurgical breakthroughs, and living sacred traditions.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-[#0e1628]/90 border border-amber-500/25 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-amber-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search monuments, ancient sciences, dynasties, or cities (e.g. 'Konark', 'Sushruta', 'Chola', 'Nalanda')..."
            className="w-full bg-slate-900/90 border border-amber-500/30 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-amber-100 placeholder:text-amber-400/40 focus:outline-none"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as HeritageCategory)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/60"
                    : "bg-slate-900/80 text-amber-200/70 hover:text-amber-100 hover:bg-slate-800 border border-amber-500/20"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Region Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1 border-t border-amber-500/10">
          <span className="text-amber-400/60 text-[11px] mr-1 font-medium whitespace-nowrap">
            Region:
          </span>
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] transition-colors whitespace-nowrap ${
                selectedRegion === reg
                  ? "bg-amber-900/60 text-amber-200 border border-amber-400/60 font-semibold"
                  : "text-amber-400/60 hover:text-amber-300"
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Heritage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isSaved = savedIds.has(item.id);
          return (
            <div
              key={item.id}
              className="bg-[#0f172a]/95 border border-amber-500/25 hover:border-amber-400/60 rounded-2xl overflow-hidden shadow-xl hover:shadow-amber-950/50 transition-all duration-300 flex flex-col group"
            >
              {/* Card Image */}
              <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-950">
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {item.unescoStatus && (
                    <span className="bg-blue-900/80 border border-blue-400/50 text-blue-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md shadow backdrop-blur-md">
                      UNESCO World Heritage
                    </span>
                  )}
                  <span className="bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-md">
                    {item.region}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveHeritage(item);
                  }}
                  className={`absolute top-3 right-3 p-1.5 rounded-lg border backdrop-blur-md transition-colors ${
                    isSaved
                      ? "bg-amber-500 text-slate-950 border-amber-400"
                      : "bg-slate-900/80 text-amber-300 border-amber-500/40 hover:bg-amber-900/60"
                  }`}
                  title="Save item"
                >
                  <Bookmark className="w-3.5 h-3.5" fill={isSaved ? "currentColor" : "none"} />
                </button>

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-xs font-indic text-amber-400/90 font-semibold block">
                    {item.indicTitle}
                  </span>
                  <h3 className="font-royal text-base sm:text-lg font-bold text-amber-100 leading-tight">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-[11px] text-amber-300/70">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" /> {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" /> {item.century}
                    </span>
                  </div>

                  <p className="text-xs text-amber-200/80 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-amber-500/15 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveModalItem(item)}
                    className="text-xs text-amber-300 hover:text-amber-100 font-semibold flex items-center gap-1 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors flex-1 justify-center"
                  >
                    <span>Inspect Deep Dive</span>
                  </button>

                  <button
                    onClick={() => onAskBharatGPT(item.suggestedPrompt)}
                    className="text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-md shadow-amber-950/60"
                    title="Ask Bharat GPT"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Inquire</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Dive Inspection Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0d1424] border border-amber-500/40 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300 hover:text-amber-100 hover:bg-amber-900/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Hero Image */}
            <div className="relative h-64 sm:h-72 w-full bg-slate-950">
              <img
                src={activeModalItem.image}
                alt={activeModalItem.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1424] via-[#0d1424]/40 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-sm font-indic text-amber-400 font-semibold block">
                  {activeModalItem.indicTitle}
                </span>
                <h2 className="font-royal text-xl sm:text-3xl font-bold text-amber-100">
                  {activeModalItem.title}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-amber-950/80 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 rounded-full">
                    {activeModalItem.era} • {activeModalItem.century}
                  </span>
                  <span className="text-xs bg-slate-900/80 border border-amber-500/30 text-amber-200 px-2.5 py-0.5 rounded-full">
                    📍 {activeModalItem.location} ({activeModalItem.region})
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body Details */}
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4">
                <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 mb-1">
                  Historical Overview
                </h4>
                <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                  {activeModalItem.summary}
                </p>
              </div>

              {/* Key Insights */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Engineering Marvels & Critical Insights
                </h4>
                <div className="space-y-2">
                  {activeModalItem.keyInsights.map((insight, i) => (
                    <div
                      key={i}
                      className="bg-slate-900/60 border border-amber-500/15 rounded-xl p-3 text-xs sm:text-sm text-amber-200/90 leading-relaxed flex gap-2.5"
                    >
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architectural & Spiritual Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeModalItem.architecturalStyle && (
                  <div className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-3.5">
                    <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                      Architectural Style
                    </h5>
                    <p className="text-xs text-amber-200/80">
                      {activeModalItem.architecturalStyle}
                    </p>
                  </div>
                )}

                {activeModalItem.scientificValue && (
                  <div className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-3.5">
                    <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                      Scientific & Mathematical Value
                    </h5>
                    <p className="text-xs text-amber-200/80">
                      {activeModalItem.scientificValue}
                    </p>
                  </div>
                )}
              </div>

              {activeModalItem.spiritualSignificance && (
                <div className="bg-orange-950/20 border border-orange-500/20 rounded-xl p-3.5">
                  <h5 className="text-xs font-bold text-orange-300 uppercase tracking-wider mb-1">
                    Spiritual & Cultural Meaning
                  </h5>
                  <p className="text-xs text-amber-200/80">
                    {activeModalItem.spiritualSignificance}
                  </p>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-amber-500/20">
                <button
                  onClick={() => handleSaveHeritage(activeModalItem)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/40 text-amber-200 bg-slate-900 hover:bg-amber-950/40 text-xs font-semibold transition-colors"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Save to Smriti Kosh Vault</span>
                </button>

                <button
                  onClick={() => {
                    const prompt = activeModalItem.suggestedPrompt;
                    setActiveModalItem(null);
                    onAskBharatGPT(prompt);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-950/60 transition-all hover:scale-[1.02]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Ask Bharat GPT about this site</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
