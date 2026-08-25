import React, { useEffect, useState, useRef } from "react";
import {
  Bookmark,
  Globe,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { ToastNotification, ToastType, AppTheme } from "../types";
import { toast } from "../services/toastService";

interface ToastContainerProps {
  theme?: AppTheme;
}

interface ToastItemProps {
  toastData: ToastNotification;
  isLight: boolean;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  toastData,
  isLight,
  onDismiss,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = toastData.duration || 3800;
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, remainingTimeRef.current);
  };

  const clearCurrentTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toastData.id);
    }, 280);
  };

  useEffect(() => {
    startTimer();

    const interval = setInterval(() => {
      if (!isPaused) {
        const elapsed = duration - remainingTimeRef.current + (Date.now() - startTimeRef.current);
        const percent = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(percent);
      }
    }, 40);

    return () => {
      clearCurrentTimer();
      clearInterval(interval);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsPaused(true);
    clearCurrentTimer();
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTimer();
  };

  // Select visual configuration based on toast type
  const getTypeStyles = (type?: ToastType) => {
    switch (type) {
      case "karma":
        return {
          icon: Sparkles,
          badgeBg: isLight
            ? "bg-amber-500/25 text-amber-950 border-amber-400 font-bold"
            : "bg-gradient-to-br from-amber-400/30 via-yellow-500/30 to-orange-500/30 text-yellow-300 border-amber-400/60 font-bold",
          borderColor: isLight ? "border-amber-400 shadow-amber-900/15" : "border-yellow-500/60 shadow-amber-950/80",
          glowColor: isLight ? "shadow-[0_8px_30px_rgba(245,158,11,0.25)]" : "shadow-[0_8px_35px_rgba(234,179,8,0.35)]",
          progressBarColor: isLight ? "bg-gradient-to-r from-amber-600 to-yellow-500" : "bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500",
          headerColor: isLight ? "text-amber-900 font-bold" : "text-amber-200 font-bold",
          symbol: "🌟",
        };
      case "vault":
        return {
          icon: Bookmark,
          badgeBg: isLight ? "bg-amber-500/20 text-amber-900 border-amber-400" : "bg-gradient-to-br from-amber-500/30 to-orange-600/30 text-amber-300 border-amber-500/50",
          borderColor: isLight ? "border-amber-300 shadow-amber-900/10" : "border-amber-500/50 shadow-amber-950/80",
          glowColor: isLight ? "shadow-[0_8px_25px_rgba(217,119,6,0.15)]" : "shadow-[0_8px_30px_rgba(245,158,11,0.25)]",
          progressBarColor: isLight ? "bg-amber-600" : "bg-gradient-to-r from-amber-400 to-orange-500",
          headerColor: isLight ? "text-amber-950" : "text-amber-200 font-bold",
          symbol: "ॐ",
        };
      case "language":
        return {
          icon: Globe,
          badgeBg: isLight ? "bg-orange-500/20 text-orange-950 border-orange-300" : "bg-orange-500/25 text-orange-200 border-orange-500/40",
          borderColor: isLight ? "border-orange-300 shadow-orange-900/10" : "border-orange-500/40 shadow-orange-950/70",
          glowColor: isLight ? "shadow-[0_8px_25px_rgba(234,88,12,0.12)]" : "shadow-[0_8px_30px_rgba(249,115,22,0.2)]",
          progressBarColor: isLight ? "bg-orange-600" : "bg-gradient-to-r from-orange-400 to-amber-500",
          headerColor: isLight ? "text-stone-900" : "text-amber-100",
          symbol: "अ",
        };
      case "theme":
        return {
          icon: isLight ? Moon : Sun,
          badgeBg: isLight ? "bg-stone-200 text-stone-900 border-stone-300" : "bg-amber-400/20 text-amber-300 border-amber-400/40",
          borderColor: isLight ? "border-stone-300 shadow-stone-900/10" : "border-amber-500/40 shadow-amber-950/60",
          glowColor: isLight ? "shadow-md" : "shadow-[0_8px_25px_rgba(245,158,11,0.18)]",
          progressBarColor: isLight ? "bg-stone-600" : "bg-amber-400",
          headerColor: isLight ? "text-stone-900" : "text-amber-100",
          symbol: "☀️",
        };
      case "audio":
        return {
          icon: Volume2,
          badgeBg: isLight ? "bg-emerald-500/20 text-emerald-950 border-emerald-300" : "bg-emerald-500/25 text-emerald-300 border-emerald-500/40",
          borderColor: isLight ? "border-emerald-300" : "border-emerald-500/40",
          glowColor: isLight ? "shadow-md" : "shadow-[0_8px_25px_rgba(16,185,129,0.2)]",
          progressBarColor: isLight ? "bg-emerald-600" : "bg-emerald-400",
          headerColor: isLight ? "text-stone-900" : "text-emerald-200",
          symbol: "🪕",
        };
      case "success":
        return {
          icon: CheckCircle2,
          badgeBg: isLight ? "bg-emerald-500/20 text-emerald-950 border-emerald-300" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          borderColor: isLight ? "border-emerald-300" : "border-emerald-500/40",
          glowColor: isLight ? "shadow-md" : "shadow-[0_8px_25px_rgba(16,185,129,0.2)]",
          progressBarColor: isLight ? "bg-emerald-600" : "bg-emerald-400",
          headerColor: isLight ? "text-stone-900" : "text-emerald-200",
          symbol: "✓",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          badgeBg: isLight ? "bg-amber-500/20 text-amber-950 border-amber-300" : "bg-amber-500/25 text-amber-200 border-amber-500/40",
          borderColor: isLight ? "border-amber-400" : "border-amber-500/50",
          glowColor: isLight ? "shadow-md" : "shadow-[0_8px_25px_rgba(245,158,11,0.2)]",
          progressBarColor: isLight ? "bg-amber-600" : "bg-amber-400",
          headerColor: isLight ? "text-stone-900" : "text-amber-200",
          symbol: "!",
        };
      case "error":
        return {
          icon: AlertTriangle,
          badgeBg: isLight ? "bg-rose-500/20 text-rose-950 border-rose-300" : "bg-rose-500/25 text-rose-300 border-rose-500/40",
          borderColor: isLight ? "border-rose-300" : "border-rose-500/50",
          glowColor: isLight ? "shadow-md" : "shadow-[0_8px_25px_rgba(244,63,94,0.25)]",
          progressBarColor: isLight ? "bg-rose-600" : "bg-rose-500",
          headerColor: isLight ? "text-rose-950" : "text-rose-200",
          symbol: "✕",
        };
      case "info":
      default:
        return {
          icon: Sparkles,
          badgeBg: isLight ? "bg-amber-500/15 text-amber-950 border-amber-300" : "bg-amber-500/20 text-amber-300 border-amber-500/40",
          borderColor: isLight ? "border-amber-300/80" : "border-amber-500/40",
          glowColor: isLight ? "shadow-md" : "shadow-[0_8px_25px_rgba(245,158,11,0.15)]",
          progressBarColor: isLight ? "bg-amber-600" : "bg-amber-400",
          headerColor: isLight ? "text-stone-900" : "text-amber-100",
          symbol: "✨",
        };
    }
  };

  const style = getTypeStyles(toastData.type);
  const IconComponent = style.icon;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden rounded-xl border backdrop-blur-xl transition-all duration-300 transform pointer-events-auto ${
        style.borderColor
      } ${style.glowColor} ${
        isExiting
          ? "opacity-0 translate-x-8 scale-95"
          : "opacity-100 translate-x-0 scale-100 animate-slideInRight"
      } ${
        isLight
          ? "bg-[#faf7f2]/95 text-stone-800"
          : "bg-[#0f172a]/95 text-amber-100"
      }`}
      style={{ minWidth: "290px", maxWidth: "420px" }}
      role="alert"
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        {/* Left Icon Badge */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center ${style.badgeBg} shadow-sm`}
        >
          <IconComponent className="w-4 h-4 animate-pulse" />
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0 pr-1">
          {toastData.title && (
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-xs font-semibold uppercase tracking-wider ${style.headerColor}`}>
                {toastData.title}
              </span>
              <span className="text-[10px] opacity-60 font-serif">{style.symbol}</span>
            </div>
          )}
          <p
            className={`text-xs sm:text-[13px] leading-relaxed break-words font-medium ${
              isLight ? "text-stone-700" : "text-amber-100/90"
            }`}
          >
            {toastData.message}
          </p>

          {/* Action Button (e.g., 'View Vault') */}
          {toastData.action && (
            <button
              onClick={() => {
                toastData.action?.onClick();
                handleDismiss();
              }}
              className={`mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border shadow-sm transition-all hover:scale-[1.02] ${
                isLight
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-400 shadow-amber-950/50"
              }`}
            >
              <span>{toastData.action.label}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 p-1 rounded-md transition-colors ${
            isLight
              ? "text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
              : "text-amber-400/50 hover:text-amber-200 hover:bg-amber-500/10"
          }`}
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className={`h-1 w-full ${isLight ? "bg-stone-200" : "bg-slate-800/80"}`}>
        <div
          className={`h-full transition-all duration-75 ${style.progressBarColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  theme = "deep_night",
}) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const isLight = theme === "temple_ivory";

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToasts) => {
      setToasts(newToasts);
    });
    return () => unsubscribe();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-16 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-[calc(100vw-2rem)] pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastItem
          key={t.id}
          toastData={t}
          isLight={isLight}
          onDismiss={(id) => toast.dismiss(id)}
        />
      ))}
    </div>
  );
};
