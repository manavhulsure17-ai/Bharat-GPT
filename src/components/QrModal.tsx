import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  Smartphone,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  Camera,
  Layers,
  Sparkles,
  ShieldCheck,
  X
} from "lucide-react";
import { toast } from "../services/toastService";

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "deep_night" | "temple_ivory";
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, theme = "deep_night" }) => {
  const [copied, setCopied] = useState(false);
  const [urlMode, setUrlMode] = useState<"production" | "current">("current");
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentWindowUrl = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
  const productionUrl = "https://ais-pre-5iwssqoubspxlixvxkkbnb-114245060399.asia-east1.run.app";

  // Target URL based on selected tab or active window
  const activeQrUrl = urlMode === "current" && currentWindowUrl.startsWith("http")
    ? currentWindowUrl
    : productionUrl;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Portal URL copied to clipboard!", { title: "Copied Link" });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      if (ctx) {
        // Draw background
        ctx.fillStyle = theme === "temple_ivory" ? "#faf7f2" : "#0c1222";
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 50, 50, 500, 500);
        
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = "Prajna-BharatGPT-Scan-QR.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success("QR Code image downloaded successfully!", { title: "QR Code" });
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const isLight = theme === "temple_ivory";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 overflow-hidden border-2 transition-colors ${
          isLight
            ? "bg-[#faf7f2] border-amber-300 text-stone-900 shadow-amber-900/10"
            : "bg-[#0c1222] border-amber-500/40 text-amber-100 shadow-2xl"
        }`}
      >
        {/* Top saffron accent glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-orange-600" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-xl border transition-colors ${
            isLight
              ? "bg-stone-200/80 hover:bg-stone-300 text-stone-700 border-stone-300"
              : "bg-slate-900/80 hover:bg-slate-800 text-amber-300 hover:text-amber-100 border-amber-500/30"
          }`}
          title="Close QR Code Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-500 mb-1 shadow-inner">
            <QrCode className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className={`font-royal text-xl sm:text-2xl font-bold ${isLight ? "text-amber-900" : "text-saffron-gradient"}`}>
            Scan to Open Prajna BharatGPT
          </h2>
          <p className={`text-xs sm:text-sm ${isLight ? "text-stone-600" : "text-amber-300/80"}`}>
            Point your smartphone camera or Google Lens to instantly launch the login / sign-in screen.
          </p>
        </div>

        {/* URL Target Selector Toggle */}
        <div className="flex items-center justify-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setUrlMode("current")}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              urlMode === "current"
                ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                : isLight
                ? "bg-stone-200/80 text-stone-700 border-stone-300 hover:bg-stone-200"
                : "bg-slate-900 text-amber-300 border-amber-500/30 hover:bg-slate-800"
            }`}
          >
            Current Active URL
          </button>
          <button
            type="button"
            onClick={() => setUrlMode("production")}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              urlMode === "production"
                ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                : isLight
                ? "bg-stone-200/80 text-stone-700 border-stone-300 hover:bg-stone-200"
                : "bg-slate-900 text-amber-300 border-amber-500/30 hover:bg-slate-800"
            }`}
          >
            Production URL
          </button>
        </div>

        {/* QR Code Canvas Card */}
        <div
          className={`flex flex-col items-center justify-center p-5 rounded-2xl shadow-inner space-y-3 border ${
            isLight ? "bg-stone-100/90 border-stone-300" : "bg-slate-950/90 border-amber-500/30"
          }`}
        >
          <div
            ref={qrRef}
            className="p-3.5 bg-white rounded-2xl shadow-xl border-4 border-amber-400 flex items-center justify-center"
          >
            <QRCodeSVG
              value={activeQrUrl}
              size={210}
              level="M"
              includeMargin={true}
            />
          </div>

          <div className="text-center space-y-1">
            <div className={`flex items-center justify-center gap-1.5 text-xs font-semibold ${isLight ? "text-amber-800" : "text-amber-300"}`}>
              <Smartphone className="w-4 h-4 text-amber-500" />
              <span>Works with Google Lens, iOS Camera & Android QR Scanners</span>
            </div>
            <p className={`text-[11px] truncate max-w-xs font-mono select-all ${isLight ? "text-stone-500" : "text-amber-400/60"}`}>
              {activeQrUrl}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleCopyLink(activeQrUrl)}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
              isLight
                ? "bg-white hover:bg-stone-50 border-stone-300 text-stone-800"
                : "bg-slate-900/90 hover:bg-slate-800 border-amber-500/30 text-amber-200"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-500" />
                <span>Copy App URL</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res QR</span>
          </button>
        </div>

        {/* Step by Step Instruction Card */}
        <div
          className={`border rounded-xl p-3 space-y-1.5 text-xs ${
            isLight ? "bg-amber-50/80 border-amber-200 text-stone-700" : "bg-[#0e1628] border-amber-500/20 text-amber-200/80"
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
            <Camera className="w-3.5 h-3.5 text-amber-500" />
            <span>Direct Scanning Instructions:</span>
          </div>
          <ol className={`list-decimal list-inside space-y-1 text-[11px] ${isLight ? "text-stone-600" : "text-amber-300/70"}`}>
            <li>Open your phone's <strong>Camera</strong> or <strong>Google Lens</strong> app.</li>
            <li>Focus the camera on the QR code square above.</li>
            <li>Tap the link notification that appears to instantly open the <strong>Prajna BharatGPT Login & Portal</strong>.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
