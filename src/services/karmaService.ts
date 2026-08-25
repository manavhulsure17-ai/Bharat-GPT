import {
  UserKarmaProfile,
  KarmaCategory,
  KarmaLogItem,
  KarmaLevel,
  UserBadge,
} from "../types";
import { KARMA_LEVELS, MASTER_BADGES } from "../data/karmaBadgesData";
import { toast } from "./toastService";
import { soundscape } from "./audioSynth";

const STORAGE_KEY = "prajna_bharat_karma_profile_v1";

type KarmaListener = (profile: UserKarmaProfile) => void;

class KarmaService {
  private profile: UserKarmaProfile;
  private listeners: Set<KarmaListener> = new Set();

  constructor() {
    this.profile = this.loadProfile();
    this.checkDailyStreak();
  }

  private getDefaultProfile(): UserKarmaProfile {
    return {
      totalPoints: 50, // Starter karma
      currentLevel: 1,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split("T")[0],
      badges: MASTER_BADGES.map((b) => ({ ...b })),
      history: [
        {
          id: "initial_blessing",
          activity: "Initiation Blessing • Begun Indic Wisdom Journey",
          points: 50,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          category: "streak",
        },
      ],
      stats: {
        gitaVersesRead: 0,
        gitaChaptersExplored: 0,
        dailyWisdomReadCount: 0,
        heritageTopicsExplored: 0,
        storiesCompleted: 0,
        quizzesCompleted: 0,
        translationsDone: 0,
        vaultItemsSaved: 0,
      },
    };
  }

  private loadProfile(): UserKarmaProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Merge badges with any newly added master badges
        const mergedBadges = MASTER_BADGES.map((mb) => {
          const existing = parsed.badges?.find((b: UserBadge) => b.id === mb.id);
          return existing ? { ...mb, ...existing } : mb;
        });

        return {
          ...this.getDefaultProfile(),
          ...parsed,
          badges: mergedBadges,
          stats: {
            ...this.getDefaultProfile().stats,
            ...(parsed.stats || {}),
          },
        };
      }
    } catch (e) {
      console.error("Failed to load karma profile from localStorage", e);
    }
    return this.getDefaultProfile();
  }

  private saveProfile() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      console.error("Failed to save karma profile", e);
    }
    this.notify();
  }

  private notify() {
    const clone = this.getProfile();
    this.listeners.forEach((listener) => listener(clone));
  }

  public subscribe(listener: KarmaListener): () => void {
    this.listeners.add(listener);
    listener(this.getProfile());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getProfile(): UserKarmaProfile {
    return JSON.parse(JSON.stringify(this.profile));
  }

  public getLevelInfo(points?: number): { current: KarmaLevel; next: KarmaLevel | null; progressPercent: number } {
    const pts = points !== undefined ? points : this.profile.totalPoints;
    let current = KARMA_LEVELS[0];
    let next: KarmaLevel | null = KARMA_LEVELS[1] || null;

    for (let i = 0; i < KARMA_LEVELS.length; i++) {
      if (pts >= KARMA_LEVELS[i].minPoints) {
        current = KARMA_LEVELS[i];
        next = KARMA_LEVELS[i + 1] || null;
      }
    }

    let progressPercent = 100;
    if (next) {
      const range = next.minPoints - current.minPoints;
      const earnedInRange = pts - current.minPoints;
      progressPercent = Math.min(100, Math.max(0, Math.round((earnedInRange / range) * 100)));
    }

    return { current, next, progressPercent };
  }

  public checkDailyStreak() {
    const today = new Date().toISOString().split("T")[0];
    const lastActive = this.profile.lastActiveDate;

    if (lastActive !== today) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        this.profile.streakDays += 1;
      } else if (diffDays > 1) {
        this.profile.streakDays = 1;
      }
      this.profile.lastActiveDate = today;
      this.saveProfile();
    }
  }

  public checkDailyDarshan() {
    this.checkDailyStreak();
  }

  /**
   * Claim daily darshan bonus
   */
  public claimDailyBonus(): boolean {
    const today = new Date().toISOString().split("T")[0];
    if (this.profile.dailyBonusClaimedDate === today) {
      return false;
    }

    this.profile.dailyBonusClaimedDate = today;
    this.addKarma(
      35,
      `Nitya Darshan Bonus • Day ${this.profile.streakDays} Streak`,
      "streak",
      true
    );
    return true;
  }

  /**
   * Primary method to reward Karma Points
   */
  public addKarma(
    points: number,
    activityTitle: string,
    category: KarmaCategory,
    silentToast = false
  ) {
    if (points <= 0) return;

    const prevLevel = this.getLevelInfo().current.level;
    this.profile.totalPoints += points;

    const logItem: KarmaLogItem = {
      id: `karma_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      activity: activityTitle,
      points,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category,
    };

    this.profile.history = [logItem, ...this.profile.history.slice(0, 49)];

    // Check level up
    const newLevelInfo = this.getLevelInfo();
    const newLevel = newLevelInfo.current.level;
    this.profile.currentLevel = newLevel;

    // Check automatic badge unlock triggers
    this.evaluateBadges();

    this.saveProfile();

    // Feedback
    if (!silentToast) {
      toast.show(
        `+${points} Karma Points earned • ${activityTitle}`,
        "karma",
        {
          title: "Karma Blessing",
          duration: 3500,
        }
      );
    }

    // Level up celebration!
    if (newLevel > prevLevel) {
      soundscape.playTempleBell();
      toast.success(
        `Ascended to Level ${newLevel}: ${newLevelInfo.current.indicTitle}! 🙏`,
        {
          title: "Level Up • पदोन्नति",
          duration: 6000,
        }
      );
    }
  }

  /**
   * Increment activity stats and trigger badges
   */
  public recordActivity(
    type: keyof UserKarmaProfile["stats"],
    count = 1
  ) {
    this.profile.stats[type] = (this.profile.stats[type] || 0) + count;
    this.evaluateBadges();
    this.saveProfile();
  }

  /**
   * Evaluate all badge unlock criteria
   */
  public evaluateBadges() {
    const { stats, totalPoints } = this.profile;

    // 1. First step
    if (totalPoints > 0) {
      this.unlockBadge("vidya-jigyasu");
    }

    // 2. Gita Seeker (3+ verses or guidance)
    if (stats.gitaVersesRead >= 3) {
      this.unlockBadge("gita-sadhak");
    }

    // 3. Gita 18 chapters
    if (stats.gitaChaptersExplored >= 18) {
      this.unlockBadge("gita-jnana-yogi");
    }

    // 4. Daily wisdom read (3+ days/times)
    if (stats.dailyWisdomReadCount >= 3) {
      this.unlockBadge("nitya-jnani");
    }

    // 5. Heritage explorer (5+ sites)
    if (stats.heritageTopicsExplored >= 5) {
      this.unlockBadge("dharohar-drashta");
    }

    // 6. Katha storyteller
    if (stats.storiesCompleted >= 1) {
      this.unlockBadge("katha-shilpi");
    }

    // 7. Quiz champion
    if (stats.quizzesCompleted >= 1) {
      this.unlockBadge("itihaas-marmagya");
    }

    // 8. Bhasha Sangam
    if (stats.translationsDone >= 3) {
      this.unlockBadge("bhasha-sangam");
    }

    // 9. Smriti Vault
    if (stats.vaultItemsSaved >= 5) {
      this.unlockBadge("smriti-rakshak");
    }

    // 10. Bharat Acharya (Level 4, 700+ points)
    if (totalPoints >= 700) {
      this.unlockBadge("bharat-acharya");
    }

    // 11. Brahmarshi (Level 5, 1500+ points)
    if (totalPoints >= 1500) {
      this.unlockBadge("brahmarshi");
    }
  }

  /**
   * Unlock a badge and alert user
   */
  public unlockBadge(badgeId: string): boolean {
    const badge = this.profile.badges.find((b) => b.id === badgeId);
    if (!badge || badge.unlocked) return false;

    badge.unlocked = true;
    badge.unlockedAt = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    this.saveProfile();
    soundscape.playTempleBell();

    toast.show(
      `Unlocked ${badge.icon} "${badge.name}" (${badge.indicName}) badge!`,
      "vault",
      {
        title: "Sacred Badge Unlocked 🏆",
        duration: 5000,
      }
    );

    return true;
  }
}

export const karmaService = new KarmaService();
