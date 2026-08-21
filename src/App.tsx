import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ChatSection } from "./components/ChatSection";
import { ExplorerSection } from "./components/ExplorerSection";
import { StorytellerSection } from "./components/StorytellerSection";
import { GitaWisdomSection } from "./components/GitaWisdomSection";
import { QuizSection } from "./components/QuizSection";
import { TranslateStudio } from "./components/TranslateStudio";
import { SavedVaultSection } from "./components/SavedVaultSection";
import { AdminPanel } from "./components/AdminPanel";
import { LoginPage } from "./components/LoginPage";
import { DeploymentModal } from "./components/DeploymentModal";
import { Footer } from "./components/Footer";
import { VedicWisdomWidget } from "./components/VedicWisdomWidget";
import { TodayInHistoryCard } from "./components/TodayInHistoryCard";
import { IndicLanguageCode, NavigationTab, SavedItem, AppUser, AppTheme } from "./types";
import { soundscape } from "./services/audioSynth";
import { TabSectionSkeleton } from "./components/SkeletonLoader";
import {
  getCurrentUser,
  logoutUser,
  getSavedLanguagePreference,
  updateUserPreferredLanguage,
} from "./services/authService";

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState<NavigationTab>("chat");
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const savedTheme = localStorage.getItem("bharat_gpt_theme") as AppTheme;
      return savedTheme === "temple_ivory" ? "temple_ivory" : "deep_night";
    } catch {
      return "deep_night";
    }
  });
  const [selectedLanguage, setSelectedLanguage] = useState<IndicLanguageCode>(() => {
    return getSavedLanguagePreference();
  });
  const [isAudioDronePlaying, setIsAudioDronePlaying] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [prefilledChatPrompt, setPrefilledChatPrompt] = useState<string>("");
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const saved = localStorage.getItem("bharat_gpt_vault");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync theme class with body element
  useEffect(() => {
    try {
      localStorage.setItem("bharat_gpt_theme", theme);
    } catch (e) {
      console.error(e);
    }
    if (theme === "temple_ivory") {
      document.body.classList.add("theme-temple-ivory");
    } else {
      document.body.classList.remove("theme-temple-ivory");
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "deep_night" ? "temple_ivory" : "deep_night"));
  };

  // Sync language changes to user profile database and localStorage
  const handleLanguageChange = (newLang: IndicLanguageCode) => {
    setSelectedLanguage(newLang);
    const updatedUser = updateUserPreferredLanguage(currentUser?.id, newLang);
    if (updatedUser && currentUser) {
      setCurrentUser(updatedUser);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem("bharat_gpt_vault", JSON.stringify(savedItems));
    } catch (e) {
      console.error(e);
    }
  }, [savedItems]);

  const handleToggleDroneAudio = () => {
    const isPlaying = soundscape.toggleDrone();
    setIsAudioDronePlaying(isPlaying);
  };

  const handleSaveItem = (item: SavedItem) => {
    setSavedItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [item, ...prev];
    });
  };

  const handleRemoveSavedItem = (id: string) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAskBharatGPTFromExplorer = (prompt: string) => {
    setPrefilledChatPrompt(prompt);
    setActiveTab("chat");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setActiveTab("chat");
  };

  // If not logged in, display the sacred Authentication Gate
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.preferredLanguage) {
            setSelectedLanguage(user.preferredLanguage);
          }
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  const isLight = theme === "temple_ivory";

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors ${
        isLight ? "bg-[#faf7f2] text-stone-900" : "bg-[#070b14] text-amber-100"
      }`}
    >
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={handleLanguageChange}
        isAudioPlaying={isAudioDronePlaying}
        onToggleAudio={handleToggleDroneAudio}
        savedCount={savedItems.length}
        onOpenDeployGuide={() => setIsDeployModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full pb-12">
        {/* Daily-changing Today in History & Vedic Wisdom Widgets upon page load */}
        {activeTab !== "admin" && (
          <div className="space-y-4">
            <TodayInHistoryCard
              selectedLanguage={selectedLanguage}
              onSaveItem={handleSaveItem}
              onAskAboutEvent={handleAskBharatGPTFromExplorer}
            />
            <VedicWisdomWidget
              selectedLanguage={selectedLanguage}
              onSaveItem={handleSaveItem}
              onAskAboutVerse={handleAskBharatGPTFromExplorer}
            />
          </div>
        )}

        {activeTab === "chat" && (
          <ChatSection
            selectedLanguage={selectedLanguage}
            onSaveItem={handleSaveItem}
            prefilledPrompt={prefilledChatPrompt}
            onClearPrefilledPrompt={() => setPrefilledChatPrompt("")}
          />
        )}

        {activeTab === "explorer" && (
          <ExplorerSection
            onAskBharatGPT={handleAskBharatGPTFromExplorer}
            onSaveItem={handleSaveItem}
          />
        )}

        {activeTab === "story" && (
          <StorytellerSection
            selectedLanguage={selectedLanguage}
            onSaveItem={handleSaveItem}
          />
        )}

        {activeTab === "gita" && (
          <GitaWisdomSection
            selectedLanguage={selectedLanguage}
            onSaveItem={handleSaveItem}
          />
        )}

        {activeTab === "quiz" && <QuizSection />}

        {activeTab === "translate" && <TranslateStudio />}

        {activeTab === "vault" && (
          <SavedVaultSection
            savedItems={savedItems}
            onRemoveItem={handleRemoveSavedItem}
            onNavigateToTab={(tab) => setActiveTab(tab as NavigationTab)}
          />
        )}

        {activeTab === "admin" && currentUser.role === "admin" && (
          <AdminPanel
            currentUser={currentUser}
            onAdminCredsUpdated={() => {
              const updatedUser = getCurrentUser();
              if (updatedUser) setCurrentUser(updatedUser);
            }}
          />
        )}
      </main>

      {/* Deployment & Setup Modal */}
      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
