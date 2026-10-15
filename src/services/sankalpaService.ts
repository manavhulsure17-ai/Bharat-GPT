import {
  SankalpaCategory,
  SankalpaFulfillmentStatus,
  SankalpaItem,
  SankalpaWisdomReminder,
  IndicLanguageCode,
} from "../types";
import { INITIAL_DEMO_SANKALPAS, SANKALPA_CATEGORIES } from "../data/sankalpaPresetsData";
import { karmaService } from "./karmaService";
import { soundscape } from "./audioSynth";
import { toast } from "./toastService";

const STORAGE_KEY = "prajna_bharat_sankalpa_items_v2";
const WISDOM_STORAGE_KEY = "prajna_bharat_sankalpa_wisdom_reminder_v2";

type SankalpaListener = (items: SankalpaItem[]) => void;

export interface SankalpaProgressStats {
  totalCount: number;
  fulfilledCount: number;
  todayCount: number;
  todayFulfilledCount: number;
  streakDays: number;
  fulfillmentRate: number;
  categoryBreakdown: Record<SankalpaCategory, number>;
}

class SankalpaService {
  private items: SankalpaItem[] = [];
  private listeners: Set<SankalpaListener> = new Set();

  constructor() {
    this.items = this.loadItems();
  }

  private loadItems(): SankalpaItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Failed to read Sankalpa items from storage:", err);
    }
    // Seed with thoughtful demo intentions
    const seeded = [...INITIAL_DEMO_SANKALPAS];
    this.saveToStorage(seeded);
    return seeded;
  }

  private saveToStorage(items: SankalpaItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to persist Sankalpa items:", err);
    }
  }

  private notify(): void {
    const copy = [...this.items];
    this.listeners.forEach((listener) => {
      try {
        listener(copy);
      } catch (e) {
        console.error("Error in Sankalpa listener:", e);
      }
    });
  }

  public subscribe(listener: SankalpaListener): () => void {
    this.listeners.add(listener);
    listener([...this.items]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getItems(): SankalpaItem[] {
    return [...this.items];
  }

  public saveSankalpa(
    data: Omit<SankalpaItem, "id" | "createdAt" | "status"> & {
      id?: string;
      status?: SankalpaFulfillmentStatus;
    }
  ): SankalpaItem {
    const isNew = !data.id;
    const catMeta = SANKALPA_CATEGORIES[data.category] || SANKALPA_CATEGORIES.shanti;

    if (isNew) {
      const newItem: SankalpaItem = {
        id: "sankalpa-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        title: data.title.trim(),
        indicTitle: data.indicTitle?.trim(),
        category: data.category,
        categoryLabel: catMeta.name,
        categoryIndic: catMeta.indicName,
        targetDate: data.targetDate || new Date().toISOString().split("T")[0],
        status: data.status || "in_progress",
        mantraOrAffirmation: data.mantraOrAffirmation || catMeta.defaultMantra,
        whyItMatters: data.whyItMatters?.trim(),
        reflectionNotes: data.reflectionNotes?.trim(),
        audioTranscribed: Boolean(data.audioTranscribed),
        createdAt: new Date().toISOString(),
        pointsAwarded: 10,
      };

      this.items = [newItem, ...this.items];
      this.saveToStorage(this.items);
      this.notify();

      // Award Karma Points for taking sacred resolve
      karmaService.addKarma(10, `Set Sacred Sankalpa: ${newItem.title.slice(0, 32)}...`, "wisdom");
      karmaService.recordActivity("sankalpasSet", 1);
      soundscape.playTempleBell();
      toast.show("🕉️ Sacred Sankalpa inscribed! May divine grace bless your resolve.", "success", { duration: 4000 });

      return newItem;
    } else {
      let updatedItem: SankalpaItem | null = null;
      this.items = this.items.map((item) => {
        if (item.id === data.id) {
          updatedItem = {
            ...item,
            ...data,
            title: data.title.trim(),
            categoryLabel: catMeta.name,
            categoryIndic: catMeta.indicName,
          };
          return updatedItem;
        }
        return item;
      });

      this.saveToStorage(this.items);
      this.notify();
      toast.show("Sankalpa updated successfully.", "info", { duration: 2500 });
      return updatedItem || this.items[0];
    }
  }

  public updateFulfillment(
    id: string,
    status: SankalpaFulfillmentStatus,
    reflectionNotes?: string
  ): SankalpaItem | null {
    let target: SankalpaItem | null = null;

    this.items = this.items.map((item) => {
      if (item.id === id) {
        const wasFulfilled = item.status === "fulfilled";
        const isNowFulfilled = status === "fulfilled";

        target = {
          ...item,
          status,
          reflectionNotes: reflectionNotes !== undefined ? reflectionNotes : item.reflectionNotes,
          fulfilledAt: isNowFulfilled ? new Date().toISOString() : item.fulfilledAt,
        };

        // Award Karma bonus on first time fulfilling
        if (!wasFulfilled && isNowFulfilled) {
          karmaService.addKarma(15, `Fulfilled Daily Sankalpa: ${item.title.slice(0, 30)}...`, "streak");
          karmaService.recordActivity("sankalpasFulfilled", 1);
          soundscape.playTempleBell();
          toast.show("✨ Sankalpa Fulfilled (पूर्ण)! +15 Karma points bestowed.", "success", { duration: 4500 });
        } else if (reflectionNotes) {
          toast.show("Mindful reflection journaled.", "info", { duration: 2500 });
        }

        return target;
      }
      return item;
    });

    this.saveToStorage(this.items);
    this.notify();
    return target;
  }

  public deleteSankalpa(id: string): void {
    this.items = this.items.filter((item) => item.id !== id);
    this.saveToStorage(this.items);
    this.notify();
    toast.show("Sankalpa removed from journal.", "info", { duration: 2500 });
  }

  public getStats(): SankalpaProgressStats {
    const today = new Date().toISOString().split("T")[0];
    const totalCount = this.items.length;
    const fulfilledCount = this.items.filter((i) => i.status === "fulfilled").length;

    const todayItems = this.items.filter((i) => i.targetDate === today);
    const todayCount = todayItems.length;
    const todayFulfilledCount = todayItems.filter((i) => i.status === "fulfilled").length;

    const fulfillmentRate = totalCount > 0 ? Math.round((fulfilledCount / totalCount) * 100) : 0;

    // Calculate unique streak days where at least 1 intention was fulfilled
    const fulfilledDates = new Set(
      this.items
        .filter((i) => i.status === "fulfilled" && i.fulfilledAt)
        .map((i) => i.fulfilledAt!.split("T")[0])
    );
    // Include today if fulfilled
    const streakDays = Math.max(1, fulfilledDates.size);

    const categoryBreakdown: Record<SankalpaCategory, number> = {
      shanti: 0,
      satya: 0,
      tapas: 0,
      karuna: 0,
      vairagya: 0,
      dhairya: 0,
      swadhyaya: 0,
    };

    this.items.forEach((item) => {
      if (categoryBreakdown[item.category] !== undefined) {
        categoryBreakdown[item.category]++;
      }
    });

    return {
      totalCount,
      fulfilledCount,
      todayCount,
      todayFulfilledCount,
      streakDays,
      fulfillmentRate,
      categoryBreakdown,
    };
  }

  public getStoredWisdomReminder(): SankalpaWisdomReminder | null {
    try {
      const raw = localStorage.getItem(WISDOM_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Failed to load stored wisdom reminder:", e);
    }
    return null;
  }

  public async fetchWisdomReminder(
    language: IndicLanguageCode = "English",
    forceRefresh: boolean = false
  ): Promise<SankalpaWisdomReminder> {
    const stored = this.getStoredWisdomReminder();
    if (stored && !forceRefresh) {
      // Check if stored reminder is less than 3 hours old
      const ageHours = (Date.now() - new Date(stored.timestamp).getTime()) / (1000 * 60 * 60);
      if (ageHours < 3) {
        return stored;
      }
    }

    const stats = this.getStats();
    const intentions = this.items.slice(0, 10);

    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? "morning" : currentHour < 17 ? "afternoon" : "evening";

    try {
      const res = await fetch("/api/sankalpa/wisdom-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentions,
          stats,
          language,
          timeOfDay,
        }),
      });

      if (!res.ok) {
        throw new Error(`Wisdom reminder API error status: ${res.status}`);
      }

      const reminder: SankalpaWisdomReminder = await res.json();
      localStorage.setItem(WISDOM_STORAGE_KEY, JSON.stringify(reminder));
      return reminder;
    } catch (err) {
      console.warn("Error fetching AI wisdom reminder:", err);
      // Fallback
      const fallback: SankalpaWisdomReminder = {
        id: `wisdom-fb-${Date.now()}`,
        source: "Bhagavad Gita 2.47",
        shlokaSanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन । मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥",
        shlokaTransliteration: "karmaṇy evādhikāras te mā phaleṣu kadācana | mā karma-phala-hetur bhūr mā te saṅgo 'stv akarmaṇi ||",
        shlokaTranslation: "You have a sacred right to perform prescribed duties, but never to the fruits of action. Be not motivated by results, nor indulge in apathy.",
        virtueTheme: "Nishkama Karma (निष्काम कर्म)",
        guidanceText: "In the spirit of your daily Sankalpa, anchor your mind entirely on sincere dharmic effort. When the mind rests in dedication rather than anxious anticipation of outcomes, every step becomes joyous meditation.",
        progressReflection: `You have completed ${stats.fulfilledCount} intentions. Consistency in small acts builds the mighty river of spiritual transformation.`,
        microPractice: {
          title: "3-Breath Consecration",
          duration: "1 Minute",
          instruction: "Inhale slowly feeling prana replenish your resolve; exhale gently offering all results to the universe.",
        },
        dailyNudge: "Act with serene dedication today, trusting that noble effort carries its own fulfillment.",
        timestamp: new Date().toISOString(),
        isAiGenerated: false,
      };
      localStorage.setItem(WISDOM_STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }
  }
}

export const sankalpaService = new SankalpaService();
