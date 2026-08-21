import React, { useState } from "react";
import {
  X,
  Terminal,
  Server,
  Cloud,
  Check,
  Copy,
  Database,
  Key,
  Layers,
  Sparkles,
  ExternalLink,
  Code
} from "lucide-react";

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"quick" | "env" | "cloud" | "arch">("quick");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e1628] border border-amber-500/40 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold">
              🚀
            </div>
            <div>
              <h3 className="font-royal text-lg sm:text-xl font-bold text-amber-100">
                Bharat GPT Technical & Deployment Guide
              </h3>
              <p className="text-xs text-amber-300/70">
                How to run locally, configure secret keys, and deploy to production
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300 hover:text-amber-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-amber-500/15 overflow-x-auto">
          {[
            { id: "quick", label: "Quick Start", icon: Terminal },
            { id: "env", label: "Environment & API Keys", icon: Key },
            { id: "cloud", label: "Deploy to Vercel / Cloud Run", icon: Cloud },
            { id: "arch", label: "Architecture & Stack", icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-amber-400 text-amber-300"
                    : "border-transparent text-amber-400/60 hover:text-amber-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-xs sm:text-sm text-amber-100/90 leading-relaxed">
          {activeTab === "quick" && (
            <div className="space-y-4">
              <h4 className="font-royal font-bold text-amber-300 text-sm">
                1. Local Machine Launch (Step-by-Step)
              </h4>
              <p className="text-xs text-amber-200/80">
                You can run the entire Bharat GPT application locally in standard Node.js:
              </p>

              <div className="space-y-3">
                <div className="bg-slate-950 border border-amber-500/20 rounded-xl p-3 font-mono text-xs text-amber-300">
                  <div className="flex items-center justify-between pb-1 border-b border-amber-500/10 mb-2">
                    <span className="text-[10px] text-amber-400/50">Terminal Command</span>
                    <button
                      onClick={() => handleCopy("npm install\nnpm run dev", "step1")}
                      className="text-[10px] text-amber-400 hover:text-amber-200 flex items-center gap-1"
                    >
                      {copiedText === "step1" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <code>npm install</code>
                  <br />
                  <code>npm run dev</code>
                </div>

                <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-200 space-y-1">
                  <strong className="text-amber-300 block font-semibold">Local URL Access:</strong>
                  <p>Open <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 font-mono">http://localhost:3000</code> in your web browser to interact with the live app.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "env" && (
            <div className="space-y-4">
              <h4 className="font-royal font-bold text-amber-300 text-sm">
                2. Environment Variables & Secret Configuration
              </h4>
              <p className="text-xs text-amber-200/80">
                In this AI Studio workspace, the <strong>GEMINI_API_KEY</strong> is injected into runtime automatically. For local or self-hosted deployment, create a <code className="text-amber-300 font-mono">.env</code> file in the root folder:
              </p>

              <div className="bg-slate-950 border border-amber-500/20 rounded-xl p-4 font-mono text-xs text-amber-300 space-y-2">
                <div className="flex justify-between items-center pb-1 border-b border-amber-500/10">
                  <span className="text-[10px] text-amber-400/50">.env File Template</span>
                  <button
                    onClick={() => handleCopy('GEMINI_API_KEY="your-gemini-api-key-here"\nAPP_URL="http://localhost:3000"', "env")}
                    className="text-[10px] text-amber-400 hover:text-amber-200 flex items-center gap-1"
                  >
                    {copiedText === "env" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <code># Google Gemini API Secret Key</code>
                <br />
                <code>GEMINI_API_KEY="your-gemini-api-key-here"</code>
                <br />
                <code>APP_URL="http://localhost:3000"</code>
              </div>
            </div>
          )}

          {activeTab === "cloud" && (
            <div className="space-y-4">
              <h4 className="font-royal font-bold text-amber-300 text-sm">
                3. Production Deployment (Vercel / Google Cloud Run / Docker)
              </h4>
              <div className="space-y-3">
                <div className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-4 space-y-2">
                  <h5 className="font-bold text-amber-200 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-amber-400" />
                    Deploying to Vercel or Cloud Run
                  </h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-amber-200/80">
                    <li>Push your repository to GitHub.</li>
                    <li>Connect the repo in Vercel or Google Cloud Run.</li>
                    <li>Add <code className="text-amber-300 font-mono">GEMINI_API_KEY</code> in the Project Settings Environment Variables.</li>
                    <li>Set Build Command to <code className="text-amber-300 font-mono">npm run build</code> and Start to <code className="text-amber-300 font-mono">npm start</code>.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === "arch" && (
            <div className="space-y-4">
              <h4 className="font-royal font-bold text-amber-300 text-sm">
                4. Architecture & Design System
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-3 space-y-1">
                  <strong className="text-amber-300 block">Frontend Stack:</strong>
                  <p>React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Web Audio API Soundscapes.</p>
                </div>
                <div className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-3 space-y-1">
                  <strong className="text-amber-300 block">Backend & AI:</strong>
                  <p>Express 4, @google/genai SDK with Gemini 3.7 Flash, Server-Side API proxies.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-500/20 flex items-center justify-between bg-slate-950/60">
          <p className="text-[11px] text-amber-300/60">
            For source package and admin operations, log in as Super Admin.
          </p>

          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
