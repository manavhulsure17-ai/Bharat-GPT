import React, { useState } from "react";
import {
  Bookmark,
  Trash2,
  Download,
  Sparkles,
  BookOpen,
  MessageSquare,
  Scroll,
  Compass,
  FileText,
  FileType,
  Printer,
  CheckCircle2,
  Landmark
} from "lucide-react";
import { SavedItem } from "../types";
import { soundscape } from "../services/audioSynth";
import { exportVaultToPDF, exportSingleItemToPDF } from "../services/pdfExportService";

interface SavedVaultSectionProps {
  savedItems: SavedItem[];
  onRemoveItem: (id: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const SavedVaultSection: React.FC<SavedVaultSectionProps> = ({
  savedItems,
  onRemoveItem,
  onNavigateToTab,
}) => {
  const [filterType, setFilterType] = useState<string>("all");
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const filtered = savedItems.filter(
    (item) => filterType === "all" || item.type === filterType
  );

  const triggerFeedback = (msg: string) => {
    soundscape.playTempleBell();
    setExportSuccessMsg(msg);
    setTimeout(() => {
      setExportSuccessMsg(null);
    }, 3500);
  };

  const handleExportAllJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedItems, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bharat_gpt_smriti_vault_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerFeedback("Vault exported as JSON successfully!");
  };

  const handleExportPDF = (itemsToExport: SavedItem[], label = "Vault") => {
    if (itemsToExport.length === 0) return;
    exportVaultToPDF(itemsToExport);
    triggerFeedback(`Downloaded ${label} (${itemsToExport.length} items) as PDF!`);
  };

  const handleExportSingleItemPDF = (item: SavedItem) => {
    exportSingleItemToPDF(item);
    triggerFeedback(`Downloaded "${item.title.substring(0, 24)}..." as PDF!`);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "chat":
        return MessageSquare;
      case "shloka":
        return BookOpen;
      case "story":
        return Scroll;
      case "heritage":
        return Compass;
      case "history":
        return Landmark;
      default:
        return FileText;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs text-amber-300">
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span>स्मृति कोष • Saved Wisdom Vault</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-royal font-bold text-saffron-gradient">
          SMRITI KOSH VAULT
        </h2>
        <p className="text-xs sm:text-sm text-amber-200/80">
          Your personal sanctuary of bookmarked dialogues, Sanskrit shlokas, interactive Katha chronicles, and heritage discoveries.
        </p>
      </div>

      {/* Notification Toast for PDF / JSON exports */}
      {exportSuccessMsg && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-lg shadow-emerald-950/40 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{exportSuccessMsg}</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-mono">Ready for offline reading</span>
        </div>
      )}

      {/* Action and Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e1628] border border-amber-500/20 rounded-2xl p-4 shadow-lg">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["all", "chat", "shloka", "story", "heritage", "history"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                filterType === type
                  ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                  : "bg-slate-900/80 text-amber-300/70 hover:text-amber-100 border border-amber-500/20"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Bulk Export Actions (PDF & JSON) */}
        {savedItems.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download PDF Button */}
            <button
              onClick={() => handleExportPDF(filtered, filterType === "all" ? "Entire Vault" : `${filterType} Collection`)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 border border-amber-400/60 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-amber-950/50 transition-all hover:scale-[1.02]"
              title="Download beautifully styled PDF for offline reading"
            >
              <FileType className="w-3.5 h-3.5 text-slate-950" />
              <span>Export PDF ({filtered.length})</span>
            </button>

            {/* JSON Export Button */}
            <button
              onClick={handleExportAllJSON}
              className="flex items-center gap-1.5 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-200 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              title="Download Raw JSON Export"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        )}
      </div>

      {/* Saved Items List */}
      {filtered.length === 0 ? (
        <div className="bg-[#0f172a]/80 border border-amber-500/20 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 text-2xl">
            🪔
          </div>
          <div className="space-y-1">
            <h3 className="font-royal text-lg font-bold text-amber-200">
              No Wisdom Bookmarks Yet
            </h3>
            <p className="text-xs text-amber-300/70 max-w-md mx-auto">
              Save insightful AI conversations, Sanskrit shlokas from the Oracle, or monuments from the Explorer to review anytime and export to PDF.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => onNavigateToTab("chat")}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
            >
              Explore AI Chat
            </button>
            <button
              onClick={() => onNavigateToTab("gita")}
              className="bg-slate-900 border border-amber-500/40 text-amber-200 font-bold px-4 py-2 rounded-xl text-xs"
            >
              Gita Oracle
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const Icon = getIcon(item.type);
            return (
              <div
                key={item.id}
                className="bg-[#0f172a]/90 border border-amber-500/25 hover:border-amber-400/60 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-400">
                    <span className="flex items-center gap-1.5 uppercase font-bold text-[10px] bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                      <Icon className="w-3 h-3" />
                      {item.type}
                    </span>
                    <span className="text-[10px] text-amber-400/50">{item.date}</span>
                  </div>

                  <h4 className="font-royal text-base font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h4>

                  <p className="text-xs text-amber-200/70 line-clamp-3 leading-relaxed">
                    {item.snippet}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-amber-500/15">
                  <span className="text-[11px] text-amber-400/60 font-indic">
                    संरक्षित स्मृति
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Export Single Item to PDF */}
                    <button
                      onClick={() => handleExportSingleItemPDF(item)}
                      className="p-1.5 rounded-lg text-amber-400/80 hover:text-amber-200 hover:bg-amber-950/50 border border-amber-500/20 transition-colors flex items-center gap-1 text-[11px]"
                      title="Download this item as PDF"
                    >
                      <FileType className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    {/* Delete Item Button */}
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                      title="Remove from vault"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
