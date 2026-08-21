import React, { useState, useEffect } from "react";
import {
  Scroll,
  Sparkles,
  Volume2,
  VolumeX,
  Volume1,
  Play,
  Pause,
  Square,
  RotateCcw,
  Bookmark,
  Share2,
  CheckCircle2,
  Flame,
  Feather,
  ArrowRight,
  Shield,
  HelpCircle,
  Headphones,
  Music,
  Radio
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { IndicLanguageCode, SavedItem, StoryChoice, StoryScene } from "../types";
import { generateStoryScene } from "../services/geminiService";
import { soundscape } from "../services/audioSynth";
import { StorySceneSkeleton, Skeleton } from "./SkeletonLoader";

interface StorytellerSectionProps {
  selectedLanguage: IndicLanguageCode;
  onSaveItem: (item: SavedItem) => void;
}

export const StorytellerSection: React.FC<StorytellerSectionProps> = ({
  selectedLanguage,
  onSaveItem,
}) => {
  const [selectedTheme, setSelectedTheme] = useState("epics");
  const [customPrompt, setCustomPrompt] = useState("");
  const [currentSceneIndex, setCurrentSceneIndex] = useState(1);
  const [storyHistory, setStoryHistory] = useState<StoryScene[]>([]);
  const [currentScene, setCurrentScene] = useState<StoryScene | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Text-To-Speech Narration States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.95);
  const [isTanpuraAmbienceOn, setIsTanpuraAmbienceOn] = useState(false);
  const [autoNarrateNextScene, setAutoNarrateNextScene] = useState(false);
  const [chunkProgress, setChunkProgress] = useState<{ current: number; total: number }>({ current: 0, total: 1 });

  // Synchronize speech state
  useEffect(() => {
    const unsubscribe = soundscape.subscribe((state) => {
      if (state.isSpeaking && state.speakingId === "storyteller-narration") {
        setIsSpeaking(true);
      } else if (!state.isSpeaking || state.speakingId !== "storyteller-narration") {
        setIsSpeaking(false);
      }
    });
    return () => {
      unsubscribe();
      soundscape.stopSpeaking();
    };
  }, []);

  // Sync tanpura state with soundscape
  useEffect(() => {
    setIsTanpuraAmbienceOn(soundscape.isTanpuraActive());
  }, []);

  const storyPresets = [
    {
      theme: "epics",
      label: "Arjuna & The Test of the Bird's Eye",
      prompt: "The legendary archery test set by Guru Dronacharya in the forest of Hastinapura where focus determines destiny.",
    },
    {
      theme: "history",
      label: "Chhatrapati Shivaji's Midnight Escape",
      prompt: "The daring and strategic escape of Chhatrapati Shivaji Maharaj and Prince Sambhaji from royal confinement in Agra.",
    },
    {
      theme: "panchatantra",
      label: "The Monkey and the Crocodile's Heart",
      prompt: "An ancient Panchatantra fable on friendship, betrayal, and quick-witted presence of mind on the banks of the sacred river.",
    },
    {
      theme: "fables",
      label: "Tenali Rama & The Hidden Golden Seeds",
      prompt: "A witty courtroom tale where Tenali Rama solves a dispute over royal land using ancient agricultural wisdom.",
    },
  ];

  const handleStartStory = async (presetPrompt?: string) => {
    const promptToUse = presetPrompt || customPrompt || "An inspiring epic tale of honor, courage, and discernment.";
    setIsLoading(true);
    setCurrentSceneIndex(1);
    setStoryHistory([]);
    setSelectedChoiceId(null);
    setIsSaved(false);
    soundscape.stopSpeaking();
    soundscape.playFluteChime();

    try {
      const scene = await generateStoryScene({
        theme: selectedTheme,
        prompt: promptToUse,
        language: selectedLanguage,
        currentScene: 1,
        previousChoice: "",
        storyContext: "",
      });

      setCurrentScene(scene);
      setStoryHistory([scene]);

      // Auto-narrate if enabled
      if (autoNarrateNextScene && scene) {
        setTimeout(() => {
          startNarration(scene);
        }, 600);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseBranch = async (choice: StoryChoice) => {
    if (!currentScene || isLoading) return;

    setSelectedChoiceId(choice.id);
    setIsLoading(true);
    soundscape.stopSpeaking();
    soundscape.playTempleBell();

    const nextIndex = currentSceneIndex + 1;
    const contextSummary = `${currentScene.title}: In ${currentScene.chapter}, the protagonist decided to ${choice.text}.`;

    try {
      const nextScene = await generateStoryScene({
        theme: selectedTheme,
        prompt: customPrompt,
        language: selectedLanguage,
        currentScene: nextIndex,
        previousChoice: choice.text,
        storyContext: contextSummary,
      });

      setCurrentSceneIndex(nextIndex);
      setCurrentScene(nextScene);
      setStoryHistory((prev) => [...prev, nextScene]);
      setSelectedChoiceId(null);

      // Auto-narrate next scene if enabled
      if (autoNarrateNextScene && nextScene) {
        setTimeout(() => {
          startNarration(nextScene);
        }, 600);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const buildNarrationText = (scene: StoryScene) => {
    return `${scene.title}. ${scene.chapter}. ${scene.narrative} ${
      scene.characterQuote ? `As the dialogue echoes: "${scene.characterQuote}"` : ""
    } ${scene.moralOrWisdom ? `Moral takeaway and Niti: ${scene.moralOrWisdom}` : ""}`;
  };

  const startNarration = (scene: StoryScene, customRate?: number) => {
    const textToRead = buildNarrationText(scene);
    setIsSpeaking(true);
    setChunkProgress({ current: 0, total: 1 });

    soundscape.speakText(
      textToRead,
      selectedLanguage,
      "storyteller-narration",
      () => {
        setIsSpeaking(false);
        setChunkProgress({ current: 0, total: 1 });
      },
      () => setIsSpeaking(true),
      {
        rate: customRate ?? speechSpeed,
        pitch: 1.0,
        onChunkProgress: (current, total) => {
          setChunkProgress({ current, total });
        },
      }
    );
  };

  const handleToggleNarration = () => {
    if (!currentScene) return;
    if (isSpeaking) {
      soundscape.stopSpeaking();
      setIsSpeaking(false);
    } else {
      startNarration(currentScene);
    }
  };

  const handleStopNarration = () => {
    soundscape.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleReplayNarration = () => {
    if (!currentScene) return;
    soundscape.stopSpeaking();
    setTimeout(() => {
      startNarration(currentScene);
    }, 150);
  };

  const handleChangeSpeed = (newSpeed: number) => {
    setSpeechSpeed(newSpeed);
    if (isSpeaking && currentScene) {
      startNarration(currentScene, newSpeed);
    }
  };

  const handleToggleTanpura = () => {
    const nextState = !isTanpuraAmbienceOn;
    soundscape.toggleTanpura(nextState);
    setIsTanpuraAmbienceOn(nextState);
  };

  const handleSaveFullStory = () => {
    if (!currentScene) return;
    onSaveItem({
      id: "story-save-" + Date.now(),
      type: "story",
      title: currentScene.title,
      snippet: currentScene.narrative.slice(0, 160) + "...",
      date: new Date().toLocaleDateString(),
      data: {
        theme: selectedTheme,
        scenes: storyHistory,
      },
    });
    setIsSaved(true);
    soundscape.playTempleBell();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title & Introduction */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full text-xs text-orange-300">
          <Scroll className="w-3.5 h-3.5 text-orange-400" />
          <span>कथा-वाचन • Interactive Indic Storyteller</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-royal font-bold text-saffron-gradient">
          KATHA STORYTELLER
        </h2>
        <p className="text-xs sm:text-sm text-amber-200/80">
          Immerse yourself in dynamic, branching sagas of valor, moral dilemma, and spiritual awakening. Your choices shape the unfolding destiny.
        </p>
      </div>

      {/* Story Creator & Preset Bar */}
      {!currentScene && (
        <div className="bg-[#0f172a]/95 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Themes */}
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-wider text-amber-400">
              1. Choose Narrative Tradition
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "epics", label: "Epics & Puranas", desc: "Ramayana, Mahabharata", icon: "🏹" },
                { id: "history", label: "Historical Legends", desc: "Shivaji, Cholas, Rajputs", icon: "⚔️" },
                { id: "panchatantra", label: "Panchatantra & Niti", desc: "Animal fables & morals", icon: "🦚" },
                { id: "fables", label: "Mystical Folktales", desc: "Tenali Rama, Vikram & Betal", icon: "🪔" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedTheme === t.id
                      ? "bg-gradient-to-br from-amber-900/60 to-orange-950/60 border-amber-400 text-amber-100 shadow-lg scale-[1.02]"
                      : "bg-slate-900/70 border-amber-500/20 text-amber-300/70 hover:border-amber-500/40"
                  }`}
                >
                  <span className="text-2xl block mb-1">{t.icon}</span>
                  <div className="text-xs font-bold text-amber-200">{t.label}</div>
                  <div className="text-[10px] text-amber-300/60">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-wider text-amber-400">
              2. Or Select a Classic Legend
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {storyPresets.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedTheme(preset.theme);
                    setCustomPrompt(preset.prompt);
                    handleStartStory(preset.prompt);
                  }}
                  className="bg-slate-900/80 hover:bg-amber-950/40 border border-amber-500/25 hover:border-amber-400/60 rounded-xl p-3 text-left transition-all flex items-start justify-between gap-2 group"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-200 group-hover:text-amber-100">
                      {preset.label}
                    </div>
                    <div className="text-[11px] text-amber-300/60 line-clamp-1 mt-0.5">
                      {preset.prompt}
                    </div>
                  </div>
                  <Play className="w-4 h-4 text-amber-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-wider text-amber-400">
              3. Or Craft Your Custom Scenario
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. 'A young Chola naval navigator discovering an uncharted sacred island in the Indian Ocean...'"
                className="flex-1 bg-slate-900/90 border border-amber-500/30 focus:border-amber-400 rounded-xl px-4 py-3 text-xs sm:text-sm text-amber-100 placeholder:text-amber-400/40 focus:outline-none"
              />
              <button
                onClick={() => handleStartStory()}
                disabled={isLoading}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-950/60 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Begin Katha</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initial Story Creation Skeleton */}
      {isLoading && !currentScene && (
        <StorySceneSkeleton />
      )}

      {/* Active Story View */}
      {currentScene && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Navigation & Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e1628] border border-amber-500/30 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-1 rounded-full font-bold">
                Act {currentSceneIndex}
              </span>
              <h3 className="font-royal text-sm sm:text-lg font-bold text-amber-100 truncate max-w-[200px] sm:max-w-md">
                {currentScene.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveFullStory}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                  isSaved
                    ? "bg-emerald-950 border-emerald-500/50 text-emerald-300"
                    : "bg-slate-900 text-amber-200 border-amber-500/30 hover:bg-amber-950/50"
                }`}
                title="Save story"
              >
                <Bookmark className="w-3.5 h-3.5" fill={isSaved ? "currentColor" : "none"} />
                <span>{isSaved ? "Saved" : "Save Story"}</span>
              </button>

              <button
                onClick={() => {
                  soundscape.stopSpeaking();
                  setCurrentScene(null);
                  setStoryHistory([]);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-amber-500/30 text-amber-300/80 hover:text-amber-100 hover:bg-slate-800 transition-colors"
                title="Start a new Katha"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Katha</span>
              </button>
            </div>
          </div>

          {/* DEDICATED IMMERSIVE TEXT-TO-SPEECH AUDIO PLAYER DECK */}
          <div className="bg-gradient-to-r from-[#12192e] via-[#1a1c33] to-[#12192e] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
              {/* Voice & Status Banner */}
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border transition-all ${
                  isSpeaking
                    ? "bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30 animate-bounce"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}>
                  <Headphones className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                      कथा-वाचन (Audio Katha Narration)
                    </span>
                    {isSpeaking && (
                      <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                        <Radio className="w-2.5 h-2.5 text-amber-400 animate-ping" />
                        Speaking in {selectedLanguage}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-300/70">
                    {isSpeaking
                      ? "Listening to live chapter recitation with natural Indic prosody..."
                      : "Listen aloud to this chapter with immersive voice narration & traditional acoustic tanpura."}
                  </p>
                </div>
              </div>

              {/* Sound Equalizer Waves Animation (Visualizer) */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-amber-500/20">
                <span className="text-[10px] uppercase font-bold text-amber-400/80 mr-1.5">Voice Wave</span>
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isSpeaking
                        ? "bg-gradient-to-t from-amber-500 to-orange-400 animate-pulse"
                        : "bg-amber-500/20 h-2"
                    }`}
                    style={{
                      height: isSpeaking ? `${Math.max(6, (bar * 5 + (chunkProgress.current % 4) * 4) % 22 + 6)}px` : "6px",
                      animationDelay: `${bar * 0.12}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Audio Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              {/* Primary Narration Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleNarration}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg ${
                    isSpeaking
                      ? "bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 shadow-amber-500/30 scale-[1.02]"
                      : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-950/60"
                  }`}
                  title={isSpeaking ? "Pause story narration" : "Narrate story aloud"}
                >
                  {isSpeaking ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Narration</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Narrate Story Aloud</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReplayNarration}
                  disabled={!currentScene}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-amber-500/30 text-amber-200 hover:bg-amber-950/50 hover:border-amber-400 transition-colors"
                  title="Replay scene from the beginning"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Replay</span>
                </button>

                {isSpeaking && (
                  <button
                    onClick={handleStopNarration}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60 transition-colors"
                    title="Stop narration"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </button>
                )}
              </div>

              {/* Speed & Ambience Options */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Playback Speed */}
                <div className="flex items-center gap-1 bg-slate-950/70 border border-amber-500/25 p-1 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-amber-400/80 px-2">Speed:</span>
                  {[
                    { label: "0.8x", value: 0.8, title: "Slow & Reverent" },
                    { label: "1.0x", value: 0.95, title: "Standard Katha Pace" },
                    { label: "1.2x", value: 1.2, title: "Fast Expressive" },
                  ].map((speed) => (
                    <button
                      key={speed.label}
                      onClick={() => handleChangeSpeed(speed.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        Math.abs(speechSpeed - speed.value) < 0.05
                          ? "bg-amber-500 text-slate-950 shadow"
                          : "text-amber-300/70 hover:text-amber-200 hover:bg-amber-950/40"
                      }`}
                      title={speed.title}
                    >
                      {speed.label}
                    </button>
                  ))}
                </div>

                {/* Tanpura Drone Ambience Toggle */}
                <button
                  onClick={handleToggleTanpura}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isTanpuraAmbienceOn
                      ? "bg-gradient-to-r from-amber-600/40 to-orange-600/40 border-amber-400 text-amber-200 shadow-md shadow-amber-950/40"
                      : "bg-slate-950/70 border-amber-500/25 text-amber-300/70 hover:text-amber-200 hover:border-amber-400/50"
                  }`}
                  title="Play authentic acoustic Tanpura drone strings in the background"
                >
                  <Music className={`w-3.5 h-3.5 ${isTanpuraAmbienceOn ? "text-amber-300 animate-pulse" : "text-amber-400/60"}`} />
                  <span>{isTanpuraAmbienceOn ? "🪕 Tanpura Drone: On" : "🪕 Tanpura: Off"}</span>
                </button>

                {/* Auto-Narrate Next Scene Toggle */}
                <button
                  onClick={() => setAutoNarrateNextScene(!autoNarrateNextScene)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    autoNarrateNextScene
                      ? "bg-amber-500/20 border-amber-400 text-amber-200"
                      : "bg-slate-950/70 border-amber-500/25 text-amber-400/60 hover:text-amber-300"
                  }`}
                  title="Automatically begin speaking when moving to the next chapter"
                >
                  <Volume1 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto-Narrate: {autoNarrateNextScene ? "ON" : "OFF"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Narrative Parchment Card */}
          <div className={`bg-gradient-to-b from-[#131b2e] to-[#0c1220] border-2 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden bg-mandala-pattern transition-all duration-300 ${
            isSpeaking ? "border-amber-400 shadow-amber-500/20 ring-1 ring-amber-400/40" : "border-amber-500/40"
          }`}>
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-9xl font-serif text-amber-400">
              ॐ
            </div>

            <div className="space-y-6 relative z-10">
              {/* Chapter Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-500/20">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block">
                    {currentScene.chapter}
                  </span>
                  <h4 className="font-royal text-xl sm:text-2xl font-bold text-saffron-gradient">
                    {currentScene.title}
                  </h4>
                </div>

                <button
                  onClick={handleToggleNarration}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all ${
                    isSpeaking
                      ? "bg-amber-500 text-slate-950 border-amber-300 font-bold animate-pulse"
                      : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                  }`}
                >
                  {isSpeaking ? <Volume2 className="w-3.5 h-3.5" /> : <Volume1 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? "Narrating..." : "Listen to Chapter"}</span>
                </button>
              </div>

              {/* Narrative Text */}
              <div className={`text-sm sm:text-base leading-relaxed font-serif space-y-4 whitespace-pre-line text-justify transition-colors ${
                isSpeaking ? "text-amber-50 font-medium" : "text-amber-100/95"
              }`}>
                {currentScene.narrative}
              </div>

              {/* Character Quote Banner */}
              {currentScene.characterQuote && (
                <div className="bg-amber-950/30 border-l-4 border-amber-500 rounded-r-2xl p-4 italic text-xs sm:text-sm text-amber-200 shadow-inner flex items-start gap-3">
                  <span className="text-2xl text-amber-400 font-serif leading-none">“</span>
                  <div className="flex-1">
                    <p>{currentScene.characterQuote}”</p>
                    {currentScene.speaker && (
                      <span className="block text-right font-sans font-bold text-amber-400 text-xs mt-1 not-italic">
                        — {currentScene.speaker}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Moral / Subhashita Box */}
              {currentScene.moralOrWisdom && (
                <div className="bg-orange-950/30 border border-orange-500/30 rounded-2xl p-4 text-xs sm:text-sm text-orange-200 flex items-start gap-3 shadow-md">
                  <Flame className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-orange-300 font-bold uppercase tracking-wide text-[11px] block">
                      निति व विवेक (Moral Discernment)
                    </strong>
                    <p className="mt-0.5 leading-relaxed font-indic text-amber-100">
                      {currentScene.moralOrWisdom}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Branching Choices */}
          <div className="bg-[#0f172a] border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>What Path Shall The Protagonist Choose? (आपका निर्णय)</span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 animate-fadeIn">
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {currentScene.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChooseBranch(choice)}
                    className="bg-slate-900/90 hover:bg-gradient-to-br hover:from-amber-950/70 hover:to-orange-950/70 border border-amber-500/25 hover:border-amber-400/80 rounded-2xl p-4 text-left transition-all duration-200 flex flex-col justify-between group shadow-md hover:scale-[1.02] active:scale-[0.99]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center">
                          {choice.id}
                        </span>
                        {choice.theme && (
                          <span className="text-[10px] uppercase font-semibold text-amber-400/70 bg-slate-950/60 px-2 py-0.5 rounded">
                            {choice.theme}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-amber-100/90 font-medium leading-snug">
                        {choice.text}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-amber-500/10 flex items-center justify-end text-[11px] text-amber-400 group-hover:text-amber-200 font-semibold gap-1">
                      <span>Choose Path</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
