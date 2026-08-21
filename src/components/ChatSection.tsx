import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  Share2,
  Trash2,
  Layers,
  ChevronRight,
  History,
  Clock,
  X,
  CornerDownLeft,
  Search,
  ArrowUpRight,
  Mic,
  MicOff,
  Globe,
  Zap,
  Brain,
  Compass,
  ExternalLink,
  Loader2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { BHARAT_PERSONAS } from "../data/configData";
import { AiMode, ChatMessage, IndicLanguageCode, PersonaType, SavedItem } from "../types";
import { sendChatMessage, transcribeAudio } from "../services/geminiService";
import { soundscape } from "../services/audioSynth";
import { ChatResponseSkeleton } from "./SkeletonLoader";

const PROMPT_HISTORY_STORAGE_KEY = "bharat_gpt_prompt_history_v1";

interface PromptHistoryItem {
  id: string;
  text: string;
  timestamp: string;
  persona: PersonaType;
}

interface ChatSectionProps {
  selectedLanguage: IndicLanguageCode;
  onSaveItem: (item: SavedItem) => void;
  prefilledPrompt?: string;
  onClearPrefilledPrompt?: () => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  selectedLanguage,
  onSaveItem,
  prefilledPrompt,
  onClearPrefilledPrompt,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("scholar");
  const [selectedMode, setSelectedMode] = useState<AiMode>("balanced");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Audio recording & Speech-to-Text state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Prompt history state
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(PROMPT_HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error loading prompt history", e);
    }
    return [];
  });
  const [showHistoryTray, setShowHistoryTray] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      persona: "scholar",
      language: selectedLanguage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `### **नमस्ते (Namaste) & Welcome to Bharat GPT** 🙏\n\nI am your companion in exploring the boundless depth of Indian heritage, philosophy, sciences, languages, and history.\n\n*Choose a specialized Indic Persona above or ask anything about:*\n• **Vedic Philosophy & Gita:** Karma Yoga, Upanishads, Advaita, Meditation\n• **Monumental Architecture:** Konark, Kailasa Temple, Brihadeeswarar, Hampi\n• **Ancient Indian Sciences:** Sushruta's surgery, Aryabhata's astronomy, Wootz steel, Ayurveda\n• **Epics & Folktales:** Ramayana, Mahabharata, Panchatantra, regional valor\n\nHow may I illuminate your inquiry today?`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save prompt to local storage history
  const recordPromptToHistory = (text: string, persona: PersonaType) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setPromptHistory((prev) => {
      // Remove duplicate if exists to bump to top
      const filtered = prev.filter((item) => item.text.toLowerCase() !== trimmed.toLowerCase());
      const newItem: PromptHistoryItem = {
        id: "hist-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        persona,
      };
      const updated = [newItem, ...filtered].slice(0, 40); // keep up to 40 recent prompts
      try {
        localStorage.setItem(PROMPT_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to write prompt history", e);
      }
      return updated;
    });
  };

  const removePromptFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPromptHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(PROMPT_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to update prompt history", err);
      }
      return updated;
    });
  };

  const clearAllPromptHistory = () => {
    setPromptHistory([]);
    try {
      localStorage.removeItem(PROMPT_HISTORY_STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear prompt history", err);
    }
  };

  const handleSelectHistoryPrompt = (item: PromptHistoryItem, autoSend = false) => {
    if (item.persona && item.persona !== selectedPersona) {
      setSelectedPersona(item.persona);
    }
    if (autoSend) {
      setShowHistoryTray(false);
      handleSendMessage(item.text);
    } else {
      setInputMessage(item.text);
      setShowHistoryTray(false);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (prefilledPrompt) {
      setInputMessage(prefilledPrompt);
      if (onClearPrefilledPrompt) onClearPrefilledPrompt();
    }
  }, [prefilledPrompt]);

  // Voice recording & Multimodal Speech-to-Text handler
  const speechRecognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const getLanguageSpeechCode = (lang: IndicLanguageCode): string => {
    const map: Record<string, string> = {
      Hindi: "hi-IN",
      Sanskrit: "sa-IN",
      Tamil: "ta-IN",
      Telugu: "te-IN",
      Marathi: "mr-IN",
      Bengali: "bn-IN",
      Gujarati: "gu-IN",
      Kannada: "kn-IN",
      Malayalam: "ml-IN",
      Punjabi: "pa-IN",
      Odia: "or-IN",
      English: "en-IN",
    };
    return map[lang] || "en-IN";
  };

  const startVoiceRecording = async () => {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }

    // Try browser-native Web Speech Recognition first for zero-latency transcription
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        speechRecognitionRef.current = recognition;
        recognition.lang = getLanguageSpeechCode(selectedLanguage);
        recognition.interimResults = true;
        recognition.continuous = false;

        let accumulatedTranscript = "";

        recognition.onstart = () => {
          setIsRecording(true);
          setRecordingSeconds(0);
          if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = setInterval(() => {
            setRecordingSeconds((prev) => prev + 1);
          }, 1000);
        };

        recognition.onresult = (event: any) => {
          let current = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          accumulatedTranscript = current;
          if (current) {
            setInputMessage((prev) => {
              // If previous text existed before this speech session, append
              return current;
            });
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("SpeechRecognition notice:", e?.error);
          stopVoiceRecording();
        };

        recognition.onend = () => {
          stopVoiceRecording();
        };

        recognition.start();
        return;
      } catch (speechErr) {
        console.warn("Native speech recognition init failed, using MediaRecorder fallback:", speechErr);
      }
    }

    // Fallback: MediaRecorder stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        setIsRecording(false);
        setIsTranscribing(true);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }

        try {
          const transcribedText = await transcribeAudio(audioBlob, selectedLanguage);
          if (transcribedText && transcribedText.trim()) {
            setInputMessage((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
          }
        } catch (transcribeErr) {
          console.warn("Audio transcription notice:", transcribeErr);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (micErr) {
      console.warn("Microphone permission or recording notice:", micErr);
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
  };

  const currentPersona = BHARAT_PERSONAS.find((p) => p.id === selectedPersona) || BHARAT_PERSONAS[0];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    // Record in persistent prompt history
    recordPromptToHistory(text, selectedPersona);

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      persona: selectedPersona,
      language: selectedLanguage,
      mode: selectedMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        text,
        selectedPersona,
        selectedLanguage,
        messages,
        selectedMode
      );

      const botMsg: ChatMessage = {
        id: "bot-" + Date.now(),
        sender: "assistant",
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        persona: selectedPersona,
        language: selectedLanguage,
        mode: response.mode || selectedMode,
        sources: response.sources,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronize active speech state
  useEffect(() => {
    const unsubscribe = soundscape.subscribe((state) => {
      if (state.isSpeaking && state.speakingId) {
        setSpeakingId(state.speakingId);
      } else if (!state.isSpeaking) {
        setSpeakingId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingId === id) {
      soundscape.stopSpeaking();
      setSpeakingId(null);
    } else {
      setSpeakingId(id);
      soundscape.speakText(
        text,
        selectedLanguage,
        id,
        () => setSpeakingId(null),
        () => setSpeakingId(id)
      );
    }
  };

  const handleSaveMessage = (msg: ChatMessage) => {
    onSaveItem({
      id: "chat-save-" + Date.now(),
      type: "chat",
      title: msg.text.slice(0, 50) + "...",
      snippet: msg.text.slice(0, 180) + "...",
      date: new Date().toLocaleDateString(),
      data: msg,
    });
    setSavedIds((prev) => new Set(prev).add(msg.id));
    soundscape.playTempleBell();
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        sender: "assistant",
        persona: selectedPersona,
        language: selectedLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: `### **संवाद पुनः प्रारंभ (New Dialogue Started)**\n\nI am listening as **${currentPersona.name} (${currentPersona.indicName})**. What aspect of Indian wisdom or culture would you like to explore?`,
      },
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-6 space-y-6">
      {/* Persona Selection Bar */}
      <div className="bg-[#0f172a]/90 border border-amber-500/30 rounded-2xl p-3 sm:p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-300">
              Select Indic Guide Persona
            </span>
          </div>
          <span className="text-xs text-amber-400/60 hidden sm:inline font-indic">
            विशिष्ट ज्ञान शाखा
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {BHARAT_PERSONAS.map((p) => {
            const isSelected = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p.id)}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-200 relative overflow-hidden ${
                  isSelected
                    ? "bg-gradient-to-br from-amber-900/60 via-orange-950/40 to-slate-900 border-amber-400 text-amber-100 shadow-md shadow-amber-950/80 scale-[1.02]"
                    : "bg-slate-900/50 border-amber-500/20 text-amber-300/70 hover:border-amber-500/40 hover:bg-slate-800/40"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                )}
                <div className="flex items-center gap-2 mb-1 w-full">
                  <span className="text-xl">{p.avatarIcon}</span>
                  <span className="text-xs font-bold text-amber-200 truncate">{p.name}</span>
                </div>
                <span className="text-[11px] font-indic text-amber-400/80 font-medium">{p.indicName}</span>
                <p className="text-[10px] text-amber-200/60 line-clamp-2 mt-1 leading-tight">
                  {p.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Persona Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-amber-950/40 border border-amber-500/20 rounded-xl px-4 py-2 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentPersona.avatarIcon}</span>
          <div>
            <strong className="text-amber-300">{currentPersona.name} ({currentPersona.indicName})</strong>:{" "}
            <span className="text-amber-200/70">{currentPersona.description}</span>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1 text-[11px] text-amber-400/70 hover:text-amber-300 hover:bg-amber-950/40 px-2 py-1 rounded transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* AI Intelligence Mode Engine Selector */}
      <div className="bg-[#0c1222] border border-amber-500/25 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300/90">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Intelligence Mode:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedMode("balanced")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
              selectedMode === "balanced"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/60"
                : "bg-slate-900/80 hover:bg-slate-800 text-amber-200/70 border border-amber-500/20"
            }`}
            title="Balanced Indic synthesis with Gemini 3.5 Flash"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Balanced (3.5 Flash)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode("fast")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
              selectedMode === "fast"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/60"
                : "bg-slate-900/80 hover:bg-slate-800 text-amber-200/70 border border-amber-500/20"
            }`}
            title="Ultra-fast, low-latency answers with Gemini 3.1 Flash-Lite"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Fast (3.1 Flash-Lite)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode("search")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
              selectedMode === "search"
                ? "bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-950/60"
                : "bg-slate-900/80 hover:bg-slate-800 text-sky-200/80 border border-sky-500/20"
            }`}
            title="Live Google Search Grounding with web citations (Gemini 3.5 Flash)"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>🔍 Google Search Grounding</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode("thinking")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
              selectedMode === "thinking"
                ? "bg-purple-500 text-slate-950 font-bold shadow-md shadow-purple-950/60"
                : "bg-slate-900/80 hover:bg-slate-800 text-purple-200/80 border border-purple-500/20"
            }`}
            title="Deep multi-step reasoning for complex philosophical queries (Gemini 3.1 Pro High Thinking)"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>🧠 High Thinking (3.1 Pro)</span>
          </button>
        </div>
      </div>

      {/* Conversation Window */}
      <div className="bg-[#0b101d]/90 border border-amber-500/25 rounded-2xl shadow-2xl flex flex-col h-[520px] sm:h-[600px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-mandala-pattern">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const personaInfo = BHARAT_PERSONAS.find((p) => p.id === msg.persona) || currentPersona;
            const isSaved = savedIds.has(msg.id);

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}
              >
                {!isUser && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-800 p-0.5 flex-shrink-0 shadow-md">
                    <div className="w-full h-full bg-[#0c1220] rounded-[10px] flex items-center justify-center text-sm">
                      {personaInfo.avatarIcon}
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 sm:px-5 py-3.5 shadow-lg ${
                    isUser
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-amber-50 rounded-br-none border border-orange-400/30"
                      : "bg-[#111827]/95 text-amber-100/95 rounded-bl-none border border-amber-500/30 backdrop-blur-sm"
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/15 text-xs text-amber-400/80">
                      <span className="font-semibold text-amber-300">
                        {personaInfo.name} • <span className="font-indic">{personaInfo.indicName}</span>
                      </span>
                      <span className="text-[10px] text-amber-400/50">{msg.timestamp}</span>
                    </div>
                  )}

                  <div className="prose prose-invert prose-amber max-w-none text-xs sm:text-sm leading-relaxed">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>

                  {/* Google Search Grounding Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-amber-500/20">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-300 mb-1.5">
                        <Globe className="w-3.5 h-3.5 text-sky-400" />
                        <span>Google Search Grounding Sources ({msg.sources.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-slate-950/80 hover:bg-slate-900 border border-sky-500/30 hover:border-sky-400 text-sky-200/90 text-[10px] px-2 py-0.5 rounded-md transition-colors"
                          >
                            <span className="truncate max-w-[180px]">{src.title || src.url}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-sky-400 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isUser && (
                    <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-amber-500/10 text-amber-400/70">
                      <button
                        onClick={() => handleSpeak(msg.id, msg.text)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                          speakingId === msg.id
                            ? "text-slate-950 bg-amber-400 font-semibold shadow-md shadow-amber-500/20"
                            : "text-amber-400/80 hover:bg-amber-950/40 hover:text-amber-200"
                        }`}
                        title={speakingId === msg.id ? "Stop voice recitation" : `Listen to ${personaInfo.name}'s response in natural voice`}
                      >
                        {speakingId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono font-medium">Stop</span>
                            {/* Equalizer animation */}
                            <span className="flex items-center gap-0.5 ml-0.5">
                              <span className="w-0.5 h-2 bg-slate-950 animate-bounce rounded-full" style={{ animationDelay: "0ms" }} />
                              <span className="w-0.5 h-3 bg-slate-950 animate-bounce rounded-full" style={{ animationDelay: "150ms" }} />
                              <span className="w-0.5 h-1.5 bg-slate-950 animate-bounce rounded-full" style={{ animationDelay: "300ms" }} />
                            </span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] hidden sm:inline">Listen</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1.5 rounded hover:bg-amber-950/40 hover:text-amber-200 transition-colors"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleSaveMessage(msg)}
                        className={`p-1.5 rounded hover:bg-amber-950/40 transition-colors ${
                          isSaved ? "text-amber-400 bg-amber-950/50" : "hover:text-amber-200"
                        }`}
                        title="Save to Smriti Kosh Vault"
                      >
                        <Bookmark className="w-3.5 h-3.5" fill={isSaved ? "currentColor" : "none"} />
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-950 shadow-md">
                    You
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <ChatResponseSkeleton
              mode={selectedMode}
              personaName={currentPersona.name}
              personaAvatar={currentPersona.avatarIcon}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Inquiry Chips & Prompt History Bar */}
        <div className="bg-[#0e1626] border-t border-amber-500/15 px-3 py-2 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1">
              <span className="text-[11px] text-amber-400/60 font-medium whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Starters:
              </span>
              {currentPersona.defaultStarters.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(starter)}
                  disabled={isLoading}
                  className="text-xs bg-slate-800/80 hover:bg-amber-900/40 text-amber-200/80 hover:text-amber-100 border border-amber-500/20 hover:border-amber-500/50 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex-shrink-0"
                >
                  {starter}
                </button>
              ))}
            </div>

            {/* Prompt History Toggle Button */}
            <button
              onClick={() => setShowHistoryTray((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all flex-shrink-0 ${
                showHistoryTray
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-950/60"
                  : promptHistory.length > 0
                  ? "bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border-amber-500/30 hover:border-amber-400/50"
                  : "bg-slate-900/60 text-amber-400/40 border-slate-800 hover:text-amber-400/70"
              }`}
              title="View and re-use previous prompts"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prompt History</span>
              {promptHistory.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  showHistoryTray ? "bg-slate-950 text-amber-400" : "bg-amber-500/20 text-amber-300"
                }`}>
                  {promptHistory.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick horizontal recent prompt chips if history exists and tray is closed */}
          {!showHistoryTray && promptHistory.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-amber-500/10">
              <span className="text-[10px] text-amber-400/50 uppercase font-semibold tracking-wider whitespace-nowrap flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Recent:
              </span>
              {promptHistory.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectHistoryPrompt(item, false)}
                  className="text-[11px] bg-slate-900/80 hover:bg-slate-800 text-amber-200/70 hover:text-amber-100 border border-amber-500/20 hover:border-amber-400/40 px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors truncate max-w-[200px] sm:max-w-[280px] flex items-center gap-1"
                  title={`Re-load: "${item.text}"`}
                >
                  <span className="truncate">{item.text}</span>
                  <ArrowUpRight className="w-2.5 h-2.5 text-amber-400/60 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Expandable Prompt History Drawer / Modal Tray */}
        {showHistoryTray && (
          <div className="bg-[#0b101f] border-t border-amber-500/30 p-3 sm:p-4 animate-fadeIn max-h-64 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-amber-500/15">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-amber-200 font-royal">
                  Previous Prompts ({promptHistory.length})
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {promptHistory.length > 0 && (
                  <button
                    onClick={clearAllPromptHistory}
                    className="text-[11px] text-rose-400/70 hover:text-rose-300 flex items-center gap-1 hover:bg-rose-950/30 px-2 py-0.5 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
                <button
                  onClick={() => setShowHistoryTray(false)}
                  className="text-amber-400/60 hover:text-amber-200 p-1 rounded hover:bg-amber-950/40"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Search filter if more than 3 history items */}
            {promptHistory.length > 3 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/40" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Filter past prompts..."
                  className="w-full bg-slate-950/80 border border-amber-500/20 focus:border-amber-400 rounded-lg pl-8 pr-3 py-1.5 text-xs text-amber-100 placeholder-amber-400/30 focus:outline-none"
                />
              </div>
            )}

            {/* History List */}
            {promptHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-amber-300/40 space-y-1">
                <Clock className="w-5 h-5 mx-auto text-amber-500/30" />
                <p>No previous inquiries recorded in this session yet.</p>
                <p className="text-[10px]">Your questions will automatically be saved here for quick re-access.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {promptHistory
                  .filter((item) =>
                    !historySearchQuery.trim() ||
                    item.text.toLowerCase().includes(historySearchQuery.toLowerCase())
                  )
                  .map((item) => {
                    const personaObj = BHARAT_PERSONAS.find((p) => p.id === item.persona);
                    return (
                      <div
                        key={item.id}
                        className="group bg-slate-900/90 hover:bg-slate-800/90 border border-amber-500/20 hover:border-amber-400/50 rounded-xl p-2.5 transition-all flex flex-col justify-between gap-2 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs text-amber-100 font-medium line-clamp-2 leading-snug">
                            {item.text}
                          </p>
                          <button
                            onClick={(e) => removePromptFromHistory(item.id, e)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors opacity-60 group-hover:opacity-100 flex-shrink-0"
                            title="Delete this prompt from history"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-amber-500/10 text-[10px] text-amber-400/60">
                          <div className="flex items-center gap-1.5">
                            {personaObj && (
                              <span className="bg-amber-950/60 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">
                                {personaObj.avatarIcon} {personaObj.name.split(" ")[0]}
                              </span>
                            )}
                            <span>{item.timestamp}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleSelectHistoryPrompt(item, false)}
                              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1"
                              title="Load into input field to edit"
                            >
                              <CornerDownLeft className="w-2.5 h-2.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleSelectHistoryPrompt(item, true)}
                              disabled={isLoading}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] shadow transition-colors flex items-center gap-1 disabled:opacity-50"
                              title="Ask again immediately"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>Ask</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#0a0f1d] border-t border-amber-500/25">
          {/* Active Voice Recording Banner */}
          {isRecording && (
            <div className="mb-2 bg-rose-950/80 border border-rose-500/50 rounded-xl px-3 py-2 flex items-center justify-between text-rose-200 animate-pulse text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="font-semibold">Recording Indic Speech with Microphone... ({recordingSeconds}s)</span>
              </div>
              <button
                type="button"
                onClick={stopVoiceRecording}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded-lg text-xs"
              >
                Done & Transcribe
              </button>
            </div>
          )}

          {/* Transcribing loader */}
          {isTranscribing && (
            <div className="mb-2 bg-amber-950/60 border border-amber-500/40 rounded-xl px-3 py-2 flex items-center gap-2 text-amber-300 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Transcribing audio with Gemini 3.5 Flash Speech-to-Text...</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone Speech-to-Text Button */}
            <button
              type="button"
              onClick={startVoiceRecording}
              disabled={isLoading || isTranscribing}
              className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                isRecording
                  ? "bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-900/60 animate-bounce"
                  : "bg-slate-900/90 text-amber-300 border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/40"
              }`}
              title={isRecording ? "Stop Recording" : "Speak with Microphone (Gemini Audio Transcription)"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask ${currentPersona.name} in ${selectedLanguage} or English... (e.g. 'Explain Vedic mathematics and zero')`}
              disabled={isLoading || isRecording}
              className="flex-1 bg-slate-900/90 border border-amber-500/30 focus:border-amber-400 rounded-xl px-4 py-3 text-xs sm:text-sm text-amber-100 placeholder:text-amber-400/40 focus:outline-none shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || isRecording}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-4 sm:px-6 py-3 rounded-xl shadow-lg shadow-amber-950/60 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="hidden sm:inline text-xs sm:text-sm">Inquire</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-amber-400/50 mt-2 px-1">
            <span>Mode: {selectedMode === "fast" ? "⚡ Fast (3.1 Flash-Lite)" : selectedMode === "search" ? "🔍 Search Grounding (3.5 Flash)" : selectedMode === "thinking" ? "🧠 High Thinking (3.1 Pro)" : "⚖️ Balanced (3.5 Flash)"}</span>
            <span className="font-indic">ॐ शान्तिः शान्तिः शान्तिः</span>
          </div>
        </div>
      </div>
    </div>
  );
};
