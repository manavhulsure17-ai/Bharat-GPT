export type NavigationTab =
  | "chat"
  | "explorer"
  | "story"
  | "gita"
  | "quiz"
  | "translate"
  | "vault"
  | "admin";

export type PersonaType = "scholar" | "sage" | "chronicler" | "sciences" | "storyteller";

export interface PersonaInfo {
  id: PersonaType;
  name: string;
  indicName: string;
  tagline: string;
  avatarIcon: string;
  color: string;
  bgGradient: string;
  borderAccent: string;
  description: string;
  defaultStarters: string[];
}

export type IndicLanguageCode =
  | "English"
  | "Hindi"
  | "Sanskrit"
  | "Tamil"
  | "Telugu"
  | "Bengali"
  | "Marathi"
  | "Gujarati"
  | "Kannada"
  | "Malayalam"
  | "Odia"
  | "Punjabi";

export interface LanguageOption {
  code: IndicLanguageCode;
  label: string;
  native: string;
  script: string;
}

export type AiMode = "balanced" | "fast" | "search" | "thinking";

export interface GroundingSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  persona?: PersonaType;
  language?: IndicLanguageCode;
  isStreaming?: boolean;
  mode?: AiMode;
  sources?: GroundingSource[];
  thoughtProcess?: string;
}

export type HeritageCategory =
  | "all"
  | "architecture"
  | "sciences"
  | "philosophy"
  | "arts"
  | "geography"
  | "dynasties";

export interface HeritageItem {
  id: string;
  title: string;
  indicTitle: string;
  category: HeritageCategory;
  era: string;
  century: string;
  location: string;
  region: "North" | "South" | "East" | "West" | "Central" | "Northeast" | "Pan-India";
  image: string;
  summary: string;
  keyInsights: string[];
  architecturalStyle?: string;
  spiritualSignificance?: string;
  scientificValue?: string;
  suggestedPrompt: string;
  unescoStatus?: boolean;
}

export interface StoryChoice {
  id: string;
  text: string;
  theme?: string;
}

export interface StoryScene {
  title: string;
  chapter: string;
  narrative: string;
  moralOrWisdom?: string;
  characterQuote?: string;
  speaker?: string;
  choices: StoryChoice[];
  isEnding?: boolean;
}

export interface StorySession {
  id: string;
  theme: string;
  title: string;
  scenes: StoryScene[];
  currentSceneIndex: number;
  selectedChoicesHistory: string[];
  savedAt?: string;
}

export interface WordBreakdown {
  word: string;
  meaning: string;
}

export interface ShlokaItem {
  id: string;
  source: string;
  chapterVerse?: string;
  theme: string;
  sanskrit: string;
  transliteration: string;
  wordMeaning: WordBreakdown[];
  translation: string;
  context: string;
  lifeGuidance: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
  curiousFact?: string;
}

export interface UserBadge {
  id: string;
  name: string;
  indicName: string;
  icon: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface SavedItem {
  id: string;
  type: "chat" | "shloka" | "story" | "heritage" | "history";
  title: string;
  snippet: string;
  date: string;
  data: any;
}

export type HistoryCategory =
  | "all"
  | "vedic"
  | "sciences"
  | "dynasties"
  | "arts"
  | "freedom"
  | "culture";

export interface HistoryEventItem {
  id: string;
  title: string;
  indicTitle: string;
  dateStr: string;
  month: number;
  day: number;
  year?: string;
  era: string;
  category: "vedic" | "sciences" | "dynasties" | "arts" | "freedom" | "culture";
  location?: string;
  summary: string;
  detailedSignificance: string;
  vedicTithiReference?: string;
  keyTakeaways: string[];
  historicalFigures?: string[];
  suggestedPrompt: string;
  sourceOrReference?: string;
}

export interface VedicPanchangInfo {
  tithi: string;
  masa: string;
  paksha: string;
  ritu: string;
  nakshatra?: string;
  astronomicalInsight?: string;
  vedicEraYear?: string;
}


export interface GitaChapter {
  chapterNumber: number;
  sanskritTitle: string;
  transliteration: string;
  englishTitle: string;
  verseCount: number;
  theme: string;
  coreSummary: string;
  keyVerseSnippet: string;
  keyInsight: string;
  suggestedQuery: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  createdAt: string;
  lastLoginAt: string;
  preferredLanguage?: IndicLanguageCode;
}

export interface AdminCredentials {
  email: string;
  password: string;
  updatedAt: string;
}

export type AppTheme = "deep_night" | "temple_ivory";

