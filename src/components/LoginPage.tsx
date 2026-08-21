import React, { useState } from "react";
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon
} from "lucide-react";
import { registerUser, loginUser } from "../services/authService";
import { AppUser, AppTheme } from "../types";
import { soundscape } from "../services/audioSynth";

interface LoginPageProps {
  onLoginSuccess: (user: AppUser) => void;
  theme?: AppTheme;
  onToggleTheme?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  theme = "deep_night",
  onToggleTheme,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLight = theme === "temple_ivory";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // Register new user
        if (!name.trim()) {
          throw new Error("Please enter your full name.");
        }
        if (!email.trim() || !email.includes("@")) {
          throw new Error("Please enter a valid Google / email address.");
        }
        if (!pin || pin.length < 6) {
          throw new Error("Please enter a password or PIN with at least 6 characters or digits.");
        }

        const newUser = registerUser(name, email, pin);
        soundscape.playTempleBell();
        setSuccessMsg(`Welcome to Bharat GPT, ${newUser.name}! Your account has been created.`);
        setTimeout(() => {
          onLoginSuccess(newUser);
        }, 600);
      } else {
        // Sign in existing user or admin
        if (!email.trim()) {
          throw new Error("Please enter your registered email ID.");
        }
        if (!pin) {
          throw new Error("Please enter your password / PIN.");
        }

        const user = loginUser(email, pin);
        soundscape.playTempleBell();
        setSuccessMsg(`Welcome back, ${user.name}!`);
        setTimeout(() => {
          onLoginSuccess(user);
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden transition-colors ${
        isLight ? "bg-[#faf7f2] text-stone-900" : "bg-[#070b14] text-amber-100"
      }`}
    >
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header
        className={`p-4 sm:p-6 flex items-center justify-between border-b relative z-10 transition-colors ${
          isLight
            ? "bg-[#faf7f2]/95 border-amber-300/60 text-stone-900"
            : "bg-[#0c111e]/70 border-amber-500/15 text-amber-100 backdrop-blur-md"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-0.5 shadow-lg shadow-orange-950/40 flex items-center justify-center">
            <div
              className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                isLight ? "bg-[#faf7f2]" : "bg-[#0d1322]"
              }`}
            >
              <span className={`text-xl font-serif font-bold ${isLight ? "text-amber-700" : "text-amber-300"}`}>
                भ
              </span>
            </div>
          </div>
          <div>
            <h1
              className={`font-royal text-lg sm:text-xl font-bold tracking-wider ${
                isLight ? "text-amber-950" : "text-saffron-gradient"
              }`}
            >
              BHARAT GPT
            </h1>
            <p className={`text-[11px] font-indic ${isLight ? "text-stone-600" : "text-amber-300/70"}`}>
              भारत ज्ञान प्रकाश • Indic Civilizational AI
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border shadow-sm transition-all font-medium ${
                isLight
                  ? "bg-stone-200 hover:bg-stone-300 text-stone-800 border-stone-300"
                  : "bg-slate-900 hover:bg-slate-800 text-amber-200 border-amber-500/40"
              }`}
              title={isLight ? "Switch to Deep Night Theme" : "Switch to Temple Ivory Light Theme"}
            >
              {isLight ? <Moon className="w-3.5 h-3.5 text-amber-800" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden sm:inline">{isLight ? "Night Mode" : "Temple Ivory"}</span>
            </button>
          )}

          {/* Sacred Sanskrit Verse */}
          <div
            className={`hidden md:flex items-center gap-2 text-xs px-3 py-1 rounded-full border ${
              isLight
                ? "bg-amber-100/90 border-amber-300/80 text-amber-900 font-medium"
                : "text-amber-300/80 bg-amber-950/40 border-amber-500/20"
            }`}
          >
            <span className={`font-serif ${isLight ? "text-amber-800" : "text-amber-400"}`}>ॐ</span>
            <span className="font-indic">असतो मा सद्गमय • तमसो मा ज्योतिर्गमय</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div
          className={`max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl border-2 transition-colors ${
            isLight
              ? "bg-[#faf7f2]/95 border-amber-300 text-stone-900 shadow-amber-900/10"
              : "bg-[#0e1628]/95 border-amber-500/40 text-amber-100"
          }`}
        >
          {/* Saffron Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-orange-600" />

          {/* Form Header */}
          <div className="text-center space-y-1.5 pt-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-500 mb-1 shadow-inner">
              <KeyRound className="w-6 h-6 text-amber-500" />
            </div>
            <h2 className={`font-royal text-xl sm:text-2xl font-bold ${isLight ? "text-amber-950" : "text-amber-100"}`}>
              {isRegisterMode ? "Create Bharat GPT Account" : "Sign In to Bharat GPT"}
            </h2>
            <p className={`text-xs ${isLight ? "text-stone-600" : "text-amber-300/70"}`}>
              {isRegisterMode
                ? "Enter your details to explore Indic wisdom, stories, and heritage."
                : "Enter your registered credentials to access your personalized portal."}
            </p>
          </div>

          {/* Tab Switcher: Sign In vs Create Account */}
          <div
            className={`grid grid-cols-2 p-1 rounded-2xl border text-xs font-semibold ${
              isLight ? "bg-stone-200/80 border-stone-300 text-stone-700" : "bg-slate-900/90 border-amber-500/20"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                !isRegisterMode
                  ? isLight
                    ? "bg-white text-amber-950 shadow-sm border border-amber-300 font-bold"
                    : "bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold shadow-md"
                  : isLight
                  ? "text-stone-600 hover:text-stone-900"
                  : "text-amber-300/70 hover:text-amber-100"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                isRegisterMode
                  ? isLight
                    ? "bg-white text-amber-950 shadow-sm border border-amber-300 font-bold"
                    : "bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold shadow-md"
                  : isLight
                  ? "text-stone-600 hover:text-stone-900"
                  : "text-amber-300/70 hover:text-amber-100"
              }`}
            >
              New Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-xl flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input (Shown in Register mode) */}
            {isRegisterMode && (
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? "text-stone-800" : "text-amber-300"}`}>
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span>1. Full Name</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition-colors ${
                      isLight
                        ? "bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-500"
                        : "bg-slate-950/90 border-amber-500/30 text-amber-100 placeholder-amber-400/30 focus:border-amber-400"
                    }`}
                    required={isRegisterMode}
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? "text-stone-800" : "text-amber-300"}`}>
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>{isRegisterMode ? "2. Google Email ID" : "Google Email ID"}</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition-colors ${
                    isLight
                      ? "bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-500"
                      : "bg-slate-950/90 border-amber-500/30 text-amber-100 placeholder-amber-400/30 focus:border-amber-400"
                  }`}
                  required
                />
              </div>
            </div>

            {/* Password / 6-digit PIN Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? "text-stone-800" : "text-amber-300"}`}>
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isRegisterMode ? "3. Password / 6-digit PIN" : "Password / PIN"}</span>
                </label>
                <span className={`text-[10px] font-mono ${isLight ? "text-stone-500" : "text-amber-400/60"}`}>Min 6 chars</span>
              </div>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter at least 6 letters or digits"
                  className={`w-full border rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none transition-colors ${
                    isLight
                      ? "bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-500"
                      : "bg-slate-950/90 border-amber-500/30 text-amber-100 placeholder-amber-400/30 focus:border-amber-400"
                  }`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-amber-400/60 dark:hover:text-amber-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <span>{isRegisterMode ? "Create Account & Enter" : "Sign In to Bharat GPT"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-amber-400/60 border-t border-amber-500/10 bg-[#0c111e]/50 backdrop-blur-sm relative z-10">
        <p>
          ॐ Bharat GPT • Preserving Sacred Indian Heritage & Philosophy with Modern Artificial Intelligence
        </p>
      </footer>
    </div>
  );
};
