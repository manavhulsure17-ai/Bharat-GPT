import { VedicVerseItem, VEDIC_WISDOM_COLLECTION, getDailyVedicVerse } from "../data/vedicWisdomData";
import { IndicLanguageCode } from "../types";

export interface DailyWisdomResponse {
  verse: VedicVerseItem;
  isAiGenerated?: boolean;
  dateLabel: string;
}

export async function fetchDailyVedicWisdom(language: IndicLanguageCode = "English"): Promise<DailyWisdomResponse> {
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  try {
    const res = await fetch(`/api/daily-vedic-wisdom?lang=${encodeURIComponent(language)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.sanskrit && data.englishTranslation) {
        return {
          verse: data,
          isAiGenerated: Boolean(data.isAiGenerated),
          dateLabel,
        };
      }
    }
  } catch (err) {
    console.warn("fetchDailyVedicWisdom endpoint offline, using local Vedic calculation:", err);
  }

  // Robust deterministic local fallback based on today's calendar date
  const dailyVerse = getDailyVedicVerse(today);
  return {
    verse: dailyVerse,
    isAiGenerated: false,
    dateLabel,
  };
}

export async function fetchRandomVedicWisdom(): Promise<VedicVerseItem> {
  const randomIndex = Math.floor(Math.random() * VEDIC_WISDOM_COLLECTION.length);
  return VEDIC_WISDOM_COLLECTION[randomIndex];
}
