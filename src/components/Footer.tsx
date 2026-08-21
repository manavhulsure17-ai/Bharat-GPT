import React from "react";
import { Sparkles, Heart, Globe2, BookOpen } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#080c16] border-t border-amber-500/20 text-amber-200/80 py-10 px-4 sm:px-6 mt-16">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Sacred Mantra Banner */}
        <div className="text-center space-y-1.5 py-4 border-y border-amber-500/10 bg-amber-950/10 rounded-2xl">
          <p className="font-indic text-base sm:text-lg text-saffron-gradient font-bold tracking-wide">
            ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय । मृत्योर्मा अमृतं गमय ॥
          </p>
          <p className="text-xs text-amber-400/60 font-serif italic">
            "Lead us from the unreal to the real; from darkness unto light; from mortality unto immortality."
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-amber-300/60">
          <div className="flex items-center gap-2">
            <span className="font-royal text-sm font-bold text-amber-200">BHARAT GPT</span>
            <span>•</span>
            <span className="font-indic">भारतीय ज्ञान एवं विरासत मंच</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Powered by Gemini 3.7 Flash</span>
            <span>•</span>
            <span>12+ Indic Languages</span>
            <span>•</span>
            <span>Vedic & Civilizational Knowledge</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
