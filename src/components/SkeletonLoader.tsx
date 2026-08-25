import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", ...props }) => {
  return (
    <div
      className={`bg-amber-500/10 border border-amber-500/10 rounded-xl shimmer-mask ${className}`}
      {...props}
    />
  );
};

// Skeleton for Chat Messages / AI Responses
export const ChatResponseSkeleton: React.FC<{
  mode?: string;
  personaName?: string;
  personaAvatar?: string;
}> = ({ mode = "balanced", personaName = "Prajna BharatGPT Scholar", personaAvatar = "🕉️" }) => {
  return (
    <div className="flex gap-3 items-start animate-fadeIn w-full">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm flex-shrink-0">
        {personaAvatar}
      </div>

      {/* Main Response Box Skeleton */}
      <div className="flex-1 bg-slate-900/90 border border-amber-500/30 rounded-2xl rounded-tl-none p-4 sm:p-5 space-y-4 shadow-xl">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-amber-500/15">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-200">{personaName}</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
              Synthesizing Wisdom...
            </span>
          </div>
          <Skeleton className="w-16 h-5 rounded-full" />
        </div>

        {/* Shimmering Thought Stream / Thinking Banner (if in thinking or search mode) */}
        {mode === "thinking" && (
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-400/40 animate-ping" />
              <span className="text-xs text-amber-300 font-semibold font-indic">
                गहन चिंतन एवं मनन धारा (Reasoning Chain)
              </span>
            </div>
            <Skeleton className="w-full h-3 rounded" />
            <Skeleton className="w-4/5 h-3 rounded" />
          </div>
        )}

        {/* Shimmering Text Paragraph Lines */}
        <div className="space-y-2.5 pt-1">
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-11/12 h-4 rounded" />
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-3/4 h-4 rounded" />
        </div>

        {/* Shimmering Key Highlights or Sanskrit Quote Box */}
        <div className="bg-amber-950/20 border-l-4 border-amber-500/50 rounded-r-xl p-3 space-y-2">
          <Skeleton className="w-2/5 h-3.5 rounded" />
          <Skeleton className="w-4/5 h-3.5 rounded" />
        </div>

        {/* Shimmering Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-amber-500/10">
          <Skeleton className="w-16 h-6 rounded-lg" />
          <Skeleton className="w-16 h-6 rounded-lg" />
          <Skeleton className="w-20 h-6 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

// Skeleton for Bhagavad Gita Shloka Card
export const ShlokaSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-[#11192e] to-[#0b101e] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden bg-mandala-pattern animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🕉️</span>
          <div className="space-y-1.5">
            <Skeleton className="w-48 h-5 rounded" />
            <Skeleton className="w-28 h-3.5 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-20 h-8 rounded-xl" />
          <Skeleton className="w-20 h-8 rounded-xl" />
        </div>
      </div>

      {/* Sanskrit Shloka Verse Container */}
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-3 shadow-inner">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400/70 block">
          मूल संस्कृत श्लोक (Sacred Verse)
        </span>
        <div className="space-y-2 py-2 max-w-xl mx-auto">
          <Skeleton className="w-full h-6 rounded-lg mx-auto" />
          <Skeleton className="w-4/5 h-6 rounded-lg mx-auto" />
        </div>
      </div>

      {/* Transliteration & English Meaning Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4 space-y-2">
          <Skeleton className="w-32 h-3.5 rounded" />
          <Skeleton className="w-full h-3 rounded" />
          <Skeleton className="w-5/6 h-3 rounded" />
        </div>
        <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4 space-y-2">
          <Skeleton className="w-32 h-3.5 rounded" />
          <Skeleton className="w-full h-3 rounded" />
          <Skeleton className="w-4/5 h-3 rounded" />
        </div>
      </div>

      {/* Practical Life Application Guidance Skeleton */}
      <div className="bg-gradient-to-r from-amber-950/50 to-orange-950/40 border border-amber-500/30 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-400/40" />
          <Skeleton className="w-48 h-4 rounded" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-full h-3.5 rounded" />
          <Skeleton className="w-11/12 h-3.5 rounded" />
          <Skeleton className="w-4/5 h-3.5 rounded" />
        </div>
      </div>
    </div>
  );
};

// Skeleton for Interactive Storyteller Scene
export const StorySceneSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Control Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e1628] border border-amber-500/30 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Skeleton className="w-16 h-6 rounded-full" />
          <Skeleton className="w-48 h-5 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-20 h-8 rounded-lg" />
          <Skeleton className="w-24 h-8 rounded-lg" />
        </div>
      </div>

      {/* Parchment Story Narrative Content */}
      <div className="bg-gradient-to-b from-[#131d36] to-[#0d1424] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden bg-mandala-pattern">
        <div className="space-y-3">
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-11/12 h-4 rounded" />
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-5/6 h-4 rounded" />
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-3/4 h-4 rounded" />
        </div>

        {/* Moral / Niti Box */}
        <div className="bg-orange-950/30 border border-orange-500/30 rounded-2xl p-4 space-y-2">
          <Skeleton className="w-36 h-3.5 rounded" />
          <Skeleton className="w-4/5 h-3 rounded" />
        </div>
      </div>

      {/* Branching Decisions Skeleton */}
      <div className="bg-[#0f172a] border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-400/40" />
          <Skeleton className="w-64 h-4 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-6 h-6 rounded-full bg-amber-500/20" />
                <Skeleton className="w-16 h-4 rounded" />
              </div>
              <Skeleton className="w-full h-3.5 rounded" />
              <Skeleton className="w-4/5 h-3.5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton for Translation Output (Bhasha Sangam)
export const TranslationSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-[#12192c] to-[#0a0f1d] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
      {/* Output Header */}
      <div className="space-y-3 pb-5 border-b border-amber-500/20">
        <div className="flex items-center justify-between">
          <Skeleton className="w-44 h-4 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-16 h-7 rounded-lg" />
            <Skeleton className="w-16 h-7 rounded-lg" />
          </div>
        </div>

        <Skeleton className="w-4/5 h-8 rounded-lg" />
        <Skeleton className="w-1/2 h-4 rounded" />
      </div>

      {/* Cultural Nuance Notes */}
      <div className="bg-amber-950/30 border-l-4 border-amber-500 rounded-r-2xl p-4 space-y-2">
        <Skeleton className="w-48 h-3.5 rounded" />
        <Skeleton className="w-full h-3 rounded" />
        <Skeleton className="w-4/5 h-3 rounded" />
      </div>

      {/* Root Words & Dhatu Grid */}
      <div className="space-y-3">
        <Skeleton className="w-56 h-4 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-20 h-4 rounded" />
                <Skeleton className="w-16 h-3.5 rounded" />
              </div>
              <Skeleton className="w-full h-3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton for Heritage Explorer Cards Grid
export const ExplorerGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-gradient-to-b from-[#11192e] to-[#0c1222] border border-amber-500/25 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-24 h-5 rounded-full" />
            <Skeleton className="w-16 h-4 rounded" />
          </div>

          <div className="space-y-1.5">
            <Skeleton className="w-4/5 h-5 rounded-lg" />
            <Skeleton className="w-1/2 h-3.5 rounded" />
          </div>

          <div className="space-y-2 pt-1">
            <Skeleton className="w-full h-3.5 rounded" />
            <Skeleton className="w-full h-3.5 rounded" />
            <Skeleton className="w-3/4 h-3.5 rounded" />
          </div>

          <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between">
            <Skeleton className="w-24 h-7 rounded-xl" />
            <Skeleton className="w-8 h-8 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton for Pariksha / Quiz Section
export const QuizSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-[#11192e] to-[#0b101e] border-2 border-amber-500/35 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden bg-mandala-pattern animate-fadeIn">
      {/* Top Meta */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
        <Skeleton className="w-32 h-4 rounded" />
        <Skeleton className="w-20 h-4 rounded" />
      </div>

      {/* Question Title */}
      <div className="space-y-2 py-2">
        <Skeleton className="w-full h-6 rounded-lg" />
        <Skeleton className="w-4/5 h-6 rounded-lg" />
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 gap-3 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-amber-500/20 bg-slate-900/80 flex items-center gap-3"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex-shrink-0" />
            <Skeleton className="w-3/4 h-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Universal Section Mounting Skeleton
export const TabSectionSkeleton: React.FC<{
  title?: string;
  subtitle?: string;
}> = ({
  title = "Loading Vedic Insights...",
  subtitle = "Connecting to ancient Indic knowledge systems and philosophical archives",
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fadeIn">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <Skeleton className="w-48 h-6 rounded-full mx-auto" />
        <h2 className="text-2xl sm:text-4xl font-royal font-bold text-amber-200/50">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-amber-400/50">{subtitle}</p>
      </div>

      <div className="bg-[#0e1628] border border-amber-500/25 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/15">
          <Skeleton className="w-40 h-5 rounded" />
          <Skeleton className="w-24 h-6 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-11/12 h-4 rounded" />
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-2/3 h-4 rounded" />
        </div>
      </div>
    </div>
  );
};
