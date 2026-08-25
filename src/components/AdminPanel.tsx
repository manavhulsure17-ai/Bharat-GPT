import React, { useState } from "react";
import {
  ShieldCheck,
  Key,
  Users,
  FileText,
  Download,
  Trash2,
  Lock,
  Mail,
  Check,
  AlertCircle,
  CheckCircle2,
  Server,
  Activity,
  Cpu,
  BookOpen,
  Code,
  Terminal,
  Cloud,
  Layers,
  Copy,
  FileType,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { AppUser, AdminCredentials } from "../types";
import {
  getAdminCredentials,
  updateAdminCredentials,
  getAllUsers,
  deleteUserByAdmin
} from "../services/authService";
import { ZERO_TO_HERO_MASTER_GUIDE } from "../data/masterGuideData";
import { generateFullProjectZip } from "../services/zipExportService";
import { soundscape } from "../services/audioSynth";
import { AdminAnalyticsDashboard } from "./AdminAnalyticsDashboard";
import { toast } from "../services/toastService";

interface AdminPanelProps {
  currentUser: AppUser;
  onAdminCredsUpdated?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onAdminCredsUpdated,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"analytics" | "users" | "security" | "guide" | "system">("analytics");

  // Admin credentials state
  const [adminCreds, setAdminCreds] = useState<AdminCredentials>(getAdminCredentials());
  const [newAdminEmail, setNewAdminEmail] = useState(adminCreds.email);
  const [newAdminPassword, setNewAdminPassword] = useState(adminCreds.password);
  const [adminUpdateMsg, setAdminUpdateMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Users database state
  const [usersList, setUsersList] = useState<AppUser[]>(getAllUsers());
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleUpdateAdminSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminUpdateMsg(null);

    try {
      const updated = updateAdminCredentials(newAdminEmail, newAdminPassword);
      setAdminCreds(updated);
      soundscape.playTempleBell();
      toast.success("Super Admin credentials updated successfully!", { title: "Security" });
      setAdminUpdateMsg({
        text: "Super Admin credentials updated and persisted successfully!",
        type: "success",
      });
      if (onAdminCredsUpdated) onAdminCredsUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to update admin credentials.", { title: "Update Error" });
      setAdminUpdateMsg({
        text: err.message || "Failed to update admin credentials.",
        type: "error",
      });
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to remove user "${userName}"?`)) {
      const updated = deleteUserByAdmin(userId);
      setUsersList(updated);
      soundscape.playTempleBell();
      toast.info(`User "${userName}" has been removed.`, { title: "User Removed" });
    }
  };

  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zipBlob = await generateFullProjectZip();
      const element = document.createElement("a");
      element.href = URL.createObjectURL(zipBlob);
      element.download = "Bharat_GPT_Full_Project_And_Guide.zip";
      document.body.appendChild(element);
      element.click();
      element.remove();
      soundscape.playTempleBell();
      toast.success("Downloaded complete project codebase & assets as ZIP!", { title: "ZIP Export" });
    } catch (e) {
      console.error("ZIP export failed", e);
      toast.error("Failed to generate ZIP package.", { title: "Export Error" });
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadMasterGuide = () => {
    const element = document.createElement("a");
    const file = new Blob([ZERO_TO_HERO_MASTER_GUIDE], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = "Prajna_BharatGPT_Zero_to_100_Master_Build_and_Deployment_Guide.md";
    document.body.appendChild(element);
    element.click();
    element.remove();
    soundscape.playTempleBell();
    toast.success("Master Build & Deployment Guide downloaded!", { title: "Guide Downloaded" });
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success("Command copied to clipboard!", { title: "Copied" });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fadeIn">
      {/* Title & Master Admin Badge */}
      <div className="bg-gradient-to-r from-[#17120a] via-[#1a150e] to-[#0f1422] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-0.5 shadow-lg shadow-orange-950/60 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d1322] rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-royal text-xl sm:text-2xl font-bold text-amber-100">
                  Prajna BharatGPT Super Admin Console
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-mono">
                  Master Root
                </span>
              </div>
              <p className="text-xs text-amber-300/80">
                Logged in as: <strong className="text-amber-200">{currentUser.name}</strong> ({currentUser.email})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-950/60 transition-all hover:scale-[1.02] disabled:opacity-50"
              title="Download the full application architecture and step-by-step guides as a ZIP file"
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? "Generating ZIP..." : "Download Full Project ZIP"}</span>
            </button>

            <button
              onClick={handleDownloadMasterGuide}
              className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 text-amber-200 font-bold px-3.5 py-2.5 rounded-xl text-xs shadow-md transition-all hover:scale-[1.02]"
              title="Download the full 0% to 100% build & deployment documentation"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Guide (.md)</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Ribbon */}
        <div className="flex items-center gap-2 pt-4 border-t border-amber-500/20 overflow-x-auto">
          {[
            { id: "analytics", label: "Analytics & Trends", icon: TrendingUp },
            { id: "users", label: `User Database (${usersList.length})`, icon: Users },
            { id: "security", label: "Admin Security & Passwords", icon: Key },
            { id: "guide", label: "0% to 100% Master Build Guide", icon: FileText },
            { id: "system", label: "System Telemetry & Health", icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold"
                    : "bg-slate-900/60 text-amber-300/70 hover:text-amber-100 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 0. ANALYTICS & ACTIVITY DASHBOARD */}
      {/* ========================================================================= */}
      {activeSubTab === "analytics" && (
        <AdminAnalyticsDashboard users={usersList} />
      )}

      {/* ========================================================================= */}
      {/* 1. USER DATABASE DIRECTORY */}
      {/* ========================================================================= */}
      {activeSubTab === "users" && (
        <div className="bg-[#0e1628] border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-royal text-lg font-bold text-amber-200 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Registered Users Directory</span>
              </h3>
              <p className="text-xs text-amber-300/70">
                View, audit, and manage user accounts created in Prajna BharatGPT.
              </p>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full bg-slate-950 border border-amber-500/30 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-amber-100 placeholder-amber-400/30 focus:outline-none"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto border border-amber-500/20 rounded-2xl">
            <table className="w-full text-left text-xs text-amber-100/90">
              <thead className="bg-slate-950 text-amber-400 font-bold uppercase tracking-wider text-[10px] border-b border-amber-500/20">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Saved Bhasha</th>
                  <th className="p-3.5">Created At</th>
                  <th className="p-3.5">Last Login</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {/* Super Admin Row */}
                <tr className="bg-amber-950/20 hover:bg-amber-950/30 transition-colors">
                  <td className="p-3.5 font-bold text-amber-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Manav Hulsure (Super Admin)</span>
                  </td>
                  <td className="p-3.5 font-mono text-amber-300">{adminCreds.email}</td>
                  <td className="p-3.5">
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      SUPER ADMIN
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                      {currentUser?.preferredLanguage || "English"}
                    </span>
                  </td>
                  <td className="p-3.5 text-amber-400/60">System Root</td>
                  <td className="p-3.5 text-amber-400/60">Active Now</td>
                  <td className="p-3.5 text-right text-[11px] text-amber-400/50 italic">
                    Protected Root
                  </td>
                </tr>

                {/* Registered Normal Users */}
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3.5 font-medium text-amber-100">{u.name}</td>
                    <td className="p-3.5 font-mono text-amber-300/80">{u.email}</td>
                    <td className="p-3.5">
                      <span className="bg-slate-800 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/20">
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[11px] bg-slate-900 text-amber-300/90 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        {u.preferredLanguage || "English"}
                      </span>
                    </td>
                    <td className="p-3.5 text-amber-400/60 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-amber-400/60 font-mono text-[11px]">
                      {new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-amber-400/60 text-xs">
                      No additional regular users registered yet. New users can create accounts from the login screen.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADMIN SECURITY & PASSWORD MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === "security" && (
        <div className="bg-[#0e1628] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <h3 className="font-royal text-lg font-bold text-amber-200 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <span>Admin Security & Credentials Manager</span>
            </h3>
            <p className="text-xs text-amber-300/70">
              Modify the master admin email and password. Changes persist in local storage and take effect immediately.
            </p>
          </div>

          {adminUpdateMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                adminUpdateMsg.type === "success"
                  ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-200"
                  : "bg-rose-950/80 border border-rose-500/50 text-rose-200"
              }`}
            >
              {adminUpdateMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{adminUpdateMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateAdminSecurity} className="max-w-xl space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Super Admin Google Email ID</span>
              </label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="manavhulsure80@gmail.com"
                className="w-full bg-slate-950 border border-amber-500/30 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-amber-100 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Master Admin Password / PIN (Min 6 chars)</span>
              </label>
              <input
                type="text"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Bharatgpt@sarm"
                className="w-full bg-slate-950 border border-amber-500/30 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-amber-100 focus:outline-none"
                required
                minLength={6}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-950/60 transition-all hover:scale-[1.02]"
              >
                Save New Admin Credentials
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ZERO TO HERO 0% TO 100% COMPLETE BUILD & DEPLOYMENT GUIDE */}
      {/* ========================================================================= */}
      {activeSubTab === "guide" && (
        <div className="bg-[#0e1628] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
            <div>
              <h3 className="font-royal text-lg sm:text-xl font-bold text-amber-200 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Prajna BharatGPT: 0% to 100% Complete Master Build & Deployment Guide</span>
              </h3>
              <p className="text-xs text-amber-300/70">
                A complete zero-to-hero manual explaining the architecture, dependencies, local setup, and production hosting.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isZipping ? "Generating ZIP..." : "Download Full ZIP"}</span>
              </button>

              <button
                onClick={handleDownloadMasterGuide}
                className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>.MD Guide</span>
              </button>
            </div>
          </div>

          {/* Guide Sections */}
          <div className="space-y-6 text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            {/* Step 1 */}
            <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-5 space-y-3">
              <h4 className="font-royal font-bold text-amber-300 text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-extrabold">1</span>
                <span>Civilizational Architecture & Model Integration</span>
              </h4>
              <p className="text-amber-200/80">
                Prajna BharatGPT connects to Google DeepMind's <strong>Gemini 3.7 Flash</strong> using the modern <code className="text-amber-300 font-mono">@google/genai</code> SDK. It features 5 specialized Indic personas with customized system prompts:
              </p>
              <ul className="list-disc list-inside space-y-1 text-amber-300/90 pl-2">
                <li><strong>Vedic Scholar (आचार्य)</strong>: Direct Sanskrit references, Upanishadic context, and metaphysical clarity.</li>
                <li><strong>Forest Sage (ऋषि)</strong>: Compassionate, contemplative meditation, and inner equanimity.</li>
                <li><strong>Imperial Chronicler (इतिहासकार)</strong>: Historical accuracy across Cholas, Mauryas, Guptas, and Marathas.</li>
                <li><strong>Ancient Scientist (विज्ञानी)</strong>: Ayurveda (Charaka/Sushruta), Metallurgy (Wootz steel, Delhi Pillar), and Astronomy (Aryabhata).</li>
                <li><strong>Mythological Bard (कथाकार)</strong>: Engaging episodic narration for Ramayana and Mahabharata.</li>
              </ul>
            </div>

            {/* Step 2: Tech Stack */}
            <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-5 space-y-3">
              <h4 className="font-royal font-bold text-amber-300 text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-extrabold">2</span>
                <span>Core Dependencies & Why They Were Selected</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#0e1628] p-3 rounded-xl border border-amber-500/20">
                  <strong className="text-amber-200 block text-xs">React 18 + Vite + TypeScript</strong>
                  <span className="text-[11px] text-amber-400/70">Ensures strict type-safety across all shlokas, chat messages, and user states with sub-second dev server boots.</span>
                </div>
                <div className="bg-[#0e1628] p-3 rounded-xl border border-amber-500/20">
                  <strong className="text-amber-200 block text-xs">Web Audio API Synth (Procedural)</strong>
                  <span className="text-[11px] text-amber-400/70">Custom audio synthesizer producing a 4-string Tanpura drone (Sa-Pa harmonic oscillation) and brass temple bell with 0 MB MP3 dependencies.</span>
                </div>
                <div className="bg-[#0e1628] p-3 rounded-xl border border-amber-500/20">
                  <strong className="text-amber-200 block text-xs">jsPDF Document Engine</strong>
                  <span className="text-[11px] text-amber-400/70">Compiles the user's Smriti Kosh vault into offline A4 PDF booklets with saffron covers and clean typography.</span>
                </div>
                <div className="bg-[#0e1628] p-3 rounded-xl border border-amber-500/20">
                  <strong className="text-amber-200 block text-xs">Tailwind CSS Custom Saffron Palette</strong>
                  <span className="text-[11px] text-amber-400/70">Adheres strictly to the Anti-Slop aesthetic guidelines: deep obsidian night canvas with warm saffron and golden accents.</span>
                </div>
              </div>
            </div>

            {/* Step 3: Local Launch */}
            <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-5 space-y-3">
              <h4 className="font-royal font-bold text-amber-300 text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-extrabold">3</span>
                <span>Local Machine Execution (Terminal Commands)</span>
              </h4>
              <div className="bg-[#0a0f1d] border border-amber-500/20 rounded-xl p-3 font-mono text-xs text-amber-300 relative">
                <button
                  onClick={() => handleCopyText("npm install\nnpm run dev", "local_cmd")}
                  className="absolute right-3 top-3 text-[10px] text-amber-400 hover:text-amber-200 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/30"
                >
                  {copiedCode === "local_cmd" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === "local_cmd" ? "Copied" : "Copy"}</span>
                </button>
                <p className="text-amber-400/60"># 1. Install packages</p>
                <p>npm install</p>
                <p className="text-amber-400/60 mt-2"># 2. Launch live development server</p>
                <p>npm run dev</p>
              </div>
            </div>

            {/* Step 4: Cloud Run & Vercel Deployment */}
            <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-5 space-y-3">
              <h4 className="font-royal font-bold text-amber-300 text-sm sm:text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-extrabold">4</span>
                <span>Production Deployment Commands</span>
              </h4>
              <div className="bg-[#0a0f1d] border border-amber-500/20 rounded-xl p-3 font-mono text-xs text-amber-300 relative space-y-1">
                <button
                  onClick={() => handleCopyText("gcloud run deploy bharat-gpt --source . --platform managed --allow-unauthenticated", "cloud_cmd")}
                  className="absolute right-3 top-3 text-[10px] text-amber-400 hover:text-amber-200 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/30"
                >
                  {copiedCode === "cloud_cmd" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === "cloud_cmd" ? "Copied" : "Copy"}</span>
                </button>
                <p className="text-amber-400/60"># Google Cloud Run deploy</p>
                <p>gcloud run deploy bharat-gpt \</p>
                <p>  --source . \</p>
                <p>  --platform managed \</p>
                <p>  --allow-unauthenticated</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SYSTEM TELEMETRY & STATUS */}
      {/* ========================================================================= */}
      {activeSubTab === "system" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0e1628] border border-amber-500/30 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/70 block">
              AI Engine Model
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-amber-100 text-sm">Gemini 3.7 Flash</span>
            </div>
            <p className="text-[11px] text-amber-400/60">
              Active with Indic grounding, high token throughput, and multi-turn persona context.
            </p>
          </div>

          <div className="bg-[#0e1628] border border-amber-500/30 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/70 block">
              Tanpura Synth Engine
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="font-bold text-amber-100 text-sm">Web Audio API</span>
            </div>
            <p className="text-[11px] text-amber-400/60">
              Low-latency procedural acoustic oscillator tuned to C# (138.59 Hz) base fundamental.
            </p>
          </div>

          <div className="bg-[#0e1628] border border-amber-500/30 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/70 block">
              Client Local Footprint
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              <span className="font-bold text-amber-100 text-sm">Offline-First Cached</span>
            </div>
            <p className="text-[11px] text-amber-400/60">
              Users, chapters progress, and saved vaults securely saved in browser storage.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
