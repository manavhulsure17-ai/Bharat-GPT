import { SankalpaCategory, SankalpaItem } from "../types";

export interface SankalpaCategoryMeta {
  id: SankalpaCategory;
  name: string;
  indicName: string;
  description: string;
  icon: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  accentColor: string;
  defaultMantra: string;
}

export const SANKALPA_CATEGORIES: Record<SankalpaCategory, SankalpaCategoryMeta> = {
  shanti: {
    id: "shanti",
    name: "Shanti & Santosha",
    indicName: "शान्ति व सन्तोष",
    description: "Cultivating unshakeable inner peace, emotional balance, and radiant contentment.",
    icon: "🕊️",
    badgeBg: "bg-teal-500/15",
    badgeBorder: "border-teal-500/30",
    badgeText: "text-teal-300",
    accentColor: "from-teal-600 to-emerald-600",
    defaultMantra: "ॐ शान्तिः शान्तिः शान्तिः",
  },
  satya: {
    id: "satya",
    name: "Satya & Vak-Shuddhi",
    indicName: "सत्य व वाक्-शुद्धि",
    description: "Practicing truthful, uplifting speech and integrity in every interaction.",
    icon: "🪷",
    badgeBg: "bg-sky-500/15",
    badgeBorder: "border-sky-500/30",
    badgeText: "text-sky-300",
    accentColor: "from-sky-600 to-blue-600",
    defaultMantra: "सत्यमेव जयते नानृतम्",
  },
  tapas: {
    id: "tapas",
    name: "Tapas & Sadhana",
    indicName: "तप व दैनिक साधना",
    description: "Consecrating daily time for mindful meditation, pranayama, and disciplined self-refinement.",
    icon: "🔥",
    badgeBg: "bg-amber-500/15",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-300",
    accentColor: "from-amber-600 to-orange-600",
    defaultMantra: "कायेंद्रियसिद्धिरशुद्धिक्षयात्तपसः",
  },
  karuna: {
    id: "karuna",
    name: "Karuna & Seva",
    indicName: "करुणा व निःस्वार्थ सेवा",
    description: "Selfless service, active kindness, and easing another's burden without seeking praise.",
    icon: "🤲",
    badgeBg: "bg-rose-500/15",
    badgeBorder: "border-rose-500/30",
    badgeText: "text-rose-300",
    accentColor: "from-rose-600 to-pink-600",
    defaultMantra: "परोपकाराय सतां विभूतयः",
  },
  vairagya: {
    id: "vairagya",
    name: "Vairagya & Nishkama",
    indicName: "वैराग्य व निष्काम कर्म",
    description: "Giving your 100% effort while surrendering obsessive anxiety over results to the Divine.",
    icon: "🌿",
    badgeBg: "bg-purple-500/15",
    badgeBorder: "border-purple-500/30",
    badgeText: "text-purple-300",
    accentColor: "from-purple-600 to-indigo-600",
    defaultMantra: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन",
  },
  dhairya: {
    id: "dhairya",
    name: "Dhairya & Ojas",
    indicName: "धैर्य व आत्मबल",
    description: "Meeting challenges and uncertainty with quiet dignity, courage, and vitality.",
    icon: "🦁",
    badgeBg: "bg-orange-500/15",
    badgeBorder: "border-orange-500/30",
    badgeText: "text-orange-300",
    accentColor: "from-orange-600 to-red-600",
    defaultMantra: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्",
  },
  swadhyaya: {
    id: "swadhyaya",
    name: "Swadhyaya & Jnana",
    indicName: "स्वाध्याय व आत्मज्ञान",
    description: "Contemplative study of sacred scriptures, reflective journaling, and self-inquiry.",
    icon: "📜",
    badgeBg: "bg-amber-400/15",
    badgeBorder: "border-amber-400/30",
    badgeText: "text-amber-200",
    accentColor: "from-amber-500 to-yellow-500",
    defaultMantra: "स्वाध्यायान्मा प्रमदः",
  },
};

export interface SankalpaPreset {
  id: string;
  title: string;
  indicTitle: string;
  category: SankalpaCategory;
  mantraOrAffirmation: string;
  whyItMatters: string;
  scriptureReference: string;
}

export const SANKALPA_PRESETS: SankalpaPreset[] = [
  {
    id: "preset-shanti-nonreactivity",
    title: "Pause Before Reacting: Anchor in Inner Peace",
    indicTitle: "अक्रोध व प्रशान्त चित्त",
    category: "shanti",
    mantraOrAffirmation: "प्रशान्तमनसं ह्येनं योगिनं सुखमुत्तमम् (Gita 6.27)",
    whyItMatters: "External circumstances are impermanent waves; inner calm is my sanctuary of wisdom.",
    scriptureReference: "Bhagavad Gita 6.27",
  },
  {
    id: "preset-satya-mindful-speech",
    title: "Speak Words of Truth, Gentleness and Upliftment",
    indicTitle: "सत्यं ब्रूयात् प्रियं ब्रूयात्",
    category: "satya",
    mantraOrAffirmation: "अनुद्वेगकरं वाक्यं सत्यं प्रियहितं च यत् (Gita 17.15)",
    whyItMatters: "Vedic Vak-Tapas teaches that every word carries vibration. I will speak to elevate rather than diminish.",
    scriptureReference: "Bhagavad Gita 17.15",
  },
  {
    id: "preset-tapas-daily-sadhana",
    title: "Consecrate 20 Minutes to Unbroken Sacred Sadhana",
    indicTitle: "दैनिक तप व योग साधना",
    category: "tapas",
    mantraOrAffirmation: "योगः कर्मसु कौशलम् (Gita 2.50)",
    whyItMatters: "Daily consistent spiritual practice cleanses mental impurities and fortifies willpower.",
    scriptureReference: "Yoga Sutras 2.1 & Gita 2.50",
  },
  {
    id: "preset-karuna-selfless-deed",
    title: "Perform One Mindful Act of Unsung Seva Today",
    indicTitle: "निःस्वार्थ परोपकार व सेवा",
    category: "karuna",
    mantraOrAffirmation: "परोपकाराय फलन्ति वृक्षाः परोपकाराय वहन्ति नद्यः",
    whyItMatters: "True spiritual expansion happens when we step beyond ego to lighten another sentient being's load.",
    scriptureReference: "Subhashita Ratnabhandagara",
  },
  {
    id: "preset-vairagya-release-outcome",
    title: "Give Wholehearted Effort; Release Anxiety of Praise or Result",
    indicTitle: "कर्मण्येवाधिकारस्ते • अनासक्ति",
    category: "vairagya",
    mantraOrAffirmation: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन (Gita 2.47)",
    whyItMatters: "Peace is found in complete presence with the action itself, trusting the cosmic order for results.",
    scriptureReference: "Bhagavad Gita 2.47",
  },
  {
    id: "preset-dhairya-courage-adversity",
    title: "Face Today's Uncertainties with Calm Lion-Hearted Courage",
    indicTitle: "धैर्य व आत्मिक सामर्थ्य",
    category: "dhairya",
    mantraOrAffirmation: "नायमात्मा बलहीनेन लभ्यः (Mundaka Upanishad 3.2.4)",
    whyItMatters: "The self is not attained by the faint-hearted. Adversity is spiritual fire that tempers strength.",
    scriptureReference: "Mundaka Upanishad 3.2.4",
  },
  {
    id: "preset-swadhyaya-deep-shloka",
    title: "Contemplate One Sacred Gita Shloka and Embody It Today",
    indicTitle: "स्वाध्याय व मन्थन",
    category: "swadhyaya",
    mantraOrAffirmation: "ज्ञानेन तु तदज्ञानं येषां नाशितमात्मनः (Gita 5.16)",
    whyItMatters: "Scriptural wisdom is not intellectual luggage; it is a radiant torch meant to illuminate daily choices.",
    scriptureReference: "Taittiriya Upanishad & Gita 5.16",
  },
];

export const INITIAL_DEMO_SANKALPAS: SankalpaItem[] = [
  {
    id: "demo-sankalpa-1",
    title: "Practice non-reactivity in meetings; respond with patience and deep breaths.",
    indicTitle: "प्रशान्त चित्त व अक्रोध",
    category: "shanti",
    categoryLabel: "Shanti & Santosha",
    categoryIndic: "शान्ति व सन्तोष",
    targetDate: new Date().toISOString().split("T")[0],
    status: "fulfilled",
    mantraOrAffirmation: "ॐ शान्तिः शान्तिः शान्तिः",
    whyItMatters: "Preserving inner equilibrium when unexpected stress occurs.",
    reflectionNotes: "When a heated debate arose today, took three mindful breaths before speaking. Felt remarkable clarity and de-escalated the room.",
    fulfilledAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    pointsAwarded: 25,
  },
  {
    id: "demo-sankalpa-2",
    title: "Offer wholehearted dedication to daily tasks without mental obsession over outcomes.",
    indicTitle: "कर्मण्येवाधिकारस्ते • निष्काम भाव",
    category: "vairagya",
    categoryLabel: "Vairagya & Nishkama",
    categoryIndic: "वैराग्य व निष्काम",
    targetDate: new Date().toISOString().split("T")[0],
    status: "in_progress",
    mantraOrAffirmation: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन",
    whyItMatters: "Freeing the creative spirit from performance paralysis and outcome anxiety.",
    reflectionNotes: "",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    pointsAwarded: 10,
  },
  {
    id: "demo-sankalpa-3",
    title: "Read Chapter 2 of the Bhagavad Gita and journal key insights on the Sthitaprajna.",
    indicTitle: "स्थितप्रज्ञ स्वाध्याय",
    category: "swadhyaya",
    categoryLabel: "Swadhyaya & Jnana",
    categoryIndic: "स्वाध्याय व ज्ञान",
    targetDate: new Date().toISOString().split("T")[0],
    status: "in_progress",
    mantraOrAffirmation: "स्वाध्यायान्मा प्रमदः",
    whyItMatters: "To understand the traits of one who has stabilized the mind in divine awareness.",
    reflectionNotes: "",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    pointsAwarded: 10,
  },
];
