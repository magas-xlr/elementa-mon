/**
 * All sound is synthesized with WebAudio: zero audio files to download, chiptune flavor.
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
  evolve: [
    [523, 0.08, 'triangle'],
    [659, 0.08, 'triangle'],
    [784, 0.08, 'triangle'],
    [1046, 0.08, 'triangle'],
    [1318, 0.3, 'triangle'],
  ],
};

/** Simple looping tunes (note frequency or 0 = rest), one per mood. */
const TUNES = {
  mundo: [392, 0, 523, 0, 587, 659, 0, 587, 523, 0, 440, 0, 392, 0, 330, 0],
  batalha: [330, 330, 392, 330, 440, 330, 392, 0, 294, 294, 349, 294, 392, 294, 349, 0],
  menu: [523, 0, 659, 0, 784, 0, 659, 0, 587, 0, 698, 0, 880, 0, 698, 0],
} as const;
export type Tune = keyof typeof TUNES;

class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private volume = 0.6;
  private musicOn = true;
  private tune: Tune | null = null;
  private step = 0;
  private timer: number | null = null;

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
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicOn ? 0.12 : 0;
      this.musicGain.connect(this.master);
      if (this.tune) this.startLoop();
    } catch {
      this.ctx = null;
    }
  }

  configure(volume: number, music: boolean): void {
    this.volume = volume;
    this.musicOn = music;
    if (this.master) this.master.gain.value = volume;
    if (this.musicGain) this.musicGain.gain.value = music ? 0.12 : 0;
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

  music(tune: Tune | null): void {
    if (this.tune === tune) return;
    this.tune = tune;
    this.step = 0;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    if (tune && this.ctx) this.startLoop();
  }

  private startLoop(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    const beat = this.tune === 'batalha' ? 140 : 190;
    this.timer = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || !this.tune) return;
      const notes = TUNES[this.tune];
      const f = notes[this.step % notes.length];
      const t = this.ctx.currentTime;
      if (f) this.tone(f, t, beat / 1000, 'square', this.musicGain, 0.5);
      if (this.step % 4 === 0)
        this.tone(notes[0] / 2, t, (beat * 2) / 1000, 'triangle', this.musicGain, 0.7);
      this.step += 1;
    }, beat);
  }
}

export const audio = new AudioSystem();
