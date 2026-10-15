import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2, Square, Sparkles } from "lucide-react";
import { transcribeAudio } from "../services/geminiService";
import { IndicLanguageCode } from "../types";
import { toast } from "../services/toastService";
import { soundscape } from "../services/audioSynth";

interface AudioTranscribeButtonProps {
  onTranscribe: (text: string) => void;
  language?: IndicLanguageCode;
  className?: string;
  size?: "sm" | "md" | "lg";
  buttonText?: string;
  isLight?: boolean;
}

export const AudioTranscribeButton: React.FC<AudioTranscribeButtonProps> = ({
  onTranscribe,
  language = "English",
  className = "",
  size = "md",
  buttonText,
  isLight = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.show("Audio recording is not supported in this browser environment.", "error");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Determine best mimeType supported
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length === 0) {
          setIsTranscribing(false);
          setIsRecording(false);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setIsTranscribing(true);
        toast.show("Transcribing with Gemini 3.5 Transcribe...", "info", { duration: 3000 });

        try {
          const transcribedText = await transcribeAudio(audioBlob, language);
          setIsTranscribing(false);
          if (transcribedText && transcribedText.trim()) {
            soundscape.playTempleBell();
            onTranscribe(transcribedText.trim());
            toast.show("🎙️ Audio transcribed successfully!", "success", { duration: 3000 });
          } else {
            toast.show("No speech detected. Please speak clearly into the microphone.", "warning", { duration: 4000 });
          }
        } catch (err) {
          console.error("Transcription error:", err);
          setIsTranscribing(false);
          toast.show("Failed to transcribe audio. Please retry or type manually.", "error");
        }
      };

      mediaRecorder.start(250); // collect in 250ms chunks
      setIsRecording(true);
      setRecordingSeconds(0);
      soundscape.playTempleBell();

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            // Cap at 60s
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn("Microphone access error:", err);
      setIsRecording(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        toast.show("Microphone permission denied. Please allow microphone access to speak.", "warning", { duration: 5000 });
      } else {
        toast.show("Microphone could not be accessed. Please check audio device settings.", "error");
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTranscribing) return;

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  // Sizing
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
  const padding = size === "sm" ? "px-2 py-1 text-xs" : size === "lg" ? "px-3.5 py-2 text-sm" : "px-2.5 py-1.5 text-xs";

  if (isTranscribing) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center gap-1.5 rounded-lg border font-medium cursor-wait transition-all ${padding} ${
          isLight
            ? "bg-amber-100/90 border-amber-300 text-amber-800"
            : "bg-amber-950/60 border-amber-500/40 text-amber-300"
        } ${className}`}
        title="Transcribing audio with Gemini 3.5 Transcribe..."
      >
        <Loader2 className={`${iconSize} animate-spin text-amber-500`} />
        <span>Transcribing...</span>
      </button>
    );
  }

  if (isRecording) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center gap-2 rounded-lg border font-medium transition-all shadow-md animate-pulse ${padding} ${
          isLight
            ? "bg-rose-100 border-rose-400 text-rose-800"
            : "bg-rose-950/80 border-rose-500 text-rose-200"
        } ${className}`}
        title="Recording... Click to stop and transcribe"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
        </span>
        <span className="font-mono font-bold">{formatSeconds(recordingSeconds)}</span>
        <span className="text-[11px] font-semibold">Stop</span>
        <Square className="w-3 h-3 fill-rose-500 text-rose-500" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${padding} ${
        isLight
          ? "bg-amber-50 hover:bg-amber-100/80 border-amber-300/80 text-amber-900 shadow-sm"
          : "bg-slate-900/80 hover:bg-slate-800 border-amber-500/30 text-amber-300 hover:text-amber-100 shadow-sm"
      } ${className}`}
      title="Speak to Transcribe with Gemini 3.5 Transcribe"
    >
      <Mic className={`${iconSize} text-amber-500`} />
      {buttonText && <span>{buttonText}</span>}
      <span className="text-[9px] uppercase tracking-wider font-mono opacity-60 ml-0.5 hidden sm:inline">
        Voice
      </span>
    </button>
  );
};
