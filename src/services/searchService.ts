import { GITA_CHAPTERS_DATA } from "../data/gitaChaptersData";
import { SHLOKA_WISDOM_COLLECTION } from "../data/shlokasData";
import { VEDIC_WISDOM_COLLECTION } from "../data/vedicWisdomData";
import { HERITAGE_ITEMS } from "../data/heritageData";
import { BHARAT_HISTORY_CHRONICLES } from "../data/todayInHistoryData";
import { NavigationTab, SavedItem } from "../types";

export type SearchDomain = "all" | "gita" | "story" | "history";

export interface SearchResultItem {
  id: string;
  domain: "gita" | "story" | "history";
  subCategory: string;
  title: string;
  indicTitle?: string;
  badge: string;
  snippet: string;
  details?: string;
  keyVerseOrPrompt?: string;
  targetTab: NavigationTab;
  targetPayload?: {
    chapterNumber?: number;
    shlokaId?: string;
    storyPrompt?: string;
    storyTheme?: string;
    heritageId?: string;
    askPrompt?: string;
  };
  tags: string[];
}

// Curated Story Library index covering Epics, History, Panchatantra, Puranas, and Lore
const STORY_LIBRARY_INDEX = [
  {
    id: "story-arjuna-bird-eye",
    title: "Arjuna & The Test of the Bird's Eye",
    indicTitle: "अर्जुनस्य एकाग्रता परीक्षा",
    subCategory: "Epic Mahabharata",
    badge: "Mahabharata",
    snippet: "The legendary archery test set by Guru Dronacharya in the forest of Hastinapura where unwavering focus on the target determines destiny.",
    prompt: "The legendary archery test set by Guru Dronacharya in the forest of Hastinapura where focus determines destiny.",
    theme: "epics",
    tags: ["arjuna", "drona", "mahabharata", "archery", "focus", "concentration", "guru", "hastinapur", "pandavas"],
  },
  {
    id: "story-shivaji-agra-escape",
    title: "Chhatrapati Shivaji's Daring Agra Escape",
    indicTitle: "छत्रपति शिवाजी महाराज का आगरा से पलायन",
    subCategory: "Historical Katha",
    badge: "Maratha History",
    snippet: "The masterstroke strategy and daring escape of Chhatrapati Shivaji Maharaj and Prince Sambhaji hidden inside sweet hampers from royal confinement in Agra.",
    prompt: "The daring and strategic escape of Chhatrapati Shivaji Maharaj and Prince Sambhaji from royal confinement in Agra.",
    theme: "history",
    tags: ["shivaji", "chhatrapati", "maratha", "agra", "aurangzeb", "escape", "strategy", "sambhaji", "swarajya"],
  },
  {
    id: "story-panchatantra-monkey-crocodile",
    title: "The Monkey and the Crocodile's Heart",
    indicTitle: "वानर-मकर मैत्री कथा (पञ्चतन्त्र)",
    subCategory: "Panchatantra Wisdom",
    badge: "Panchatantra",
    snippet: "An ancient Panchatantra fable on friendship, betrayal, and quick-witted presence of mind on the banks of the sacred river under the Jamun tree.",
    prompt: "An ancient Panchatantra fable on friendship, betrayal, and quick-witted presence of mind on the banks of the sacred river.",
    theme: "panchatantra",
    tags: ["panchatantra", "monkey", "crocodile", "fable", "friendship", "presence of mind", "vishnu sharma", "wisdom"],
  },
  {
    id: "story-tenali-rama-golden-seeds",
    title: "Tenali Rama & The Hidden Golden Seeds",
    indicTitle: "तेनाली रामस्य स्वर्णबीज कथा",
    subCategory: "Court Wit & Fables",
    badge: "Vijayanagara Lore",
    snippet: "A witty courtroom tale where Tenali Rama outsmarts corrupt ministers and solves a royal dispute using ancient agricultural and moral wisdom.",
    prompt: "A witty courtroom tale where Tenali Rama solves a dispute over royal land using ancient agricultural wisdom.",
    theme: "fables",
    tags: ["tenali rama", "krishnadevaraya", "vijayanagara", "humor", "courtroom", "wit", "justice"],
  },
  {
    id: "story-nachiketa-yama",
    title: "Nachiketa & The Lord of Death (Katha Upanishad)",
    indicTitle: "नचिकेता-यम संवाद",
    subCategory: "Upanishadic Lore",
    badge: "Upanishads",
    snippet: "The fearless young seeker Nachiketa waits at the gates of Yama to ask the ultimate question: What lies beyond death and mortality?",
    prompt: "The profound dialogue between the fearless young seeker Nachiketa and Lord Yama on the immortal nature of the Soul in Katha Upanishad.",
    theme: "epics",
    tags: ["nachiketa", "yama", "katha upanishad", "death", "immortality", "atman", "brahman", "spiritual seeker"],
  },
  {
    id: "story-harishchandra-truth",
    title: "Raja Harishchandra & The Supreme Test of Truth",
    indicTitle: "सत्यवादी राजा हरिश्चन्द्र",
    subCategory: "Puranic Epic",
    badge: "Puranas",
    snippet: "The uncompromising devotion of King Harishchandra to Satya (truth) through severe loss of his kingdom, family, and wealth in the cremation grounds of Kashi.",
    prompt: "The inspiring story of King Harishchandra who sacrificed his royal throne and endure hardship to uphold truth (Satya).",
    theme: "epics",
    tags: ["harishchandra", "satya", "truth", "kashi", "vishwamitra", "integrity", "dharma", "righteousness"],
  },
  {
    id: "story-samudra-manthan",
    title: "Samudra Manthan: The Churning of the Cosmic Ocean",
    indicTitle: "समुद्र मन्थन एवं अमृत प्राप्ति",
    subCategory: "Cosmic Puranic Lore",
    badge: "Puranas",
    snippet: "Devas and Asuras unite using Mount Mandara and the serpent Vasuki to churn the ocean of milk, yielding Halahala poison and the nectar of immortality (Amrita).",
    prompt: "The cosmic churning of the Ocean of Milk (Samudra Manthan) by Devas and Asuras, Lord Shiva drinking Halahala, and the emergence of Amrita.",
    theme: "epics",
    tags: ["samudra manthan", "amrita", "shiva", "halahala", "ocean churning", "vishnu", "kurma", "devas", "asuras"],
  },
  {
    id: "story-eklavya-guru-bhakti",
    title: "Eklavya & The Clay Statue of Dronacharya",
    indicTitle: "एकलव्यस्य गुरुभक्तिः",
    subCategory: "Epic Mahabharata",
    badge: "Mahabharata",
    snippet: "The devoted Nishada prince who mastered supreme archery through pure self-discipline and unshakeable reverence for his Guru's clay statue.",
    prompt: "The story of Eklavya mastering archery through self-practice and unmatched devotion before the clay idol of Guru Dronacharya.",
    theme: "epics",
    tags: ["eklavya", "drona", "archery", "guru dakshina", "devotion", "discipline", "nishada", "mahabharata"],
  },
  {
    id: "story-ashoka-kalinga-transformation",
    title: "Emperor Ashoka: From Chandashoka to Dharmashoka",
    indicTitle: "सम्राट अशोक का धम्म विजय परिवर्तन",
    subCategory: "Historical Katha",
    badge: "Maurya Empire",
    snippet: "Following the devastating carnage of the Kalinga War on the banks of River Daya, Emperor Ashoka renounces violence and embraces Buddhist Dhamma and non-violence.",
    prompt: "The profound transformation of Emperor Ashoka after the Kalinga War, carving edicts of compassion, ahimsa, and social welfare across India.",
    theme: "history",
    tags: ["ashoka", "maurya", "kalinga", "buddhism", "dhamma", "ahimsa", "peace", "edicts", "transformation"],
  },
  {
    id: "story-bhishma-pratigya",
    title: "Devavrata & The Terrifying Vow of Bhishma",
    indicTitle: "भीष्म प्रतिज्ञा",
    subCategory: "Epic Mahabharata",
    badge: "Mahabharata",
    snippet: "Devavrata takes a lifelong oath of celibacy and eternal service to the throne of Hastinapura for his father Shantanu's happiness, earning the name Bhishma.",
    prompt: "The supreme sacrifice and unbreakable vow of Devavrata taking the oath of Bhishma for the happiness of his father King Shantanu.",
    theme: "epics",
    tags: ["bhishma", "pratigya", "vow", "devavrata", "shantanu", "satyavati", "mahabharata", "sacrifice", "honor"],
  },
  {
    id: "story-adi-shankara-digvijaya",
    title: "Adi Shankaracharya's Digvijaya & The Unity of Advaita",
    indicTitle: "आदि शङ्कराचार्य दिग्विजय",
    subCategory: "Philosophical Legend",
    badge: "Advaita Vedanta",
    snippet: "The young saint from Kalady walks across the four corners of Bharat, reviving non-dual Advaita philosophy and establishing four cardinal Mathas in Sringeri, Puri, Dwaraka, and Badrinath.",
    prompt: "The pan-Indian journey of Adi Shankaracharya uniting disparate traditions through dialectic debates and Advaita Vedanta.",
    theme: "history",
    tags: ["shankara", "adi shankaracharya", "advaita", "vedanta", "sringeri", "badrinath", "puri", "dwaraka", "philosophy"],
  },
  {
    id: "story-karna-generosity",
    title: "Karna: The Supreme Exemplar of Danaveera",
    indicTitle: "दानवीर कर्णस्य दानशीलता",
    subCategory: "Epic Mahabharata",
    badge: "Mahabharata",
    snippet: "Even knowing his mortal danger, Karna slices off his celestial armor (Kavacha) and earrings (Kundala) to gift Indra in disguise, cementing his legend as Danaveera.",
    prompt: "The unmatched generosity and unwavering promise of Karna donating his divine Kavacha and Kundala to Indra disguised as a Brahmin.",
    theme: "epics",
    tags: ["karna", "danaveera", "kavach kundal", "indra", "generosity", "surya putra", "mahabharata", "loyalty"],
  }
];

// Precompute complete search catalog
function buildSearchIndex(): SearchResultItem[] {
  const index: SearchResultItem[] = [];

  // 1. Index Gita Chapters
  GITA_CHAPTERS_DATA.forEach((chap) => {
    index.push({
      id: `gita-chap-${chap.chapterNumber}`,
      domain: "gita",
      subCategory: `Gita Chapter ${chap.chapterNumber}`,
      title: `Chapter ${chap.chapterNumber}: ${chap.englishTitle}`,
      indicTitle: `${chap.sanskritTitle} (${chap.transliteration})`,
      badge: `Gita Chap ${chap.chapterNumber}`,
      snippet: `${chap.theme} • ${chap.coreSummary}`,
      details: `Key Insight: ${chap.keyInsight} | Verse snippet: "${chap.keyVerseSnippet}"`,
      keyVerseOrPrompt: chap.suggestedQuery,
      targetTab: "gita",
      targetPayload: {
        chapterNumber: chap.chapterNumber,
        askPrompt: chap.suggestedQuery,
      },
      tags: [
        "gita",
        "bhagavad gita",
        `chapter ${chap.chapterNumber}`,
        `ch ${chap.chapterNumber}`,
        chap.englishTitle.toLowerCase(),
        chap.transliteration.toLowerCase(),
        chap.sanskritTitle,
        chap.theme.toLowerCase(),
        "krishna",
        "arjuna",
        "yoga",
      ],
    });
  });

  // 2. Index Curated Gita Shlokas
  SHLOKA_WISDOM_COLLECTION.forEach((shloka) => {
    index.push({
      id: `shloka-${shloka.id}`,
      domain: "gita",
      subCategory: shloka.chapterVerse || "Gita Verse",
      title: `${shloka.theme} (${shloka.chapterVerse || shloka.source})`,
      indicTitle: shloka.sanskrit.split("\n")[0] || shloka.theme,
      badge: "Gita Shloka",
      snippet: shloka.translation,
      details: `${shloka.context} • ${shloka.lifeGuidance.split("\n")[0] || ""}`,
      keyVerseOrPrompt: `Explain Gita verse ${shloka.chapterVerse}: "${shloka.sanskrit}" and its guidance for modern life.`,
      targetTab: "gita",
      targetPayload: {
        shlokaId: shloka.id,
        askPrompt: `Explain Gita shloka ${shloka.chapterVerse} (${shloka.theme}): "${shloka.translation}" and how to apply it today.`,
      },
      tags: [
        "shloka",
        "verse",
        "gita",
        shloka.theme.toLowerCase(),
        shloka.chapterVerse?.toLowerCase() || "",
        "sanskrit",
        "karma",
        "peace",
        "anxiety",
        "focus",
      ],
    });
  });

  // 3. Index Vedic & Upanishadic Verses
  VEDIC_WISDOM_COLLECTION.forEach((verse) => {
    index.push({
      id: `vedic-${verse.id}`,
      domain: "gita",
      subCategory: `${verse.vedicCategory} Wisdom`,
      title: `${verse.theme} — ${verse.source}`,
      indicTitle: verse.sanskrit.split("\n")[0] || verse.theme,
      badge: verse.vedicCategory,
      snippet: verse.englishTranslation,
      details: `${verse.philosophicalEssence} • Contemplation: ${verse.dailyContemplation}`,
      keyVerseOrPrompt: `Explain the Vedic wisdom of ${verse.source}: "${verse.sanskrit}" — ${verse.englishTranslation}`,
      targetTab: "gita",
      targetPayload: {
        askPrompt: `Explore the Vedic philosophical meaning of ${verse.source} (${verse.theme}): "${verse.englishTranslation}".`,
      },
      tags: [
        "veda",
        "vedic",
        verse.vedicCategory.toLowerCase(),
        verse.source.toLowerCase(),
        verse.theme.toLowerCase(),
        "upanishad",
        "sanskrit",
        "mantra",
        "wisdom",
      ],
    });
  });

  // 4. Index Story Library
  STORY_LIBRARY_INDEX.forEach((story) => {
    index.push({
      id: story.id,
      domain: "story",
      subCategory: story.subCategory,
      title: story.title,
      indicTitle: story.indicTitle,
      badge: story.badge,
      snippet: story.snippet,
      details: `Interactive moral story branching with character dialogues and ethical choices.`,
      keyVerseOrPrompt: story.prompt,
      targetTab: "story",
      targetPayload: {
        storyPrompt: story.prompt,
        storyTheme: story.theme,
        askPrompt: `Narrate the deep spiritual and moral significance of ${story.title}.`,
      },
      tags: story.tags,
    });
  });

  // 5. Index Heritage Monuments, Wonders & Ancient Sciences
  HERITAGE_ITEMS.forEach((item) => {
    const catLabel =
      item.category === "architecture"
        ? "Temple & Architecture"
        : item.category === "sciences"
        ? "Ancient Science & Technology"
        : item.category === "philosophy"
        ? "Philosophy & Literature"
        : item.category === "dynasties"
        ? "Imperial Dynasty"
        : "Heritage Landmark";

    index.push({
      id: `heritage-${item.id}`,
      domain: "history",
      subCategory: catLabel,
      title: item.title,
      indicTitle: item.indicTitle,
      badge: item.century || item.era,
      snippet: `${item.location} • ${item.summary}`,
      details: `Key Insight: ${item.keyInsights[0] || ""} ${item.scientificValue ? `| Science: ${item.scientificValue}` : ""}`,
      keyVerseOrPrompt: item.suggestedPrompt,
      targetTab: "explorer",
      targetPayload: {
        heritageId: item.id,
        askPrompt: item.suggestedPrompt,
      },
      tags: [
        "heritage",
        "history",
        item.title.toLowerCase(),
        item.indicTitle,
        item.location.toLowerCase(),
        item.category.toLowerCase(),
        item.era.toLowerCase(),
        item.region.toLowerCase(),
        "monument",
        "ancient india",
        "architecture",
        "science",
      ],
    });
  });

  // 6. Index Bharat Historical Chronicles & Milestones
  BHARAT_HISTORY_CHRONICLES.forEach((event) => {
    index.push({
      id: `history-event-${event.id}`,
      domain: "history",
      subCategory: `History (${event.era})`,
      title: event.title,
      indicTitle: event.indicTitle,
      badge: event.year || event.dateStr,
      snippet: `${event.location ? `${event.location} • ` : ""}${event.summary}`,
      details: `${event.detailedSignificance.slice(0, 160)}...`,
      keyVerseOrPrompt: event.suggestedPrompt,
      targetTab: "explorer",
      targetPayload: {
        askPrompt: event.suggestedPrompt,
      },
      tags: [
        "history",
        "chronicles",
        event.title.toLowerCase(),
        event.indicTitle,
        event.category.toLowerCase(),
        event.era.toLowerCase(),
        event.year ? event.year.toLowerCase() : "",
        ...(event.historicalFigures || []).map((f) => f.toLowerCase()),
      ],
    });
  });

  return index;
}

const GLOBAL_SEARCH_INDEX = buildSearchIndex();

/**
 * Searches across Gita wisdom, Story library, and Historical database
 */
export function searchBharatKnowledge(
  query: string,
  domain: SearchDomain = "all"
): SearchResultItem[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const queryTerms = cleanQuery.split(/\s+/).filter((t) => t.length > 0);

  return GLOBAL_SEARCH_INDEX.filter((item) => {
    // Domain match filter
    if (domain !== "all" && item.domain !== domain) {
      return false;
    }

    const titleLower = item.title.toLowerCase();
    const indicLower = (item.indicTitle || "").toLowerCase();
    const snippetLower = item.snippet.toLowerCase();
    const subCatLower = item.subCategory.toLowerCase();
    const badgeLower = item.badge.toLowerCase();
    const detailsLower = (item.details || "").toLowerCase();

    // Check if any search term matches
    return queryTerms.every(
      (term) =>
        titleLower.includes(term) ||
        indicLower.includes(term) ||
        snippetLower.includes(term) ||
        subCatLower.includes(term) ||
        badgeLower.includes(term) ||
        detailsLower.includes(term) ||
        item.tags.some((tag) => tag.includes(term))
    );
  }).sort((a, b) => {
    // Relevance scoring
    const aExactTitle = a.title.toLowerCase().includes(cleanQuery) ? 10 : 0;
    const bExactTitle = b.title.toLowerCase().includes(cleanQuery) ? 10 : 0;
    const aTags = a.tags.some((t) => t.includes(cleanQuery)) ? 5 : 0;
    const bTags = b.tags.some((t) => t.includes(cleanQuery)) ? 5 : 0;
    return bExactTitle + bTags - (aExactTitle + aTags);
  });
}

/**
 * Get popular/curated search recommendations
 */
export function getPopularSearchSuggestions(): {
  label: string;
  domain: SearchDomain;
  query: string;
}[] {
  return [
    { label: "Nishkama Karma (Duty Without Greed)", domain: "gita", query: "Nishkama Karma" },
    { label: "Konark Sun Temple Sundial", domain: "history", query: "Konark Sun Temple" },
    { label: "Arjuna & Guru Drona's Archery Test", domain: "story", query: "Arjuna" },
    { label: "Brihadeeswarar 80-Ton Monolith", domain: "history", query: "Brihadeeswarar" },
    { label: "Chapter 2: Sāṅkhya Yoga & Soul", domain: "gita", query: "Chapter 2" },
    { label: "Chhatrapati Shivaji's Agra Escape", domain: "story", query: "Shivaji" },
    { label: "Nalanda Ancient University", domain: "history", query: "Nalanda" },
    { label: "Universal Unity (Rigveda 10.191)", domain: "gita", query: "Rigveda" },
    { label: "Panchatantra: Monkey & Crocodile", domain: "story", query: "Panchatantra" },
    { label: "Kailasa Monolithic Temple Ellora", domain: "history", query: "Kailasa Temple" },
  ];
}
