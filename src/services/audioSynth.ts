// Web Audio API authentic Indian soundscapes & Web Speech Synthesis

export type SpeechStateListener = (state: {
  isSpeaking: boolean;
  speakingId: string | null;
  activeLanguage: string;
}) => void;

class IndianSoundscapeService {
  private ctx: AudioContext | null = null;
  private isTanpuraPlaying = false;
  private tanpuraInterval: any = null;
  private tanpuraGain: GainNode | null = null;

  // Speech synthesis state
  private availableVoices: SpeechSynthesisVoice[] = [];
  private currentSpeakingId: string | null = null;
  private isSpeechActive = false;
  private speechUtteranceQueue: SpeechSynthesisUtterance[] = [];
  private currentUtteranceIndex = 0;
  private speechKeepAliveInterval: any = null;
  private listeners: Set<SpeechStateListener> = new Set();

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  private initVoices() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }
  }

  public subscribe(listener: SpeechStateListener): () => void {
    this.listeners.add(listener);
    // Initial notification
    listener({
      isSpeaking: this.isSpeechActive,
      speakingId: this.currentSpeakingId,
      activeLanguage: "English",
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyState(lang: string = "English") {
    const state = {
      isSpeaking: this.isSpeechActive,
      speakingId: this.currentSpeakingId,
      activeLanguage: lang,
    };
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (e) {
        console.error("Speech listener error:", e);
      }
    });
  }

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Plays a single rich string pluck with simulated Javari (buzzing overtone bridge)
  private pluckString(freq: number, time: number, duration: number = 3.5, gainFactor: number = 0.15) {
    if (!this.ctx || !this.tanpuraGain) return;

    const oscRoot = this.ctx.createOscillator();
    const oscHarmonic1 = this.ctx.createOscillator();
    const oscHarmonic2 = this.ctx.createOscillator();
    const stringGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Warm triangle + rich saw mixture for acoustic string warmth
    oscRoot.type = "triangle";
    oscRoot.frequency.setValueAtTime(freq, time);

    oscHarmonic1.type = "sawtooth";
    oscHarmonic1.frequency.setValueAtTime(freq * 2, time);

    oscHarmonic2.type = "sine";
    oscHarmonic2.frequency.setValueAtTime(freq * 3, time);

    // Filter simulating hollow gourd / wood body resonance (Tumba)
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(freq * 2.5, time);
    filter.Q.setValueAtTime(2.0, time);

    // Envelope
    stringGain.gain.setValueAtTime(0, time);
    stringGain.gain.linearRampToValueAtTime(gainFactor, time + 0.04);
    stringGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    oscRoot.connect(stringGain);
    oscHarmonic1.connect(filter);
    filter.connect(stringGain);
    oscHarmonic2.connect(stringGain);

    stringGain.connect(this.tanpuraGain);

    oscRoot.start(time);
    oscHarmonic1.start(time);
    oscHarmonic2.start(time);

    oscRoot.stop(time + duration);
    oscHarmonic1.stop(time + duration);
    oscHarmonic2.stop(time + duration);
  }

  // Starts authentic 4-string Tanpura loop: Pa (G#3 ~207Hz), Sa (C#4 ~277Hz), Sa (C#4 ~277Hz), Kharja Sa (C#3 ~138Hz)
  public toggleTanpura(onState?: boolean): boolean {
    const ctx = this.getAudioContext();

    if (this.isTanpuraPlaying || onState === false) {
      // Stop Tanpura
      if (this.tanpuraInterval) {
        clearInterval(this.tanpuraInterval);
        this.tanpuraInterval = null;
      }
      if (this.tanpuraGain) {
        this.tanpuraGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      }
      this.isTanpuraPlaying = false;
      return false;
    } else {
      // Start Tanpura
      this.tanpuraGain = ctx.createGain();
      this.tanpuraGain.gain.setValueAtTime(0.3, ctx.currentTime);
      this.tanpuraGain.connect(ctx.destination);

      const baseSa = 138.59; // C#3 (Kharja)
      const pa = 207.65;     // G#3 (Pancham)
      const tarSa = 277.18;  // C#4 (Madhya Sa)

      const playCycle = () => {
        if (!this.isTanpuraPlaying) return;
        const now = ctx.currentTime;
        // Classical 4-string sequence: Pa -> Sa -> Sa -> Low Sa
        this.pluckString(pa, now + 0.0, 3.2, 0.12);
        this.pluckString(tarSa, now + 1.1, 3.2, 0.14);
        this.pluckString(tarSa, now + 2.2, 3.2, 0.14);
        this.pluckString(baseSa, now + 3.3, 4.0, 0.18);
      };

      this.isTanpuraPlaying = true;
      playCycle();
      this.tanpuraInterval = setInterval(playCycle, 4400);
      return true;
    }
  }

  public isTanpuraActive(): boolean {
    return this.isTanpuraPlaying;
  }

  public toggleDrone(onState?: boolean): boolean {
    return this.toggleTanpura(onState);
  }

  // Play peaceful temple bell / gong on discovery or quiz win
  public playTempleBell() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.25, now);
      masterGain.connect(ctx.destination);

      // Metallic bell frequencies (non-harmonic overtones)
      const freqs = [587.33, 880, 1174.66, 1760, 2637];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        const decay = 3.5 - idx * 0.4;
        g.gain.setValueAtTime(0.15 / (idx + 1), now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(decay, 0.8));

        osc.connect(g);
        g.connect(masterGain);

        osc.start(now);
        osc.stop(now + decay + 0.1);
      });
    } catch (e) {
      console.warn("Audio bell error:", e);
    }
  }

  // Play a short sweet Bansuri flute arpeggio in Raga Bhupali (Sa-Re-Ga-Pa-Dha-Sa)
  public playFluteChime() {
    try {
      const ctx = this.getAudioContext();
      const notes = [277.18, 311.13, 349.23, 415.3, 466.16, 554.37]; // C# Major pentatonic / Bhupali
      const now = ctx.currentTime;

      notes.forEach((freq, i) => {
        const noteTime = now + i * 0.12;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();

        osc.type = "sine";
        // Subtle natural flute vibrato
        osc.frequency.setValueAtTime(freq, noteTime);

        g.gain.setValueAtTime(0, noteTime);
        g.gain.linearRampToValueAtTime(0.08, noteTime + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.8);

        osc.connect(g);
        g.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.85);
      });
    } catch (e) {
      console.warn("Flute sound error:", e);
    }
  }

  /**
   * Cleans text for high-fidelity natural speech recitation
   */
  public cleanTextForSpeech(raw: string): string {
    if (!raw) return "";

    return raw
      .replace(/```[\s\S]*?```/g, "") // remove code blocks
      .replace(/`([^`]+)`/g, "$1") // inline code to text
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // markdown links [text](url) -> text
      .replace(/[*_#~]/g, "") // markdown formatting
      .replace(/•/g, ", ") // bullet points to natural pauses
      .replace(/॥/g, ".") // Vedic double danda to full stop
      .replace(/।/g, ",") // Vedic single danda to comma
      .replace(/(\r\n|\n|\r)/gm, " ") // linebreaks to spaces
      .replace(/\s+/g, " ") // normalize multiple spaces
      .trim();
  }

  /**
   * Intelligently splits long text into digestible conversational chunks (150-220 chars)
   */
  private splitIntoSpeechChunks(text: string): string[] {
    const cleaned = this.cleanTextForSpeech(text);
    if (!cleaned) return [];

    // Split on sentence boundaries: periods, question marks, exclamation points, semicolons
    const rawSentences = cleaned.match(/[^.!?;\n]+[.!?;\n]+/g) || [cleaned];
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of rawSentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;

      if ((currentChunk + " " + trimmed).length < 200) {
        currentChunk = currentChunk ? `${currentChunk} ${trimmed}` : trimmed;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        // If an individual sentence is abnormally long, break it by comma or phrase
        if (trimmed.length > 220) {
          const subPhrases = trimmed.split(/[,:]/);
          let subChunk = "";
          for (const sp of subPhrases) {
            if ((subChunk + " " + sp).length < 180) {
              subChunk = subChunk ? `${subChunk}, ${sp.trim()}` : sp.trim();
            } else {
              if (subChunk) chunks.push(subChunk);
              subChunk = sp.trim();
            }
          }
          if (subChunk) chunks.push(subChunk);
          currentChunk = "";
        } else {
          currentChunk = trimmed;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks.length > 0 ? chunks : [cleaned];
  }

  /**
   * Finds the most natural, human-sounding voice available in the browser
   */
  public selectBestNaturalVoice(lang: string = "Hindi"): SpeechSynthesisVoice | null {
    if (!("speechSynthesis" in window)) return null;

    if (this.availableVoices.length === 0) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }

    const voices = this.availableVoices;
    if (voices.length === 0) return null;

    const langCodeMap: Record<string, string[]> = {
      Hindi: ["hi-IN", "hi"],
      Sanskrit: ["hi-IN", "hi", "sa-IN", "sa"],
      English: ["en-IN", "en-GB", "en-US", "en"],
      Tamil: ["ta-IN", "ta"],
      Telugu: ["te-IN", "te"],
      Bengali: ["bn-IN", "bn-BD", "bn"],
      Marathi: ["mr-IN", "mr"],
      Gujarati: ["gu-IN", "gu"],
      Kannada: ["kn-IN", "kn"],
      Malayalam: ["ml-IN", "ml"],
      Punjabi: ["pa-IN", "pa"],
      Odia: ["or-IN", "or", "hi-IN"],
    };

    const targetLocales = langCodeMap[lang] || ["hi-IN", "en-IN", "en"];

    // 1. First priority: High-quality natural / neural Indic voice matching exact locale
    for (const locale of targetLocales) {
      const naturalVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(locale.toLowerCase()) &&
          (v.name.toLowerCase().includes("natural") ||
            v.name.toLowerCase().includes("online") ||
            v.name.toLowerCase().includes("google") ||
            v.name.toLowerCase().includes("swara") ||
            v.name.toLowerCase().includes("madhur") ||
            v.name.toLowerCase().includes("neerja") ||
            v.name.toLowerCase().includes("prabhat") ||
            v.name.toLowerCase().includes("lekha") ||
            v.name.toLowerCase().includes("veena") ||
            v.name.toLowerCase().includes("rishi"))
      );
      if (naturalVoice) return naturalVoice;
    }

    // 2. Second priority: Any voice matching target locale exactly
    for (const locale of targetLocales) {
      const match = voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith(locale.toLowerCase()));
      if (match) return match;
    }

    // 3. Third priority: Indian English / Hindi voice
    const indianFallback = voices.find(
      (v) =>
        v.lang.toLowerCase().includes("in") ||
        v.name.toLowerCase().includes("india") ||
        v.name.toLowerCase().includes("hindi")
    );
    if (indianFallback) return indianFallback;

    // 4. Default browser voice
    return voices.find((v) => v.default) || voices[0] || null;
  }

  /**
   * Speaks text using sequential chunking, natural prosody, and Chrome keep-alive
   */
  public speakText(
    text: string,
    lang: string = "Hindi",
    utteranceId: string | null = null,
    onEndCallback?: () => void,
    onStartCallback?: () => void,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      onChunkProgress?: (chunkIndex: number, totalChunks: number) => void;
    }
  ): boolean {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return false;
    }

    this.stopSpeaking(); // Cancel any existing speech

    const chunks = this.splitIntoSpeechChunks(text);
    if (chunks.length === 0) return false;

    this.currentSpeakingId = utteranceId;
    this.isSpeechActive = true;
    this.currentUtteranceIndex = 0;
    this.speechUtteranceQueue = [];

    const voice = this.selectBestNaturalVoice(lang);
    const targetRate = options?.rate ?? 0.94;
    const targetPitch = options?.pitch ?? 1.0;
    const targetVolume = options?.volume ?? 1.0;

    // Build speech queue
    chunks.forEach((chunkText, idx) => {
      const utterance = new SpeechSynthesisUtterance(chunkText);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = lang === "English" ? "en-IN" : "hi-IN";
      }

      // Natural, reverent cadence: slightly measured for clarity
      utterance.rate = targetRate;
      utterance.pitch = targetPitch;
      utterance.volume = targetVolume;

      if (idx === 0) {
        utterance.onstart = () => {
          this.isSpeechActive = true;
          this.notifyState(lang);
          if (options?.onChunkProgress) {
            options.onChunkProgress(0, chunks.length);
          }
          if (onStartCallback) onStartCallback();
        };
      }

      utterance.onend = () => {
        this.currentUtteranceIndex++;
        if (options?.onChunkProgress) {
          options.onChunkProgress(this.currentUtteranceIndex, chunks.length);
        }
        if (this.currentUtteranceIndex >= this.speechUtteranceQueue.length) {
          this.cleanupSpeech();
          if (onEndCallback) onEndCallback();
        } else {
          // Play next chunk
          const nextUtterance = this.speechUtteranceQueue[this.currentUtteranceIndex];
          if (nextUtterance && this.isSpeechActive) {
            window.speechSynthesis.speak(nextUtterance);
          }
        }
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis chunk error:", e);
        this.cleanupSpeech();
        if (onEndCallback) onEndCallback();
      };

      this.speechUtteranceQueue.push(utterance);
    });

    // Start speaking first utterance
    if (this.speechUtteranceQueue.length > 0) {
      window.speechSynthesis.speak(this.speechUtteranceQueue[0]);

      // Chrome keep-alive heartbeat
      if (this.speechKeepAliveInterval) {
        clearInterval(this.speechKeepAliveInterval);
      }
      this.speechKeepAliveInterval = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);
    }

    this.notifyState(lang);
    return true;
  }

  private cleanupSpeech() {
    if (this.speechKeepAliveInterval) {
      clearInterval(this.speechKeepAliveInterval);
      this.speechKeepAliveInterval = null;
    }
    this.isSpeechActive = false;
    this.currentSpeakingId = null;
    this.speechUtteranceQueue = [];
    this.currentUtteranceIndex = 0;
    this.notifyState();
  }

  public stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.cleanupSpeech();
  }

  public pauseSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      this.isSpeechActive = false;
      this.notifyState();
    }
  }

  public resumeSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      this.isSpeechActive = true;
      this.notifyState();
    }
  }

  public isSpeaking(): boolean {
    return (
      this.isSpeechActive ||
      (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking)
    );
  }

  public getCurrentSpeakingId(): string | null {
    return this.currentSpeakingId;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.availableVoices.length === 0 && typeof window !== "undefined" && "speechSynthesis" in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }
    return this.availableVoices;
  }
}

export const soundscape = new IndianSoundscapeService();
