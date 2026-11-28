import { MusicPlayer, type TrackId } from './music';

/**
 * All sound is synthesized with WebAudio: zero audio files to download. Sound effects live
 * here; the FM soundtrack lives in music.ts.
 */
type Sfx =
  | 'blip'
  | 'confirm'
  | 'back'
  | 'hit'
  | 'heal'
  | 'shield'
  | 'encounter'
  | 'win'
  | 'lose'
  | 'step'
  | 'chest'
  | 'chestOpen'
  | 'pickup'
  | 'evolve';

const NOTES: Record<Sfx, [number, number, OscillatorType][]> = {
  blip: [[880, 0.04, 'square']],
  confirm: [
    [660, 0.05, 'square'],
    [990, 0.08, 'square'],
  ],
  back: [
    [440, 0.05, 'square'],
    [330, 0.07, 'square'],
  ],
  hit: [
    [180, 0.06, 'sawtooth'],
    [90, 0.1, 'sawtooth'],
  ],
  heal: [
    [523, 0.07, 'triangle'],
    [659, 0.07, 'triangle'],
    [784, 0.12, 'triangle'],
  ],
  shield: [
    [300, 0.06, 'triangle'],
    [450, 0.1, 'triangle'],
  ],
  encounter: [
    [392, 0.07, 'square'],
    [523, 0.07, 'square'],
    [392, 0.07, 'square'],
    [659, 0.15, 'square'],
  ],
  win: [
    [523, 0.1, 'square'],
    [659, 0.1, 'square'],
    [784, 0.1, 'square'],
    [1046, 0.3, 'square'],
  ],
  lose: [
    [392, 0.15, 'triangle'],
    [330, 0.15, 'triangle'],
    [262, 0.4, 'triangle'],
  ],
  step: [[120, 0.02, 'triangle']],
  chest: [
    [784, 0.06, 'square'],
    [988, 0.06, 'square'],
    [1175, 0.06, 'square'],
    [1568, 0.15, 'square'],
  ],
  chestOpen: [
    [220, 0.07, 'sawtooth'],
    [294, 0.07, 'triangle'],
    [440, 0.08, 'triangle'],
    [659, 0.1, 'square'],
    [880, 0.18, 'square'],
  ],
  pickup: [
    [523, 0.05, 'triangle'],
    [784, 0.09, 'triangle'],
  ],
  evolve: [
    [523, 0.08, 'triangle'],
    [659, 0.08, 'triangle'],
    [784, 0.08, 'triangle'],
    [1046, 0.08, 'triangle'],
    [1318, 0.3, 'triangle'],
  ],
};

/** Pet vocalizations (see AudioSystem.voice). */
export type VoiceKind = 'chirp' | 'happy' | 'growl' | 'yelp' | 'whine';

interface VoiceDef {
  /** [time s, Hz] pitch contour; the last time is the total length. */
  contour: [number, number][];
  /** [time s, 0..1] gain envelope. */
  envelope: [number, number][];
  /** [Hz, Q, gain] band-pass formants. */
  formants: [number, number, number][];
  /** [rate Hz, depth 0..1] amplitude flutter (the rolled "rrr"). */
  flutter: [number, number];
  /** [rate Hz, depth Hz] pitch vibrato. */
  vibrato: [number, number];
  breath: number;
  gain: number;
}

const VOICES: Record<VoiceKind, VoiceDef> = {
  // Curious "mrrp?": short rolled trill that rises at the end.
  chirp: {
    contour: [
      [0, 520],
      [0.07, 610],
      [0.16, 820],
      [0.22, 760],
    ],
    envelope: [
      [0.02, 1],
      [0.15, 0.8],
    ],
    formants: [
      [950, 6, 1],
      [2500, 8, 0.5],
    ],
    flutter: [30, 0.55],
    vibrato: [7, 12],
    breath: 0,
    gain: 0.5,
  },
  // Content purr-trill when petted: three soft rolling coos.
  happy: {
    contour: [
      [0, 600],
      [0.12, 700],
      [0.18, 620],
      [0.32, 760],
      [0.38, 660],
      [0.55, 820],
      [0.62, 700],
    ],
    envelope: [
      [0.03, 0.8],
      [0.12, 0.4],
      [0.17, 0.85],
      [0.3, 0.4],
      [0.37, 0.9],
      [0.5, 0.6],
    ],
    formants: [
      [800, 5, 1],
      [2200, 7, 0.4],
    ],
    flutter: [24, 0.7],
    vibrato: [5, 10],
    breath: 0,
    gain: 0.42,
  },
  // Attack grunt: low rough growl that drops.
  growl: {
    contour: [
      [0, 260],
      [0.08, 300],
      [0.3, 190],
      [0.4, 170],
    ],
    envelope: [
      [0.03, 1],
      [0.25, 0.85],
    ],
    formants: [
      [620, 4, 1],
      [1350, 6, 0.6],
      [2600, 8, 0.25],
    ],
    flutter: [38, 0.6],
    vibrato: [9, 6],
    breath: 0.25,
    gain: 0.6,
  },
  // Hurt: sharp yelp that falls fast.
  yelp: {
    contour: [
      [0, 1150],
      [0.04, 1250],
      [0.16, 560],
    ],
    envelope: [
      [0.01, 1],
      [0.08, 0.7],
    ],
    formants: [
      [1250, 5, 1],
      [3000, 7, 0.5],
    ],
    flutter: [0, 0],
    vibrato: [11, 25],
    breath: 0.12,
    gain: 0.5,
  },
  // Fainting: tired falling whine.
  whine: {
    contour: [
      [0, 760],
      [0.15, 820],
      [0.6, 380],
      [0.7, 340],
    ],
    envelope: [
      [0.05, 0.8],
      [0.45, 0.6],
    ],
    formants: [
      [900, 5, 1],
      [2300, 7, 0.4],
    ],
    flutter: [12, 0.25],
    vibrato: [6, 18],
    breath: 0.05,
    gain: 0.45,
  },
};

class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private player: MusicPlayer | null = null;
  private volume = 0.6;
  private musicOn = true;
  private track: TrackId | null = null;
  private ecoHealth = 100;

  /** Browsers only allow audio after a user gesture. */
  unlock(): void {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    try {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
      this.player = new MusicPlayer(this.ctx, this.master);
      this.player.setVolume(this.musicOn ? 0.6 : 0);
      this.player.setEcoHealth(this.ecoHealth);
      if (this.track) this.player.play(this.track);
    } catch {
      this.ctx = null;
    }
  }

  configure(volume: number, music: boolean): void {
    this.volume = volume;
    this.musicOn = music;
    if (this.master) this.master.gain.value = volume;
    this.player?.setVolume(music ? 0.6 : 0);
  }

  private tone(
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType,
    dest: AudioNode,
    gain = 0.25
  ): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(g).connect(dest);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  play(sfx: Sfx): void {
    if (!this.ctx || !this.master) return;
    let t = this.ctx.currentTime;
    for (const [freq, dur, type] of NOTES[sfx]) {
      this.tone(freq, t, dur, type, this.master);
      t += dur;
    }
  }

  /**
   * Little creature voices: a sawtooth "vocal fold" with a pitch contour, shaped by two
   * band-pass formants (the vowel) and an amplitude flutter for the rolled "rrr" of small
   * mammals. `pitch` scales the whole voice (bigger pets sound lower).
   */
  voice(kind: VoiceKind, pitch = 1): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const v = VOICES[kind];
    const t0 = ctx.currentTime + 0.01;
    const jitter = 1 + (Math.random() - 0.5) * 0.08;
    const total = v.contour[v.contour.length - 1][0];

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(v.contour[0][1] * pitch * jitter, t0);
    for (const [t, f] of v.contour.slice(1))
      osc.frequency.linearRampToValueAtTime(f * pitch * jitter, t0 + t);
    // Vibrato.
    const vib = ctx.createOscillator();
    const vibAmt = ctx.createGain();
    vib.frequency.value = v.vibrato[0];
    vibAmt.gain.value = v.vibrato[1] * pitch;
    vib.connect(vibAmt).connect(osc.frequency);

    // Formants (parallel band-passes) -> flutter -> envelope.
    const mix = ctx.createGain();
    for (const [f, q, g] of v.formants) {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = f * (0.85 + 0.15 * pitch);
      bp.Q.value = q;
      const fg = ctx.createGain();
      fg.gain.value = g;
      osc.connect(bp).connect(fg).connect(mix);
    }
    const flutter = ctx.createGain();
    flutter.gain.value = 1 - v.flutter[1];
    const lfo = ctx.createOscillator();
    const lfoAmt = ctx.createGain();
    lfo.frequency.value = v.flutter[0];
    lfoAmt.gain.value = v.flutter[1];
    lfo.connect(lfoAmt).connect(flutter.gain);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    for (const [t, g] of v.envelope) env.gain.linearRampToValueAtTime(g * v.gain, t0 + t);
    env.gain.linearRampToValueAtTime(0.0001, t0 + total);
    mix.connect(flutter).connect(env).connect(this.master);

    // Breath noise for growls and yelps.
    if (v.breath > 0) {
      const n = ctx.createBufferSource();
      n.buffer = this.noise();
      const hp = ctx.createBiquadFilter();
      hp.type = 'bandpass';
      hp.frequency.value = 1800 * pitch;
      hp.Q.value = 0.8;
      const ng = ctx.createGain();
      ng.gain.value = v.breath;
      n.connect(hp).connect(ng).connect(flutter);
      n.start(t0);
      n.stop(t0 + total);
    }
    for (const o of [osc, vib, lfo]) {
      o.start(t0);
      o.stop(t0 + total + 0.05);
    }
  }

  /** Soft paw pad on grass: a short filtered noise tap plus a tiny low thump, never identical. */
  pawStep(weight = 1): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t0 = ctx.currentTime + 0.005;
    const r = () => 0.85 + Math.random() * 0.3;
    const n = ctx.createBufferSource();
    n.buffer = this.noise();
    n.playbackRate.value = r();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1400 * r();
    const bp = ctx.createBiquadFilter();
    bp.type = 'peaking';
    bp.frequency.value = 3200 * r();
    bp.gain.value = 6; // a little grass crunch
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.22 * weight * r(), t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07 * r());
    n.connect(lp).connect(bp).connect(g).connect(this.master);
    n.start(t0, Math.random() * 0.5);
    n.stop(t0 + 0.1);
    this.tone(85 * r() * (1.3 - weight * 0.3), t0, 0.05, 'sine', this.master, 0.18 * weight);
  }

  private noiseBuf: AudioBuffer | null = null;
  private noise(): AudioBuffer {
    const ctx = this.ctx as AudioContext;
    if (this.noiseBuf) return this.noiseBuf;
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
    return buf;
  }

  /** Switches the background track (FM soundtrack in music.ts); null = silence. */
  music(track: TrackId | null): void {
    if (this.track === track) return;
    this.track = track;
    this.player?.play(track);
  }

  /** Updates the dynamic ecological mood of the music (100 = vibrant, 0 = slow/macabre existential void). */
  setEcoHealth(health: number): void {
    this.ecoHealth = health;
    this.player?.setEcoHealth(health);
  }

  /** Multi-language voice dubbing for Visual Novel dialogues (supports all 7 game languages!). */
  speak(text: string, lang = 'pt', pitch = 1.05): void {
    this.stopSpeech();
    const clean = text.replace(/[^\p{L}\p{N}\s.,!?'"-]/gu, '').trim();
    if (!clean) return;
    const BCP47: Record<string, string> = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      ru: 'ru-RU',
      zh: 'zh-CN',
    };
    const locale = BCP47[lang] ?? 'pt-BR';
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utter = new SpeechSynthesisUtterance(clean);
        utter.lang = locale;
        utter.pitch = pitch;
        utter.rate = 1.02;
        utter.volume = Math.min(1, this.volume * 1.15);
        const voices = window.speechSynthesis.getVoices();
        const match = voices.find((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
        if (match) utter.voice = match;
        window.speechSynthesis.speak(utter);
        return;
      } catch {
        // Fallback to gentle synthesized voice chirp below
      }
    }
    this.voice('chirp', pitch);
  }

  /** Stops any active Visual Novel voice dubbing immediately. */
  stopSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }
}

export const audio = new AudioSystem();
