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
import { GlobalSearchModal } from "./components/GlobalSearchModal";
import { KarmaBadgeModal } from "./components/KarmaBadgeModal";
import { Footer } from "./components/Footer";
import { VedicWisdomWidget } from "./components/VedicWisdomWidget";
import { TodayInHistoryCard } from "./components/TodayInHistoryCard";
import { IndicLanguageCode, NavigationTab, SavedItem, AppUser, AppTheme, UserKarmaProfile } from "./types";
import { SearchResultItem } from "./services/searchService";
import { soundscape } from "./services/audioSynth";
import { TabSectionSkeleton } from "./components/SkeletonLoader";
import { SacredParticlesBackground } from "./components/SacredParticlesBackground";
import { ToastContainer } from "./components/ToastContainer";
import { toast } from "./services/toastService";
import { karmaService } from "./services/karmaService";
import { INDIC_LANGUAGES } from "./data/configData";
import {
  getCurrentUser,
  logoutUser,
  getSavedLanguagePreference,
  updateUserPreferredLanguage,
} from "./services/authService";

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState<NavigationTab>("chat");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
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
  const [isAudioDronePlaying, setIsAudioDronePlaying] = useState(() => soundscape.isAnySoundscapeActive());
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isKarmaModalOpen, setIsKarmaModalOpen] = useState(false);
  const [karmaProfile, setKarmaProfile] = useState<UserKarmaProfile>(() => karmaService.getProfile());
  const [prefilledChatPrompt, setPrefilledChatPrompt] = useState<string>("");

  // Subscribe to Karma and Soundscape audio updates
  useEffect(() => {
    const unsubscribeKarma = karmaService.subscribe((profile) => {
      setKarmaProfile(profile);
    });
    const unsubscribeSoundscape = soundscape.subscribeSoundscape((state) => {
      setIsAudioDronePlaying(state.isTanpuraPlaying || state.isNaturePlaying);
    });
    // Check daily streak and login bonus
    karmaService.checkDailyDarshan();
    return () => {
      unsubscribeKarma();
      unsubscribeSoundscape();
    };
  }, []);
  
  // Search Target Navigation States
  const [selectedGitaChapterNumber, setSelectedGitaChapterNumber] = useState<number | null>(null);
  const [selectedGitaShlokaId, setSelectedGitaShlokaId] = useState<string | null>(null);
  const [initialStoryPrompt, setInitialStoryPrompt] = useState<string | null>(null);
  const [initialStoryTheme, setInitialStoryTheme] = useState<string | null>(null);
  const [initialHeritageId, setInitialHeritageId] = useState<string | null>(null);

  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const saved = localStorage.getItem("bharat_gpt_vault");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Global Keyboard Shortcut listener for Quick Search (Cmd+K / Ctrl+K or /)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      } else if (e.key === "/" && !isInput) {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

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
    setTheme((prev) => {
      const nextTheme = prev === "deep_night" ? "temple_ivory" : "deep_night";
      toast.theme(
        nextTheme === "temple_ivory"
          ? "Switched to Temple Ivory (Day Mode)"
          : "Switched to Deep Night (Vedic Dark Mode)"
      );
      return nextTheme;
    });
  };

  // Sync language changes to user profile database and localStorage
  const handleLanguageChange = (newLang: IndicLanguageCode) => {
    setSelectedLanguage(newLang);
    const updatedUser = updateUserPreferredLanguage(currentUser?.id, newLang);
    if (updatedUser && currentUser) {
      setCurrentUser(updatedUser);
    }
    const langObj = INDIC_LANGUAGES.find((l) => l.code === newLang);
    toast.language(
      `Language set to ${langObj?.native || newLang} (${langObj?.label || newLang})`,
      {
        icon: "🌐",
      }
    );
  };

  useEffect(() => {
    try {
      localStorage.setItem("bharat_gpt_vault", JSON.stringify(savedItems));
    } catch (e) {
      console.error(e);
    }
  }, [savedItems]);

  const handleToggleDroneAudio = () => {
    if (soundscape.isAnySoundscapeActive()) {
      soundscape.setSoundscapePreset("off");
      toast.audio("Ambient soundscapes paused", {
        title: "Soundscapes • Off",
      });
    } else {
      soundscape.setSoundscapePreset("both");
      toast.audio("Ashram Harmony activated (Tanpura + Zen Nature stream & birds)", {
        title: "Ashram Harmony • On",
        icon: "🪷",
      });
    }
  };

  const handleSaveItem = (item: SavedItem) => {
    setSavedItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        toast.info(`"${item.title.substring(0, 32)}${item.title.length > 32 ? '...' : ''}" is already in your Smriti Vault.`, {
          title: "Already Saved",
        });
        return prev;
      }
      soundscape.playTempleBell();
      karmaService.addKarma(15, `Saved to Vault • ${item.title.substring(0, 24)}`, "vault");
      toast.vault(
        `Added "${item.title.substring(0, 34)}${item.title.length > 34 ? '...' : ''}" to your personal Smriti Vault.`,
        {
          title: "Added to Vault",
          action: {
            label: "View Vault",
            onClick: () => {
              setActiveTab("vault");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
          },
        }
      );
      return [item, ...prev];
    });
  };

  const handleRemoveSavedItem = (id: string) => {
    const itemToRemove = savedItems.find((i) => i.id === id);
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
    toast.info(
      itemToRemove
        ? `Removed "${itemToRemove.title.substring(0, 30)}${itemToRemove.title.length > 30 ? '...' : ''}" from Vault.`
        : "Item removed from Vault.",
      {
        title: "Vault Updated",
      }
    );
  };

  const handleAskBharatGPTFromExplorer = (prompt: string) => {
    setPrefilledChatPrompt(prompt);
    setActiveTab("chat");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateSearchResult = (result: SearchResultItem) => {
    if (result.domain === "gita") {
      if (result.targetPayload?.chapterNumber) {
        setSelectedGitaChapterNumber(result.targetPayload.chapterNumber);
      }
      if (result.targetPayload?.shlokaId) {
        setSelectedGitaShlokaId(result.targetPayload.shlokaId);
      }
      setActiveTab("gita");
    } else if (result.domain === "story") {
      if (result.targetPayload?.storyPrompt) {
        setInitialStoryPrompt(result.targetPayload.storyPrompt);
        setInitialStoryTheme(result.targetPayload.storyTheme || "epics");
      }
      setActiveTab("story");
    } else if (result.domain === "history") {
      if (result.targetPayload?.heritageId) {
        setInitialHeritageId(result.targetPayload.heritageId);
      }
      setActiveTab("explorer");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setActiveTab("chat");
    toast.info("You have signed out successfully.", { title: "Signed Out" });
  };

  // If not logged in, display the sacred Authentication Gate
  if (!currentUser) {
    return (
      <>
        <ToastContainer theme={theme} />
        <LoginPage
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            if (user.preferredLanguage) {
              setSelectedLanguage(user.preferredLanguage);
            }
            toast.success(`Welcome back, ${user.name}! 🙏`, {
              title: "Prajna BharatGPT",
            });
          }}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      </>
    );
  }

  const isLight = theme === "temple_ivory";

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors relative ${
        isLight ? "bg-[#faf7f2] text-stone-900" : "bg-[#070b14] text-amber-100"
      }`}
    >
      {/* Toast Notification Container */}
      <ToastContainer theme={theme} />

      {/* Subtle Interactive Sacred Background Particles (Om & Lotus) */}
      <SacredParticlesBackground theme={theme} />

      {/* Top Header with Global Search */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={handleLanguageChange}
        isAudioPlaying={isAudioDronePlaying}
        onToggleAudio={handleToggleDroneAudio}
        savedCount={savedItems.length}
        onOpenDeployGuide={() => setIsDeployModalOpen(true)}
        onOpenSearch={() => setIsGlobalSearchOpen(true)}
        onOpenKarmaModal={() => setIsKarmaModalOpen(true)}
        karmaProfile={karmaProfile}
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
            initialHeritageId={initialHeritageId}
            onClearInitialHeritage={() => setInitialHeritageId(null)}
          />
        )}

        {activeTab === "story" && (
          <StorytellerSection
            selectedLanguage={selectedLanguage}
            onSaveItem={handleSaveItem}
            initialPrompt={initialStoryPrompt}
            initialTheme={initialStoryTheme}
            onClearInitialPrompt={() => {
              setInitialStoryPrompt(null);
              setInitialStoryTheme(null);
            }}
          />
        )}

        {activeTab === "gita" && (
          <GitaWisdomSection
            selectedLanguage={selectedLanguage}
            onSaveItem={handleSaveItem}
            initialChapterNumber={selectedGitaChapterNumber}
            initialShlokaId={selectedGitaShlokaId}
            onClearInitialSelection={() => {
              setSelectedGitaChapterNumber(null);
              setSelectedGitaShlokaId(null);
            }}
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

      {/* Global Search Modal across Gita, Stories, History */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onNavigateToResult={handleNavigateSearchResult}
        onAskBharatGPT={handleAskBharatGPTFromExplorer}
        onSaveItem={handleSaveItem}
        theme={theme}
      />

      {/* Deployment & Setup Modal */}
      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* Karma Points & Indic Badges Dashboard Modal */}
      <KarmaBadgeModal
        isOpen={isKarmaModalOpen}
        onClose={() => setIsKarmaModalOpen(false)}
        theme={theme}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
