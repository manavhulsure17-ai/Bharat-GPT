import { HistoryCategory, HistoryEventItem, IndicLanguageCode, VedicPanchangInfo } from "../types";
import {
  BHARAT_HISTORY_CHRONICLES,
  calculateVedicPanchang,
  getTodayInHistoryEvents,
} from "../data/todayInHistoryData";

export interface TodayInHistoryResponse {
  events: HistoryEventItem[];
  primaryEvent: HistoryEventItem;
  vedicPanchang: VedicPanchangInfo;
  dateLabel: string;
  dateFormatted: string;
  isAiGenerated: boolean;
}

export async function fetchTodayInHistory(
  date: Date = new Date(),
  language: IndicLanguageCode = "English",
  category: HistoryCategory = "all"
): Promise<TodayInHistoryResponse> {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const dateFormatted = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const panchang = calculateVedicPanchang(date);

  try {
    const res = await fetch(
      `/api/today-in-history?month=${month}&day=${day}&year=${date.getFullYear()}&lang=${encodeURIComponent(
        language
      )}&category=${encodeURIComponent(category)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.events) && data.events.length > 0) {
        return {
          events: data.events,
          primaryEvent: data.primaryEvent || data.events[0],
          vedicPanchang: data.vedicPanchang || panchang,
          dateLabel: data.dateLabel || dateLabel,
          dateFormatted: data.dateFormatted || dateFormatted,
          isAiGenerated: Boolean(data.isAiGenerated),
        };
      }
    }
  } catch (err) {
    console.warn("fetchTodayInHistory endpoint unavailable, utilizing local Vedic repository:", err);
  }

  // Local fallback
  const allEvents = getTodayInHistoryEvents(month, day);
  const filteredEvents =
    category === "all"
      ? allEvents
      : allEvents.filter((e) => e.category === category);

  const finalEvents = filteredEvents.length > 0 ? filteredEvents : allEvents;

  return {
    events: finalEvents,
    primaryEvent: finalEvents[0],
    vedicPanchang: panchang,
    dateLabel,
    dateFormatted,
    isAiGenerated: false,
  };
}

export function getLocalHistoryForDate(date: Date, category: HistoryCategory = "all"): TodayInHistoryResponse {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateFormatted = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const panchang = calculateVedicPanchang(date);
  const allEvents = getTodayInHistoryEvents(month, day);
  const filteredEvents =
    category === "all"
      ? allEvents
      : allEvents.filter((e) => e.category === category);
  const finalEvents = filteredEvents.length > 0 ? filteredEvents : allEvents;

  return {
    events: finalEvents,
    primaryEvent: finalEvents[0],
    vedicPanchang: panchang,
    dateLabel,
    dateFormatted,
    isAiGenerated: false,
  };
}
