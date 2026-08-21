import React, { useState } from "react";
import {
  Award,
  Sparkles,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  Flame,
  Trophy,
  Brain,
  Star,
  Zap,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { CURATED_QUIZ_QUESTIONS, INITIAL_USER_BADGES } from "../data/quizData";
import { QuizQuestion, UserBadge } from "../types";
import { fetchDynamicQuiz } from "../services/geminiService";
import { soundscape } from "../services/audioSynth";
import { QuizSkeleton } from "./SkeletonLoader";

interface QuizSectionProps {
  onUnlockBadge?: (badgeId: string) => void;
}

export const QuizSection: React.FC<QuizSectionProps> = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(CURATED_QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<UserBadge[]>(INITIAL_USER_BADGES);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isGeneratingAiQuiz, setIsGeneratingAiQuiz] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;

    if (isCorrect) {
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      soundscape.playTempleBell();

      // Check badge unlock for perfect score
      if (newStreak >= 3) {
        unlockBadge("itihaas-marmagya");
      }
    } else {
      setStreak(0);
    }
  };

  const unlockBadge = (id: string) => {
    setBadges((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, unlocked: true, unlockedAt: new Date().toLocaleDateString() } : b
      )
    );
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsQuizCompleted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#ea580c", "#ef4444", "#3b82f6", "#10b981"],
      });
      soundscape.playTempleBell();
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setIsQuizCompleted(false);
  };

  const handleGenerateAiQuiz = async (category: string = "ancient sciences") => {
    setIsGeneratingAiQuiz(true);
    soundscape.playTempleBell();
    try {
      const data = await fetchDynamicQuiz(category, "medium");
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        handleRestartQuiz();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAiQuiz(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs text-amber-300">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>ज्ञान परीक्षा • Indic Heritage Quiz & Badges</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-royal font-bold text-saffron-gradient">
          GYAN PARIKSHA
        </h2>
        <p className="text-xs sm:text-sm text-amber-200/80">
          Challenge your mastery of ancient architecture, Sanskrit philosophies, metallurgy, astronomical discoveries, and classical arts.
        </p>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-3 gap-3 bg-[#0e1628] border border-amber-500/25 rounded-2xl p-3 sm:p-4 text-center">
        <div className="space-y-0.5">
          <span className="text-[11px] text-amber-400/70 font-semibold uppercase tracking-wider">
            Score
          </span>
          <div className="text-xl sm:text-2xl font-bold text-amber-200">
            {score} / {questions.length}
          </div>
        </div>
        <div className="space-y-0.5 border-x border-amber-500/20">
          <span className="text-[11px] text-orange-400/70 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" /> Streak
          </span>
          <div className="text-xl sm:text-2xl font-bold text-orange-300">
            {streak} 🔥
          </div>
        </div>
        <div className="space-y-0.5">
          <span className="text-[11px] text-emerald-400/70 font-semibold uppercase tracking-wider">
            Badges
          </span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-300">
            {badges.filter((b) => b.unlocked).length} / {badges.length}
          </div>
        </div>
      </div>

      {/* Main Quiz Area */}
      {isGeneratingAiQuiz ? (
        <QuizSkeleton />
      ) : !isQuizCompleted ? (
        <div className="bg-gradient-to-b from-[#11192e] to-[#0b101e] border-2 border-amber-500/35 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden bg-mandala-pattern">
          {/* Question Index and Category */}
          <div className="flex items-center justify-between text-xs text-amber-400/80 pb-3 border-b border-amber-500/20">
            <span className="font-bold uppercase tracking-wider">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="bg-amber-950/80 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 rounded-full font-medium">
              {currentQ.category}
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-base sm:text-xl font-royal font-bold text-amber-100 leading-snug">
            {currentQ.question}
          </h3>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let btnStyle = "bg-slate-900/80 border-amber-500/25 text-amber-100 hover:border-amber-400/60 hover:bg-slate-800/80";

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-950/90 border-emerald-400 text-emerald-100 shadow-md shadow-emerald-950/60";
                } else if (isSelected) {
                  btnStyle = "bg-rose-950/90 border-rose-500 text-rose-100 shadow-md shadow-rose-950/60";
                } else {
                  btnStyle = "bg-slate-900/40 border-amber-500/10 text-amber-300/40 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation & Curious Fact */}
          {isAnswered && (
            <div className="space-y-3 pt-4 border-t border-amber-500/20 animate-fadeIn">
              <div className="bg-amber-950/30 border-l-4 border-amber-400 rounded-r-2xl p-4 text-xs sm:text-sm text-amber-100 leading-relaxed space-y-1">
                <strong className="text-amber-300 uppercase tracking-wide text-xs block font-bold">
                  Historical & Scholarly Context:
                </strong>
                <p>{currentQ.explanation}</p>
              </div>

              {currentQ.curiousFact && (
                <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-3.5 text-xs text-cyan-200 flex items-start gap-2.5">
                  <Brain className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-cyan-300 font-bold block text-[11px] uppercase">
                      Did You Know? (रोचक तथ्य)
                    </strong>
                    <p className="mt-0.5">{currentQ.curiousFact}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-950/60 transition-all hover:scale-[1.02]"
                >
                  <span>{currentIndex + 1 < questions.length ? "Next Question" : "Complete Quiz"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Complete Screen */
        <div className="bg-gradient-to-b from-[#121a2e] to-[#0a0f1d] border-2 border-amber-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto flex items-center justify-center text-4xl shadow-xl shadow-amber-950/80">
            🏆
          </div>

          <div className="space-y-2">
            <h3 className="font-royal text-2xl sm:text-3xl font-bold text-saffron-gradient">
              Pariksha Completed!
            </h3>
            <p className="text-sm sm:text-base text-amber-200">
              You scored <strong className="text-amber-300 text-lg">{score}</strong> out of{" "}
              <strong className="text-amber-300 text-lg">{questions.length}</strong>!
            </p>
            <p className="text-xs text-amber-400/80 font-indic">
              "स्वाध्यायान्मा प्रमदः" — Never neglect your continuous study and heritage wisdom.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handleRestartQuiz}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-950/60 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Curated Quiz</span>
            </button>

            <button
              onClick={() => handleGenerateAiQuiz("Ancient Indian Sciences & Temple Architecture")}
              disabled={isGeneratingAiQuiz}
              className="bg-slate-900 hover:bg-amber-950/60 border border-amber-500/40 text-amber-200 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isGeneratingAiQuiz ? "Synthesizing AI Quiz..." : "Generate Fresh AI Challenge"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Cultural Badges Showcase */}
      <div className="bg-[#0e1628] border border-amber-500/25 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-royal text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Cultural Badges & Titles (उपाधियाँ)
          </h3>
          <span className="text-xs text-amber-400/60 font-medium">
            Unlock achievements by testing your knowledge
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-2xl border text-center transition-all ${
                badge.unlocked
                  ? "bg-gradient-to-b from-amber-950/60 to-slate-900 border-amber-400 text-amber-100 shadow-md scale-[1.02]"
                  : "bg-slate-900/40 border-amber-500/10 text-amber-300/30 grayscale opacity-60"
              }`}
            >
              <span className="text-3xl block mb-1">{badge.icon}</span>
              <div className="text-xs font-bold text-amber-200 truncate">{badge.name}</div>
              <div className="text-[10px] font-indic text-amber-400/80 font-medium">{badge.indicName}</div>
              <p className="text-[9px] text-amber-300/60 line-clamp-2 mt-1 leading-tight">
                {badge.description}
              </p>
              {badge.unlocked && (
                <span className="inline-block text-[9px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded mt-1.5">
                  Unlocked
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
