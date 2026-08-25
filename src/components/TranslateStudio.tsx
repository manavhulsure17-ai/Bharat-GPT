import React, { useState } from "react";
import {
  Languages,
  ArrowRightLeft,
  Sparkles,
  Volume2,
  Copy,
  Check,
  BookMarked,
  Layers,
  HelpCircle
} from "lucide-react";
import { INDIC_LANGUAGES } from "../data/configData";
import { IndicLanguageCode } from "../types";
import { translateIndicText } from "../services/geminiService";
import { soundscape } from "../services/audioSynth";
import { TranslationSkeleton } from "./SkeletonLoader";
import { toast } from "../services/toastService";

export const TranslateStudio: React.FC = () => {
  const [sourceLanguage, setSourceLanguage] = useState<IndicLanguageCode>("English");
  const [targetLanguage, setTargetLanguage] = useState<IndicLanguageCode>("Hindi");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [translatedResult, setTranslatedResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const samplePhrases = [
    "Truth alone triumphs, not falsehood.",
    "The guest is equivalent to the divine.",
    "Yoga is the stilling of the fluctuations of the mind.",
    "One who protects Dharma is protected by Dharma.",
    "Knowledge bestows humility and true character.",
  ];

  const handleTranslate = async (textToUse?: string) => {
    const text = (textToUse || inputText).trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    soundscape.playTempleBell();

    try {
      const data = await translateIndicText(text, targetLanguage, sourceLanguage);
      setTranslatedResult(data);
      toast.success("Translation completed!", { title: "Bhasha Sangam" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to translate text. Please check connection.", { title: "Translation Error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    toast.language(`Swapped languages: ${targetLanguage} ⇄ ${temp}`);
  };

  const handleSpeak = (text: string) => {
    soundscape.speakText(text, targetLanguage);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Translation copied to clipboard!", { title: "Copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs text-amber-300">
          <Languages className="w-3.5 h-3.5 text-amber-400" />
          <span>भाषा संगम • Indic Cultural Translation & Etymology</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-royal font-bold text-saffron-gradient">
          BHASHA SANGAM STUDIO
        </h2>
        <p className="text-xs sm:text-sm text-amber-200/80">
          Translating beyond literal words — preserving sacred idioms, philosophical nuances, and classical Sanskrit roots across 12+ Indic languages.
        </p>
      </div>

      {/* Main Studio Card */}
      <div className="bg-[#0f172a]/95 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Language Selection Ribbon */}
        <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-amber-500/20 rounded-2xl p-3">
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-amber-400/70 block mb-1">
              Source Language
            </label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value as IndicLanguageCode)}
              className="w-full bg-slate-800 border border-amber-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none cursor-pointer"
            >
              {INDIC_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.label})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwapLanguages}
            className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 hover:text-amber-100 transition-colors self-end mb-0.5"
            title="Swap Languages"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-amber-400/70 block mb-1">
              Target Indic Language
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as IndicLanguageCode)}
              className="w-full bg-slate-800 border border-amber-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none cursor-pointer"
            >
              {INDIC_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.label})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            placeholder={`Enter sentence or phrase to translate to ${targetLanguage} with cultural depth...`}
            className="w-full bg-slate-900/90 border border-amber-500/30 focus:border-amber-400 rounded-2xl p-4 text-xs sm:text-sm text-amber-100 placeholder:text-amber-400/40 focus:outline-none resize-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Sample Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] text-amber-400/60 font-medium whitespace-nowrap">
                Try:
              </span>
              {samplePhrases.slice(0, 3).map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputText(p);
                    handleTranslate(p);
                  }}
                  className="bg-slate-900 border border-amber-500/20 hover:border-amber-500/50 text-amber-300/80 hover:text-amber-100 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleTranslate()}
              disabled={!inputText.trim() || isLoading}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-950/60 transition-all ml-auto hover:scale-[1.02] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? "Analyzing Etymology..." : "Translate with Nuance"}</span>
            </button>
          </div>
        </div>

        {/* Translation Loading Skeleton */}
        {isLoading && <TranslationSkeleton />}

        {/* Translation Results Display */}
        {!isLoading && translatedResult && (
          <div className="bg-gradient-to-b from-[#12192c] to-[#0a0f1d] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
            {/* Translated Output Script */}
            <div className="space-y-3 pb-5 border-b border-amber-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                  {targetLanguage} Cultural Rendering
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeak(translatedResult.translatedText)}
                    className="p-1.5 rounded-lg bg-slate-900 text-amber-200 border border-amber-500/30 hover:bg-amber-950/50 text-xs flex items-center gap-1 transition-colors"
                    title="Pronounce aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                  <button
                    onClick={() => handleCopy(translatedResult.translatedText)}
                    className="p-1.5 rounded-lg bg-slate-900 text-amber-200 border border-amber-500/30 hover:bg-amber-950/50 text-xs flex items-center gap-1 transition-colors"
                    title="Copy translation"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <p className="font-indic text-xl sm:text-2xl text-saffron-gradient font-bold leading-relaxed">
                {translatedResult.translatedText}
              </p>

              {translatedResult.transliteration && (
                <p className="text-xs sm:text-sm text-amber-300/80 font-serif italic">
                  Pronunciation: {translatedResult.transliteration}
                </p>
              )}
            </div>

            {/* Cultural Nuance Notes */}
            {translatedResult.culturalNotes && (
              <div className="bg-amber-950/30 border-l-4 border-amber-500 rounded-r-2xl p-4 text-xs sm:text-sm text-amber-100 leading-relaxed space-y-1">
                <strong className="text-amber-300 uppercase tracking-wide text-xs block font-bold">
                  Cultural & Philosophical Notes:
                </strong>
                <p>{translatedResult.culturalNotes}</p>
              </div>
            )}

            {/* Key Sanskrit Root Words & Dhatu Table */}
            {translatedResult.keyTerms && translatedResult.keyTerms.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                  <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                  Key Indic Root Words & Dhatu (धातु एवं व्युत्पत्ति)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {translatedResult.keyTerms.map((t: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 font-indic">{t.term}</span>
                        {t.sanskritRoot && (
                          <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                            Root: {t.sanskritRoot}
                          </span>
                        )}
                      </div>
                      <p className="text-amber-200/80 text-[11px] leading-relaxed">{t.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
