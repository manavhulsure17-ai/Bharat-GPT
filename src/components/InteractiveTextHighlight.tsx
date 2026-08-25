import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Copy, Check, Share2, Volume2, BookOpen } from "lucide-react";
import { soundscape } from "../services/audioSynth";
import { toast } from "../services/toastService";

interface SelectionPosition {
  top: number;
  left: number;
  width: number;
}

interface InteractiveTextHighlightProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  sectionName?: "Gita Wisdom" | "Katha Storyteller" | "Vedic";
}

export const InteractiveTextHighlight: React.FC<InteractiveTextHighlightProps> = ({
  sectionName = "Gita Wisdom",
}) => {
  const [selectedText, setSelectedText] = useState<string>("");
  const [tooltipPos, setTooltipPos] = useState<SelectionPosition | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setSelectedText("");
      setTooltipPos(null);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 2) {
      setSelectedText("");
      setTooltipPos(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      setSelectedText("");
      setTooltipPos(null);
      return;
    }

    setSelectedText(text);
    setTooltipPos({
      top: rect.top + window.scrollY - 44, // Position right above selection
      left: rect.left + window.scrollX + rect.width / 2, // Centered horizontally
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedText) return;
    navigator.clipboard.writeText(selectedText);
    setCopied(true);
    toast.success(`Copied passage from ${sectionName}!`, {
      title: "Sacred Passage Copied",
      icon: "✨",
    });
    setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  const handleRecite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedText) return;
    soundscape.playTempleBell();
    soundscape.speakText(
      selectedText,
      "Sanskrit",
      "selected-passage-" + Date.now(),
      undefined,
      undefined
    );
    toast.audio("Reciting selected verse/passage", {
      title: "Audio Recitation",
      icon: "🕉️",
    });
  };

  if (!tooltipPos || !selectedText) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: `${tooltipPos.top}px`,
        left: `${tooltipPos.left}px`,
        transform: "translateX(-50%)",
      }}
      className="z-50 pointer-events-auto animate-slideUpFade"
    >
      <div className="flex items-center gap-1 bg-[#141b2d]/95 text-amber-100 text-xs px-2.5 py-1.5 rounded-xl border border-amber-400/70 shadow-xl shadow-amber-950/50 backdrop-blur-md">
        {/* Glow Sparkle */}
        <div className="flex items-center gap-1 pr-1.5 border-r border-amber-500/30 text-amber-300 font-semibold text-[11px]">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Golden Verse</span>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-200 hover:text-amber-100 transition-colors flex items-center gap-1"
          title="Copy selected wisdom"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span className="text-[10px] sm:inline hidden">{copied ? "Copied" : "Copy"}</span>
        </button>

        {/* Recite Audio Button */}
        <button
          onClick={handleRecite}
          className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-200 hover:text-amber-100 transition-colors flex items-center gap-1"
          title="Pronounce / Recite aloud"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] sm:inline hidden">Recite</span>
        </button>
      </div>

      {/* Downward pointing triangle */}
      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-amber-400/80 mx-auto" />
    </div>
  );
};
