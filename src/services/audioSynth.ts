// Web Audio API authentic Indian soundscapes & Web Speech Synthesis

export interface SpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
  speakingId: string | null;
  activeLanguage: string;
  currentChunk: number;
  totalChunks: number;
  progressPercent: number;
  currentTextSnippet?: string;
  playbackRate: number;
}

export type SpeechStateListener = (state: SpeechState) => void;

export interface SoundscapeState {
  isTanpuraPlaying: boolean;
  isNaturePlaying: boolean;
  tanpuraVolume: number;
  natureVolume: number;
}

export type SoundscapeListener = (state: SoundscapeState) => void;

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
  enableAmbientDrone?: boolean;
  onChunkProgress?: (chunkIndex: number, totalChunks: number, chunkText: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

class IndianSoundscapeService {
  private ctx: AudioContext | null = null;
  
  // Tanpura state
  private isTanpuraPlaying = false;
  private tanpuraInterval: any = null;
  private tanpuraGain: GainNode | null = null;
  private tanpuraVolumeLevel = 0.3;

  // Zen Nature state (River stream, forest wind, Himalayan birdsong)
  private isNaturePlaying = false;
  private natureGain: GainNode | null = null;
  private natureStreamGain: GainNode | null = null;
  private natureWindGain: GainNode | null = null;
  private natureBirdGain: GainNode | null = null;
  private streamNoiseNode: AudioBufferSourceNode | null = null;
  private windNoiseNode: AudioBufferSourceNode | null = null;
  private streamLfo: OscillatorNode | null = null;
  private windLfo: OscillatorNode | null = null;
  private natureBirdTimer: any = null;
  private natureVolumeLevel = 0.28;

  // Soundscape listeners
  private soundscapeListeners: Set<SoundscapeListener> = new Set();

  // Speech synthesis state
  private availableVoices: SpeechSynthesisVoice[] = [];
  private currentSpeakingId: string | null = null;
  private isSpeechActive = false;
  private isSpeechPaused = false;
  private speechUtteranceQueue: SpeechSynthesisUtterance[] = [];
  private speechChunksRaw: string[] = [];
  private currentUtteranceIndex = 0;
  private currentPlaybackRate = 0.95;
  private speechKeepAliveInterval: any = null;
  private listeners: Set<SpeechStateListener> = new Set();
  private autoAmbientDroneEnabled = false;

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

  public subscribeSoundscape(listener: SoundscapeListener): () => void {
    this.soundscapeListeners.add(listener);
    listener(this.getSoundscapeState());
    return () => {
      this.soundscapeListeners.delete(listener);
    };
  }

  public getSoundscapeState(): SoundscapeState {
    return {
      isTanpuraPlaying: this.isTanpuraPlaying,
      isNaturePlaying: this.isNaturePlaying,
      tanpuraVolume: this.tanpuraVolumeLevel,
      natureVolume: this.natureVolumeLevel,
    };
  }

  private notifySoundscape() {
    const state = this.getSoundscapeState();
    this.soundscapeListeners.forEach((fn) => {
      try {
        fn(state);
      } catch (e) {
        console.error("Soundscape listener error:", e);
      }
    });
  }

  public subscribe(listener: SpeechStateListener): () => void {
    this.listeners.add(listener);
    // Initial notification
    listener({
      isSpeaking: this.isSpeechActive,
      isPaused: this.isSpeechPaused,
      speakingId: this.currentSpeakingId,
      activeLanguage: "English",
      currentChunk: this.currentUtteranceIndex,
      totalChunks: Math.max(1, this.speechUtteranceQueue.length),
      progressPercent:
        this.speechUtteranceQueue.length > 0
          ? Math.round((this.currentUtteranceIndex / this.speechUtteranceQueue.length) * 100)
          : 0,
      playbackRate: this.currentPlaybackRate,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyState(lang: string = "English") {
    const total = Math.max(1, this.speechUtteranceQueue.length);
    const curr = this.currentUtteranceIndex;
    const progress = total > 0 ? Math.min(100, Math.round((curr / total) * 100)) : 0;
    const snippet = this.speechChunksRaw[curr] || "";

    const state: SpeechState = {
      isSpeaking: this.isSpeechActive,
      isPaused: this.isSpeechPaused,
      speakingId: this.currentSpeakingId,
      activeLanguage: lang,
      currentChunk: curr,
      totalChunks: total,
      progressPercent: progress,
      currentTextSnippet: snippet,
      playbackRate: this.currentPlaybackRate,
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

  // Generates organic noise buffers for natural water stream and forest wind
  private createNoiseBuffer(type: "pink" | "brown" = "pink", durationSec: number = 5): AudioBuffer {
    const ctx = this.getAudioContext();
    const bufferSize = Math.floor(ctx.sampleRate * durationSec);
    const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const left = noiseBuffer.getChannelData(0);
    const right = noiseBuffer.getChannelData(1);

    if (type === "pink") {
      // Paul Kellet's filter algorithm for true 1/f pink noise (warm organic water/wind sound)
      let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
      let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;

      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        b0L = 0.99886 * b0L + whiteL * 0.0555179;
        b1L = 0.99332 * b1L + whiteL * 0.0750759;
        b2L = 0.96900 * b2L + whiteL * 0.1538520;
        b3L = 0.86650 * b3L + whiteL * 0.3104856;
        b4L = 0.55000 * b4L + whiteL * 0.5329522;
        b5L = -0.7616 * b5L - whiteL * 0.0168980;
        left[i] = (b0L + b1L + b2L + b3L + b4L + b5L + b6L + whiteL * 0.5362) * 0.11;
        b6L = whiteL * 0.115926;

        const whiteR = Math.random() * 2 - 1;
        b0R = 0.99886 * b0R + whiteR * 0.0555179;
        b1R = 0.99332 * b1R + whiteR * 0.0750759;
        b2R = 0.96900 * b2R + whiteR * 0.1538520;
        b3R = 0.86650 * b3R + whiteR * 0.3104856;
        b4R = 0.55000 * b4R + whiteR * 0.5329522;
        b5R = -0.7616 * b5R - whiteR * 0.0168980;
        right[i] = (b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362) * 0.11;
        b6R = whiteR * 0.115926;
      }
    } else {
      // Brown noise (integrated white noise) for deep riverbed rumble
      let lastOutL = 0.0;
      let lastOutR = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        left[i] = (lastOutL + 0.02 * whiteL) / 1.02;
        lastOutL = left[i];
        left[i] *= 0.3;

        const whiteR = Math.random() * 2 - 1;
        right[i] = (lastOutR + 0.02 * whiteR) / 1.02;
        lastOutR = right[i];
        right[i] *= 0.3;
      }
    }

    return noiseBuffer;
  }

  // Synthesizes a natural, sweet procedural birdsong motif (Pakshi Kalarav)
  private playForestBirdCall() {
    if (!this.ctx || !this.natureBirdGain || !this.isNaturePlaying) return;

    try {
      const now = this.ctx.currentTime;
      const motifType = Math.floor(Math.random() * 3);

      if (motifType === 0) {
        // Motif 1: Morning Bulbul warble (3 melodic rising & falling chirps)
        const notes = [3100, 3750, 3350];
        notes.forEach((baseFreq, i) => {
          const chirpTime = now + i * 0.14 + Math.random() * 0.02;
          const osc = this.ctx!.createOscillator();
          const chirpGain = this.ctx!.createGain();
          const fmOsc = this.ctx!.createOscillator();
          const fmGain = this.ctx!.createGain();

          // FM trill modulation
          fmOsc.type = "sine";
          fmOsc.frequency.setValueAtTime(38, chirpTime);
          fmGain.gain.setValueAtTime(45, chirpTime);
          fmOsc.connect(osc.frequency);

          osc.type = "sine";
          osc.frequency.setValueAtTime(baseFreq, chirpTime);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, chirpTime + 0.05);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, chirpTime + 0.11);

          chirpGain.gain.setValueAtTime(0, chirpTime);
          chirpGain.gain.linearRampToValueAtTime(0.04, chirpTime + 0.015);
          chirpGain.gain.exponentialRampToValueAtTime(0.0001, chirpTime + 0.12);

          osc.connect(chirpGain);
          chirpGain.connect(this.natureBirdGain!);

          fmOsc.start(chirpTime);
          osc.start(chirpTime);
          fmOsc.stop(chirpTime + 0.13);
          osc.stop(chirpTime + 0.13);
        });
      } else if (motifType === 1) {
        // Motif 2: Sweet Forest Sunbird (High upward glissando + soft echo)
        const baseFreq = 3400 + Math.random() * 400;
        const osc = this.ctx.createOscillator();
        const chirpGain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.05, now + 0.16);

        chirpGain.gain.setValueAtTime(0, now);
        chirpGain.gain.linearRampToValueAtTime(0.05, now + 0.02);
        chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.connect(chirpGain);
        chirpGain.connect(this.natureBirdGain);

        osc.start(now);
        osc.stop(now + 0.2);

        // Echo chirp after 120ms
        const echoOsc = this.ctx.createOscillator();
        const echoGain = this.ctx.createGain();
        echoOsc.type = "sine";
        echoOsc.frequency.setValueAtTime(baseFreq * 1.15, now + 0.18);
        echoOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.24);
        echoGain.gain.setValueAtTime(0, now + 0.18);
        echoGain.gain.linearRampToValueAtTime(0.03, now + 0.19);
        echoGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

        echoOsc.connect(echoGain);
        echoGain.connect(this.natureBirdGain);

        echoOsc.start(now + 0.18);
        echoOsc.stop(now + 0.33);
      } else {
        // Motif 3: Himalayan Wood Thrush (Double bell-tone flute call)
        const f1 = 2600 + Math.random() * 200;
        const f2 = f1 * 1.33; // 4th interval
        [f1, f2].forEach((freq, idx) => {
          const startTime = now + idx * 0.18;
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);
          osc.frequency.linearRampToValueAtTime(freq * 1.04, startTime + 0.08);

          g.gain.setValueAtTime(0, startTime);
          g.gain.linearRampToValueAtTime(0.035, startTime + 0.025);
          g.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.16);

          osc.connect(g);
          g.connect(this.natureBirdGain!);

          osc.start(startTime);
          osc.stop(startTime + 0.18);
        });
      }
    } catch (e) {
      console.warn("Birdsong synthesis error:", e);
    }
  }

  // Starts authentic 4-string Tanpura loop: Pa (G#3 ~207Hz), Sa (C#4 ~277Hz), Sa (C#4 ~277Hz), Kharja Sa (C#3 ~138Hz)
  public toggleTanpura(onState?: boolean, gainLevel?: number): boolean {
    const ctx = this.getAudioContext();
    if (gainLevel !== undefined) {
      this.tanpuraVolumeLevel = gainLevel;
    }

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
      this.notifySoundscape();
      return false;
    } else {
      // Start Tanpura
      this.tanpuraGain = ctx.createGain();
      this.tanpuraGain.gain.setValueAtTime(this.tanpuraVolumeLevel, ctx.currentTime);
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
      this.notifySoundscape();
      return true;
    }
  }

  public isTanpuraActive(): boolean {
    return this.isTanpuraPlaying;
  }

  public setTanpuraVolume(volume: number) {
    this.tanpuraVolumeLevel = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.tanpuraGain && this.isTanpuraPlaying) {
      this.tanpuraGain.gain.linearRampToValueAtTime(this.tanpuraVolumeLevel, this.ctx.currentTime + 0.1);
    }
    this.notifySoundscape();
  }

  // Toggles Zen Nature Soundscape (River Stream, Forest Wind, and Himalayan Birdsong)
  public toggleZenNature(onState?: boolean, gainLevel?: number): boolean {
    const ctx = this.getAudioContext();
    if (gainLevel !== undefined) {
      this.natureVolumeLevel = gainLevel;
    }

    if (this.isNaturePlaying || onState === false) {
      // Stop Zen Nature
      if (this.natureBirdTimer) {
        clearTimeout(this.natureBirdTimer);
        this.natureBirdTimer = null;
      }
      if (this.natureGain) {
        this.natureGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      }
      setTimeout(() => {
        try {
          if (this.streamNoiseNode) {
            this.streamNoiseNode.stop();
            this.streamNoiseNode.disconnect();
            this.streamNoiseNode = null;
          }
          if (this.windNoiseNode) {
            this.windNoiseNode.stop();
            this.windNoiseNode.disconnect();
            this.windNoiseNode = null;
          }
          if (this.streamLfo) {
            this.streamLfo.stop();
            this.streamLfo.disconnect();
            this.streamLfo = null;
          }
          if (this.windLfo) {
            this.windLfo.stop();
            this.windLfo.disconnect();
            this.windLfo = null;
          }
        } catch {
          // ignore cleanup err
        }
      }, 550);

      this.isNaturePlaying = false;
      this.notifySoundscape();
      return false;
    } else {
      // Start Zen Nature Soundscape
      try {
        const now = ctx.currentTime;

        // Master Nature Gain
        this.natureGain = ctx.createGain();
        this.natureGain.gain.setValueAtTime(this.natureVolumeLevel, now);
        this.natureGain.connect(ctx.destination);

        // 1. River Stream Synthesis (Prakriti Dhara)
        const streamBuffer = this.createNoiseBuffer("pink", 5);
        this.streamNoiseNode = ctx.createBufferSource();
        this.streamNoiseNode.buffer = streamBuffer;
        this.streamNoiseNode.loop = true;

        const streamFilter = ctx.createBiquadFilter();
        streamFilter.type = "lowpass";
        streamFilter.frequency.setValueAtTime(540, now);
        streamFilter.Q.setValueAtTime(1.8, now);

        // Stream LFO for bubbling ripple swells
        this.streamLfo = ctx.createOscillator();
        this.streamLfo.type = "sine";
        this.streamLfo.frequency.setValueAtTime(0.28, now); // ~3.5s swell cycle
        const streamLfoGain = ctx.createGain();
        streamLfoGain.gain.setValueAtTime(180, now); // modulates filter cutoff ±180Hz
        this.streamLfo.connect(streamLfoGain);
        streamLfoGain.connect(streamFilter.frequency);

        this.natureStreamGain = ctx.createGain();
        this.natureStreamGain.gain.setValueAtTime(0.55, now);

        this.streamNoiseNode.connect(streamFilter);
        streamFilter.connect(this.natureStreamGain);
        this.natureStreamGain.connect(this.natureGain);

        this.streamNoiseNode.start(now);
        this.streamLfo.start(now);

        // 2. Forest Wind & Canopy Breeze Synthesis (Vana Pavana)
        const windBuffer = this.createNoiseBuffer("pink", 6);
        this.windNoiseNode = ctx.createBufferSource();
        this.windNoiseNode.buffer = windBuffer;
        this.windNoiseNode.loop = true;

        const windFilter = ctx.createBiquadFilter();
        windFilter.type = "bandpass";
        windFilter.frequency.setValueAtTime(450, now);
        windFilter.Q.setValueAtTime(2.2, now);

        this.windLfo = ctx.createOscillator();
        this.windLfo.type = "sine";
        this.windLfo.frequency.setValueAtTime(0.06, now); // ~16s slow wind breath
        const windLfoGain = ctx.createGain();
        windLfoGain.gain.setValueAtTime(220, now);
        this.windLfo.connect(windLfoGain);
        windLfoGain.connect(windFilter.frequency);

        this.natureWindGain = ctx.createGain();
        this.natureWindGain.gain.setValueAtTime(0.35, now);

        this.windNoiseNode.connect(windFilter);
        windFilter.connect(this.natureWindGain);
        this.natureWindGain.connect(this.natureGain);

        this.windNoiseNode.start(now);
        this.windLfo.start(now);

        // 3. Himalayan Forest Birds (Pakshi Kalarav)
        this.natureBirdGain = ctx.createGain();
        this.natureBirdGain.gain.setValueAtTime(0.85, now);
        this.natureBirdGain.connect(this.natureGain);

        const scheduleNextBird = () => {
          if (!this.isNaturePlaying) return;
          const nextInterval = 3200 + Math.random() * 4500; // 3.2s to 7.7s
          this.natureBirdTimer = setTimeout(() => {
            if (this.isNaturePlaying) {
              this.playForestBirdCall();
              scheduleNextBird();
            }
          }, nextInterval);
        };

        // First bird call in 1.5s
        this.natureBirdTimer = setTimeout(() => {
          if (this.isNaturePlaying) {
            this.playForestBirdCall();
            scheduleNextBird();
          }
        }, 1400);

        this.isNaturePlaying = true;
        this.notifySoundscape();
        return true;
      } catch (err) {
        console.error("Failed to start Zen Nature soundscape:", err);
        this.isNaturePlaying = false;
        return false;
      }
    }
  }

  public isZenNatureActive(): boolean {
    return this.isNaturePlaying;
  }

  public setNatureVolume(volume: number) {
    this.natureVolumeLevel = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.natureGain && this.isNaturePlaying) {
      this.natureGain.gain.linearRampToValueAtTime(this.natureVolumeLevel, this.ctx.currentTime + 0.1);
    }
    this.notifySoundscape();
  }

  // Set soundscape presets: 'tanpura' | 'nature' | 'both' | 'off'
  public setSoundscapePreset(preset: "tanpura" | "nature" | "both" | "off"): SoundscapeState {
    if (preset === "tanpura") {
      this.toggleTanpura(true);
      this.toggleZenNature(false);
    } else if (preset === "nature") {
      this.toggleTanpura(false);
      this.toggleZenNature(true);
    } else if (preset === "both") {
      this.toggleTanpura(true);
      this.toggleZenNature(true);
    } else if (preset === "off") {
      this.toggleTanpura(false);
      this.toggleZenNature(false);
    }
    return this.getSoundscapeState();
  }

  public toggleDrone(onState?: boolean): boolean {
    return this.toggleTanpura(onState);
  }

  public isAnySoundscapeActive(): boolean {
    return this.isTanpuraPlaying || this.isNaturePlaying;
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
   * Cleans and enhances text for authentic natural speech recitation
   */
  public cleanTextForSpeech(raw: string): string {
    if (!raw) return "";

    return raw
      .replace(/```[\s\S]*?```/g, "") // remove code blocks
      .replace(/`([^`]+)`/g, "$1") // inline code to text
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // markdown links [text](url) -> text
      .replace(/[*_#~]/g, "") // markdown formatting
      .replace(/•/g, ", ") // bullet points to natural pauses
      .replace(/॥/g, ". ") // Vedic double danda to full stop
      .replace(/।/g, ", ") // Vedic single danda to natural breath comma
      .replace(/\bBCE\b/g, "Before Common Era")
      .replace(/\bCE\b/g, "Common Era")
      .replace(/\bAD\b/g, "Anno Domini")
      .replace(/\bc\.\s*(\d+)/g, "circa $1")
      .replace(/\bapprox\./g, "approximately")
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
  public selectBestNaturalVoice(lang: string = "Hindi", preferredVoiceName?: string): SpeechSynthesisVoice | null {
    if (!("speechSynthesis" in window)) return null;

    if (this.availableVoices.length === 0) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }

    const voices = this.availableVoices;
    if (voices.length === 0) return null;

    // Preferred voice override if specified
    if (preferredVoiceName) {
      const customMatch = voices.find((v) => v.name.toLowerCase().includes(preferredVoiceName.toLowerCase()));
      if (customMatch) return customMatch;
    }

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
    options?: TTSOptions
  ): boolean {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return false;
    }

    this.stopSpeaking(); // Cancel any existing speech

    const chunks = this.splitIntoSpeechChunks(text);
    if (chunks.length === 0) return false;

    this.currentSpeakingId = utteranceId;
    this.isSpeechActive = true;
    this.isSpeechPaused = false;
    this.currentUtteranceIndex = 0;
    this.speechChunksRaw = chunks;
    this.speechUtteranceQueue = [];

    const voice = this.selectBestNaturalVoice(lang, options?.voiceName);
    const targetRate = options?.rate ?? 0.95;
    this.currentPlaybackRate = targetRate;
    const targetPitch = options?.pitch ?? 1.0;
    const targetVolume = options?.volume ?? 1.0;

    // Optional background drone
    if (options?.enableAmbientDrone && !this.isTanpuraPlaying) {
      this.toggleTanpura(true, 0.12);
      this.autoAmbientDroneEnabled = true;
    }

    // Build speech queue
    chunks.forEach((chunkText, idx) => {
      const utterance = new SpeechSynthesisUtterance(chunkText);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = lang === "English" ? "en-IN" : "hi-IN";
      }

      // Natural, reverent cadence
      utterance.rate = targetRate;
      utterance.pitch = targetPitch;
      utterance.volume = targetVolume;

      if (idx === 0) {
        utterance.onstart = () => {
          this.isSpeechActive = true;
          this.isSpeechPaused = false;
          this.notifyState(lang);
          if (options?.onChunkProgress) {
            options.onChunkProgress(0, chunks.length, chunkText);
          }
          if (onStartCallback) onStartCallback();
          if (options?.onStart) options.onStart();
        };
      }

      utterance.onend = () => {
        this.currentUtteranceIndex++;
        this.notifyState(lang);
        if (options?.onChunkProgress && this.currentUtteranceIndex < chunks.length) {
          options.onChunkProgress(
            this.currentUtteranceIndex,
            chunks.length,
            this.speechChunksRaw[this.currentUtteranceIndex] || ""
          );
        }
        if (this.currentUtteranceIndex >= this.speechUtteranceQueue.length) {
          this.cleanupSpeech();
          if (onEndCallback) onEndCallback();
          if (options?.onEnd) options.onEnd();
        } else {
          // Play next chunk
          const nextUtterance = this.speechUtteranceQueue[this.currentUtteranceIndex];
          if (nextUtterance && this.isSpeechActive && !this.isSpeechPaused) {
            window.speechSynthesis.speak(nextUtterance);
          }
        }
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis chunk error:", e);
        this.cleanupSpeech();
        if (onEndCallback) onEndCallback();
        if (options?.onEnd) options.onEnd();
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
    if (this.autoAmbientDroneEnabled) {
      this.toggleTanpura(false);
      this.autoAmbientDroneEnabled = false;
    }
    this.isSpeechActive = false;
    this.isSpeechPaused = false;
    this.currentSpeakingId = null;
    this.speechUtteranceQueue = [];
    this.speechChunksRaw = [];
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
      this.isSpeechPaused = true;
      this.notifyState();
    }
  }

  public resumeSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      this.isSpeechPaused = false;
      this.isSpeechActive = true;
      this.notifyState();
    }
  }

  public togglePauseSpeaking() {
    if (this.isSpeechPaused) {
      this.resumeSpeaking();
    } else if (this.isSpeechActive) {
      this.pauseSpeaking();
    }
  }

  public isSpeaking(): boolean {
    return (
      this.isSpeechActive ||
      (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking)
    );
  }

  public isPaused(): boolean {
    return this.isSpeechPaused;
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

