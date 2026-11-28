/**
 * Original rock/metal soundtrack, synthesized live with Web Audio. It sounds like a band with
 * stylish action-game energy, but every riff and melody here is original:
 * - rhythm guitar: power chords (root, fifth, octave) of detuned sawtooth waves, double-tracked
 *   left/right into a WaveShaper "amp" and a cabinet filter. They are palm-muted chugs in
 *   battles and ringing chords while exploring;
 * - lead guitar: an overdriven sawtooth with vibrato and a delay;
 * - pick bass, and a kit with kick (with click), snare, hats and crash;
 * - battles and the boss add an industrial square-wave arpeggio.
 * Each track sets its amp drive, so exploring stays calmer and battles hit hard. Everything is
 * note data, so the soundtrack still weighs a few kilobytes instead of megabytes of audio.
 */

export type TrackId =
  | 'menu'
  | 'mundo'
  | 'mundo2'
  | 'mundo3'
  | 'mundo4'
  | 'mundo5'
  | 'mundo6'
  | 'mundo7'
  | 'batalha'
  | 'chefe'
  | 'vitoria';

/** How the rhythm guitar plays the chord roots. */
type Rhythm =
  /** One power chord per bar, left to ring (calm exploring). */
  | 'ring'
  /** Power chords on the `stabs` steps, held until the next one. */
  | 'stab'
  /** Palm-muted chugs on the bass rhythm plus open chords on the `stabs` steps (battles). */
  | 'chug';

interface Track {
  bpm: number;
  loop: boolean;
  /** One string per bar, 16 sixteenth-note steps: note names, `.` rest, `-` hold. */
  lead: string[];
  /** Chord root per bar (e.g. 'F', 'C#'): drives bass, guitar and arpeggio. */
  roots: string[];
  /** `L` low root, `H` root an octave up, `5` fifth, `.` rest, `-` hold. */
  bassRhythm: string;
  /** Chord quality per bar ('M'/'m'): colors the industrial arpeggio. */
  chords: string;
  /** `x` = guitar chord hit on that step. */
  stabs: string;
  /**
   * Drum steps per bar: k kick, s snare, h hat, o open hat, x kick+hat, c crash+kick.
   * Last entry = fill (played on the last bar).
   */
  drums: string[];
  /** Semitones added to every note (biome variations of the world theme). */
  transpose?: number;
  /** Amp distortion 0 (clean) … 1 (high gain). */
  drive: number;
  rhythm: Rhythm;
  /** Square-wave 16th arpeggio (battle/boss). */
  industrial?: boolean;
}

const BASE_TRACKS: Record<Exclude<TrackId, `mundo${2 | 3 | 4 | 5 | 6 | 7}`>, Track> = {
  // Public Domain OST — Beethoven: Ode to Joy (Symphony No. 9, 1824)
  menu: {
    bpm: 120,
    loop: true,
    drive: 0.45,
    rhythm: 'stab',
    roots: ['C', 'G', 'C', 'G'],
    chords: 'MMMM',
    bassRhythm: 'L - . H . L H . L - . H . L H .',
    stabs: 'x . . . x . . . x . . . x . . .',
    lead: [
      'E5 - . . E5 - . . F5 - . . G5 - . .',
      'G5 - . . F5 - . . E5 - . . D5 - . .',
      'C5 - . . C5 - . . D5 - . . E5 - . .',
      'E5 - - . D5 - . . D5 - - - . . . .',
    ],
    drums: ['c.h.s.h.k.k.s.h.', 'k.h.s.hkk.h.s.ss'],
  },
  // Public Domain OST — Vivaldi: Spring (La Primavera, The Four Seasons, 1725)
  mundo: {
    bpm: 128,
    loop: true,
    drive: 0.25,
    rhythm: 'ring',
    roots: ['C', 'C', 'G', 'C', 'C', 'F', 'G', 'C'],
    chords: 'MMMMMMMM',
    bassRhythm: 'L - . H L . H . L - . H . L H .',
    stabs: '. . . x . . x . . . . x . . x .',
    lead: [
      'C5 - E5 - E5 - E5 - D5 C5 G5 - - - G5 F5',
      'E5 - E5 - E5 - D5 C5 G5 - - - G5 F5 E5 -',
      'F5 G5 F5 - E5 - D5 - D5 - C5 - G4 - - -',
      'C5 - E5 - E5 - E5 - D5 C5 G5 - - - G5 F5',
      'E5 - E5 - E5 - D5 C5 G5 - - - G5 F5 E5 -',
      'F5 G5 F5 - E5 - D5 - C5 - - - . . . .',
      'G5 - F5 E5 F5 - G5 - A5 - G5 - F5 - E5 -',
      'D5 - E5 - D5 - C5 - C5 - - - . . . .',
    ],
    drums: ['k.h.s.hk.kh.s.hh', 'k.s.s.ssk.s.ssss'],
  },
  // Public Domain OST — Rossini: William Tell Overture Finale (1829)
  batalha: {
    bpm: 156,
    loop: true,
    drive: 0.9,
    rhythm: 'chug',
    industrial: true,
    roots: ['C', 'C', 'G', 'C', 'A', 'F', 'G', 'C'],
    chords: 'MMMmMMmM',
    bassRhythm: 'L . L H L . L H L . L H L H L H',
    stabs: 'x . . x . . x . . . x . . x . .',
    lead: [
      'G4 G4 G4 - G4 G4 G4 - G4 G4 C5 - D5 - E5 -',
      'G4 G4 G4 - G4 G4 C5 - E5 - D5 - B4 - G4 -',
      'G4 G4 G4 - G4 G4 G4 - G4 G4 C5 - D5 - E5 -',
      'C5 - E5 - G5 - - - F5 - D5 - C5 - - -',
      'E5 - . E5 - . E5 - E5 - D5 - C5 - A4 -',
      'F5 - . F5 - . F5 - F5 - E5 - D5 - C5 -',
      'D5 - D5 - D5 - G5 - F5 - E5 - D5 - B4 -',
      'C5 - E5 - G5 - C6 - - - . . . . . .',
    ],
    drums: ['c.hks.hkx.hks.hk', 'k.s.s.ssk.sss.ss'],
  },
  // Public Domain OST — Beethoven: Symphony No. 5 & Mozart: Dies Irae (Requiem, 1791)
  chefe: {
    bpm: 168,
    loop: true,
    drive: 1,
    rhythm: 'chug',
    industrial: true,
    roots: ['D', 'A#', 'C', 'A', 'D', 'A#', 'C', 'A'],
    chords: 'mMMMmMMM',
    bassRhythm: 'L L H L L L H L L L H L L H L H',
    stabs: 'x . . x . . x . x . . x . . x .',
    lead: [
      'A5 A5 A5 - F5 - - - G5 G5 G5 - E5 - - -',
      'F5 - E5 - F5 - D5 - E5 - C5 - D5 - - -',
      'F5 - E5 - D5 - C5 - D5 - E5 - F5 - G5 -',
      'A5 - - - G5 - F5 - E5 - - - C#5 - - -',
      'D5 - F5 - A5 - D6 - C6 - A5 - F5 - A5 -',
      'A#5 - - - A5 - F5 - D5 - F5 - A#5 - A5 -',
      'G5 - E5 - C5 - E5 - G5 - - - C6 - A#5 -',
      'D6 - - - A5 - - - D5 - - - . . . .',
    ],
    drums: ['ckskkhskkhskkksk', 'ksksksksssssssss'],
  },
  // Public Domain OST — Handel: Water Music Hornpipe Fanfare (1717)
  vitoria: {
    bpm: 148,
    loop: false,
    drive: 0.7,
    rhythm: 'stab',
    roots: ['C', 'G', 'C'],
    chords: 'MMM',
    bassRhythm: 'L . H . L . H . L . H . L . H .',
    stabs: 'x . . . x . . . x . . . . . . .',
    lead: [
      'C5 - E5 - G5 - C6 - B5 A5 G5 F5 E5 - G5 -',
      'D5 - G5 - B5 - D6 - G5 - B5 - D6 - - -',
      'C6 - - - - - - - - - - - . . . .',
    ],
    drums: ['c.h.s.h.k.h.s.h.', 'k.s.s.ssc.......'],
  },
};

const variant = (o: Partial<Track>): Track => ({ ...BASE_TRACKS.mundo, ...o });

const TRACKS: Record<TrackId, Track> = {
  ...BASE_TRACKS,
  // Biome 2 (Ruínas Solares) — Greensleeves (16th-century English folk, Public Domain)
  mundo2: variant({
    bpm: 118,
    drive: 0.5,
    rhythm: 'stab',
    roots: ['A', 'G', 'F', 'E', 'A', 'G', 'F', 'E'],
    chords: 'mMMMmMMM',
    lead: [
      'A4 - C5 - - - D5 - E5 - F5 E5 D5 - - -',
      'B4 - G4 - - - A4 - B4 - C5 - A4 - - -',
      'A4 - G#4 A4 B4 - - - G#4 - E4 - - - . .',
      'A4 - C5 - - - D5 - E5 - F5 E5 D5 - - -',
      'G5 - - - F5 - E5 - D5 - B4 - G4 - - -',
      'A4 - B4 - C5 - B4 A4 G#4 - F#4 G#4 A4 - - -',
      'G5 - - - F5 - E5 - D5 - B4 - G4 - - -',
      'A4 - B4 - C5 - A4 - A4 - - - . . . .',
    ],
    drums: ['k.hkskh.k.hkskhs', 'kksskkssk.ssssss'],
  }),
  // Biome 3 (Parque das Molas) — Mozart: Alla Turca / Turkish March (1783)
  mundo3: variant({
    bpm: 144,
    drive: 0.35,
    rhythm: 'stab',
    roots: ['A', 'E', 'A', 'E', 'C', 'G', 'A', 'E'],
    chords: 'mMmMMMmM',
    bassRhythm: 'L . H . L . H . L . H . L . H .',
    lead: [
      'B4 A4 G#4 A4 C5 - . . D5 C5 B4 C5 E5 - . .',
      'F5 E5 D#5 E5 B5 A5 G#5 A5 B5 A5 G#5 A5 C6 - . .',
      'A5 - C6 - B5 - A5 - G5 - A5 - B5 - A5 -',
      'G5 - A5 - B5 - A5 - G5 - F#5 - E5 - - -',
      'E5 - F5 - G5 - G5 - A5 G5 F5 E5 D5 - . .',
      'D5 - E5 - F5 - F5 - G5 F5 E5 D5 C5 - . .',
      'C5 - D5 - E5 - E5 - F5 E5 D5 C5 B4 - . .',
      'B4 A4 G#4 A4 C5 - B4 - A4 - - - . . . .',
    ],
    drums: ['k.hsk.hsk.hsk.hs', 'kshskshsksssssss'],
  }),
  // Biome 4 (Labirinto) — J.S. Bach: Minuet in G (1725)
  mundo4: variant({
    bpm: 114,
    drive: 0.15,
    roots: ['G', 'G', 'C', 'D', 'G', 'C', 'D', 'G'],
    chords: 'MMMMMMMM',
    stabs: '. . . . . . x . . . . . . . x .',
    lead: [
      'D5 - . . G4 A4 B4 C5 D5 - . . G4 - G4 -',
      'E5 - . . C5 D5 E5 F#5 G5 - . . G4 - G4 -',
      'C5 - . . D5 C5 B4 A4 B4 - . . C5 B4 A4 G4',
      'F#4 - . . G4 A4 B4 G4 A4 - - - . . . .',
      'D5 - . . G4 A4 B4 C5 D5 - . . G4 - G4 -',
      'E5 - . . C5 D5 E5 F#5 G5 - . . G4 - G4 -',
      'C5 - . . D5 C5 B4 A4 B4 - . . C5 B4 A4 G4',
      'A4 - B4 A4 G4 - F#4 - G4 - - - . . . .',
    ],
    drums: ['k...h...s...h...', 'k...h...s.h.s.hh'],
  }),
  // Biome 5 (Cidade Noturna) — Erik Satie: Gymnopédie No. 1 (1888)
  mundo5: variant({
    bpm: 108,
    drive: 0.3,
    roots: ['G', 'D', 'G', 'D', 'G', 'D', 'G', 'D'],
    chords: 'MMMMMMMM',
    lead: [
      '. . . . F#5 - - - A5 - - - G5 - - -',
      'F#5 - - - C#5 - - - B4 - - - C#5 - - -',
      'D5 - - - A4 - - - . . . . . . . .',
      'F#4 - - - - - - - . . . . . . . .',
      '. . . . F#5 - - - A5 - - - G5 - - -',
      'F#5 - - - C#5 - - - B4 - - - C#5 - - -',
      'D5 - - - A4 - - - E5 - - - D5 - - -',
      'A4 - - - - - - - . . . . . . . .',
    ],
    drums: ['k.h.s.hhk.h.s.ho', 'k.h.s.hhk.s.s.ss'],
  }),
  // Biome 6 (Sucata) — Edvard Grieg: In the Hall of the Mountain King (1875)
  mundo6: variant({
    bpm: 142,
    drive: 0.75,
    rhythm: 'chug',
    industrial: true,
    roots: ['B', 'B', 'F#', 'B', 'B', 'B', 'F#', 'B'],
    chords: 'mmMmmmMm',
    bassRhythm: 'L L H L L L H L L L H L L H L H',
    lead: [
      'B4 - C#5 - D5 - E5 - F#5 - D5 - F#5 - - -',
      'F5 - C#5 - F5 - - - E5 - C5 - E5 - - -',
      'B4 - C#5 - D5 - E5 - F#5 - D5 - F#5 - B5 -',
      'A5 - F#5 - D5 - F#5 - A5 - - - . . . .',
      'B4 - C#5 - D5 - E5 - F#5 - D5 - F#5 - - -',
      'F5 - C#5 - F5 - - - E5 - C5 - E5 - - -',
      'B4 - C#5 - D5 - E5 - F#5 - D5 - F#5 - B5 -',
      'A5 - F#5 - D5 - B4 - B4 - - - . . . .',
    ],
    drums: ['xhshxhskxhshxhsk', 'ksksksksssssssss'],
  }),
  // Biome 7 (Fortaleza Celeste) — Heroic Ode to Joy Finale (Beethoven)
  mundo7: variant({
    transpose: 2,
    bpm: 158,
    drive: 0.85,
    rhythm: 'chug',
    roots: ['C', 'G', 'C', 'G', 'C', 'G', 'C', 'C'],
    chords: 'MMMMMMMM',
    stabs: 'x . . x . . x . x . . x . . x .',
    lead: [
      'E5 - E5 - F5 - G5 - G5 - F5 - E5 - D5 -',
      'C5 - C5 - D5 - E5 - E5 - - D5 D5 - - -',
      'E5 - E5 - F5 - G5 - G5 - F5 - E5 - D5 -',
      'C5 - C5 - D5 - E5 - D5 - - C5 C5 - - -',
      'D5 - D5 - E5 - C5 - D5 E5 F5 E5 C5 - - -',
      'D5 E5 F5 E5 D5 - C5 - D5 - G4 - - - . .',
      'E5 - E5 - F5 - G5 - G5 - F5 - E5 - D5 -',
      'C5 - C5 - D5 - E5 - D5 - - C5 C5 - - -',
    ],
    drums: ['c.hsx.hsx.hsxshs', 'ksksksksssssssss'],
  }),
};

const NOTE_INDEX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** 'C#4' → frequency in Hz (A4 = 440). Also accepts flats ('Bb3'). */
export function noteFreq(name: string): number {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`Nota inválida: ${name}`);
  const semis = NOTE_INDEX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  const midi = (Number(m[3]) + 1) * 12 + semis;
  return 440 * 2 ** ((midi - 69) / 12);
}

export interface NoteEvent {
  step: number;
  note: string;
  length: number;
}

/** Turns "C5 - - . E5 -" into note events with lengths in steps (16th notes). */
export function parseBar(bar: string, offset = 0): NoteEvent[] {
  const tokens = bar.trim().split(/\s+/).slice(0, 16);
  while (tokens.length < 16) tokens.push('.');
  const events: NoteEvent[] = [];
  tokens.forEach((tok, i) => {
    if (tok === '-') {
      const last = events[events.length - 1];
      if (last && last.step + last.length === offset + i) last.length += 1;
    } else if (tok !== '.') {
      events.push({ step: offset + i, note: tok, length: 1 });
    }
  });
  return events;
}

const transpose = (root: string, octave: number, semis = 0) =>
  noteFreq(`${root}${octave}`) * 2 ** (semis / 12);

/** Bass line from chord roots and a rhythm template. */
export function bassEvents(track: Track): { step: number; freq: number; length: number }[] {
  const tokens = track.bassRhythm.trim().split(/\s+/);
  const out: { step: number; freq: number; length: number }[] = [];
  track.roots.forEach((root, bar) => {
    tokens.forEach((tok, i) => {
      const step = bar * 16 + i;
      if (tok === '-') {
        const last = out[out.length - 1];
        if (last && last.step + last.length === step) last.length += 1;
        return;
      }
      if (tok === '.') return;
      const semis = tok === 'H' ? 12 : tok === '5' ? 7 : 0;
      out.push({ step, freq: transpose(root, 2, semis + (track.transpose ?? 0)), length: 1 });
    });
  });
  return out;
}

export function trackLength(id: TrackId): number {
  return TRACKS[id].roots.length * 16;
}

export function trackInfo(id: TrackId) {
  const t = TRACKS[id];
  return { bpm: t.bpm, bars: t.roots.length, loop: t.loop, drive: t.drive, rhythm: t.rhythm };
}

interface GuitarHit {
  step: number;
  /** Power chord root (Hz) in the low guitar register. */
  root: number;
  length: number;
  muted: boolean;
}

interface Scheduled {
  lead: NoteEvent[];
  /** Frequency factor of the lead (track transposition). */
  leadScale: number;
  bass: { step: number; freq: number; length: number }[];
  guitar: GuitarHit[];
  /** Industrial arpeggio: one note per 16th step. */
  arp: { step: number; freq: number }[];
  drums: { step: number; hits: string }[];
}

/** Guitar root between E2 and D#3, the classic power-chord register. */
function guitarRoot(root: string, semis: number): number {
  let f = transpose(root, 2, semis);
  while (f < 82) f *= 2;
  while (f > 160) f /= 2;
  return f;
}

function guitarPart(track: Track): GuitarHit[] {
  const semis = track.transpose ?? 0;
  const stabSteps = track.stabs
    .trim()
    .split(/\s+/)
    .map((t, i) => (t === 'x' ? i : -1))
    .filter((i) => i >= 0);
  const bassTokens = track.bassRhythm.trim().split(/\s+/);
  const out: GuitarHit[] = [];
  track.roots.forEach((r, bar) => {
    const root = guitarRoot(r, semis);
    const at = bar * 16;
    if (track.rhythm === 'ring') {
      out.push({ step: at, root, length: 14, muted: false });
      return;
    }
    if (track.rhythm === 'stab') {
      stabSteps.forEach((s, k) => {
        const end = stabSteps[k + 1] ?? 16;
        out.push({ step: at + s, root, length: Math.max(1, end - s), muted: false });
      });
      return;
    }
    // Chug: open chords on the accents, palm-muted 16ths on the bass rhythm elsewhere.
    bassTokens.forEach((tok, i) => {
      if (stabSteps.includes(i)) out.push({ step: at + i, root, length: 2, muted: false });
      else if (tok === 'L' || tok === 'H' || tok === '5')
        out.push({ step: at + i, root, length: 1, muted: true });
    });
  });
  return out;
}

function arpPart(track: Track): { step: number; freq: number }[] {
  if (!track.industrial) return [];
  const semis = track.transpose ?? 0;
  return track.roots.flatMap((r, bar) => {
    const third = track.chords[bar] === 'm' ? 3 : 4;
    const pattern = [0, 7, 12, third + 12, 7, 12, 19, 12];
    return Array.from({ length: 16 }, (_, i) => ({
      step: bar * 16 + i,
      freq: transpose(r, 4, semis + pattern[i % pattern.length]),
    }));
  });
}

function compile(track: Track): Scheduled {
  const lead = track.lead.flatMap((bar, i) => parseBar(bar, i * 16));
  const bars = track.roots.length;
  const drums = Array.from({ length: bars }, (_, bar) => {
    const pattern = bar === bars - 1 ? track.drums[1] : track.drums[0];
    return [...pattern].map((hits, i) => ({ step: bar * 16 + i, hits }));
  })
    .flat()
    .filter((d) => d.hits !== '.');
  return {
    lead,
    leadScale: 2 ** ((track.transpose ?? 0) / 12),
    bass: bassEvents(track),
    guitar: guitarPart(track),
    arp: arpPart(track),
    drums,
  };
}

/** Soft-clipping curve for the amp: `drive` 0 is almost clean, 1 is high-gain metal. */
export function ampCurve(drive: number, samples = 1024): Float32Array {
  const k = 1 + drive * 80;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * 2 - 1;
    curve[i] = Math.tanh(k * x) / Math.tanh(k);
  }
  return curve;
}

/** One amp: drive → cabinet filters → level. Voices connect to `input`. */
interface Amp {
  input: GainNode;
  shaper: WaveShaperNode;
  output: GainNode;
}

export interface EcoMusicProfile {
  /** Multiplier on playback speed (1.0 normal → 0.46 slow/existential). */
  tempoScale: number;
  /** Semitone shift applied to melody, bass & chords (0 → -5 dark minor/dissonant). */
  pitchSemis: number;
  /** Detune in cents for eerie, hollow pitch drift (0 → -36). */
  detuneCents: number;
  /** Master lowpass filter cutoff Hz (12000 bright → 780 suffocating/hollow). */
  filterCutoff: number;
  /** Echo wet/feedback intensity for vast existential emptiness (0.28 → 0.65). */
  echoWet: number;
  /** Hollow minor-second / tritone sub-drone gain (0 → 0.24). */
  voidDrone: number;
  /** Drop drums when environment collapses so only lonely echoing notes remain. */
  dropDrums: boolean;
  moodLabel: string;
}

/**
 * Computes how the soundtrack shifts as environmental health (0..100) deteriorates:
 * healthy biomes stay vibrant; damaged biomes turn progressively slower, darker,
 * sadder, macabre, and filled with existential emptiness!
 */
export function ecoMusicProfile(ecoHealth: number): EcoMusicProfile {
  const h = Math.max(0, Math.min(100, ecoHealth));
  if (h >= 75) {
    return {
      tempoScale: 1,
      pitchSemis: 0,
      detuneCents: 0,
      filterCutoff: 12000,
      echoWet: 0.28,
      voidDrone: 0,
      dropDrums: false,
      moodLabel: 'Vibrante',
    };
  }
  const decay = (75 - h) / 75; // 0 -> 1 as health falls from 75% to 0%
  return {
    tempoScale: Number((1 - decay * 0.54).toFixed(3)),
    pitchSemis: -Math.round(decay * 5),
    detuneCents: -Math.round(decay * 36),
    filterCutoff: Math.round(12000 * Math.pow(780 / 12000, decay)),
    echoWet: Number((0.28 + decay * 0.37).toFixed(3)),
    voidDrone: decay > 0.35 ? Number(((decay - 0.35) * 0.36).toFixed(3)) : 0,
    dropDrums: h < 30,
    moodLabel: h < 18 ? 'Vazio Existencial' : h < 40 ? 'Macabro & Triste' : 'Melancólico',
  };
}

export class MusicPlayer {
  private ctx: BaseAudioContext;
  private out: GainNode;
  private ecoFilter: BiquadFilterNode;
  private echoWet: GainNode;
  private echoFeedback: GainNode;
  private noise: AudioBuffer;
  private track: TrackId | null = null;
  private data: Scheduled | null = null;
  private baseStepTime = 0;
  private stepTime = 0;
  private step = 0;
  private nextTime = 0;
  private timer: number | null = null;
  private echo: DelayNode;
  private rhythmL: Amp;
  private rhythmR: Amp;
  private leadAmp: Amp;
  private drive = 0.5;
  private ecoProfile: EcoMusicProfile = ecoMusicProfile(100);

  constructor(ctx: BaseAudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.out = ctx.createGain();
    this.ecoFilter = ctx.createBiquadFilter();
    this.ecoFilter.type = 'lowpass';
    // Warm, calm Lo-Fi Rhodes / chill acoustic mix (softer lowpass & gentle tape delay, never harsh!)
    this.ecoFilter.frequency.value = 2600;
    this.out.connect(this.ecoFilter).connect(destination);
    // Delay on the lead melody, timed to the song (dotted 8th).
    this.echo = ctx.createDelay(1.5);
    this.echoFeedback = ctx.createGain();
    this.echoFeedback.gain.value = 0.28;
    this.echoWet = ctx.createGain();
    this.echoWet.gain.value = 0.24;
    this.echo.connect(this.echoFeedback).connect(this.echo);
    this.echo.connect(this.echoWet).connect(this.out);
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    // Soft stereo lo-fi electric piano / warm acoustic tone
    this.rhythmL = this.amp(-0.55, 1600);
    this.rhythmR = this.amp(0.55, 1500);
    this.leadAmp = this.amp(0.1, 2200);
    this.leadAmp.output.connect(this.echo);
    this.setDrive(0.15);
  }

  /** Dynamically shifts soundtrack tempo, pitch, filter darkness & void drone with biome eco health! */
  setEcoHealth(health: number): void {
    const p = ecoMusicProfile(health);
    this.ecoProfile = p;
    this.ecoFilter.frequency.value = p.filterCutoff;
    this.echoWet.gain.value = p.echoWet;
    this.echoFeedback.gain.value = Math.min(0.72, 0.3 + (p.echoWet - 0.28) * 1.05);
    if (this.baseStepTime > 0) {
      this.stepTime = this.baseStepTime / p.tempoScale;
      this.echo.delayTime.value = Math.min(1.4, this.stepTime * 3);
    }
  }

  private amp(pan: number, cabinet: number): Amp {
    const ctx = this.ctx;
    const input = ctx.createGain();
    const shaper = ctx.createWaveShaper();
    shaper.oversample = '4x';
    const low = ctx.createBiquadFilter();
    low.type = 'highpass';
    low.frequency.value = 90;
    const mid = ctx.createBiquadFilter();
    // The scooped-mid metal tone.
    mid.type = 'peaking';
    mid.frequency.value = 700;
    mid.Q.value = 0.8;
    mid.gain.value = -5;
    const cab = ctx.createBiquadFilter();
    cab.type = 'lowpass';
    cab.frequency.value = cabinet;
    cab.Q.value = 0.9;
    const output = ctx.createGain();
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    input.connect(shaper).connect(low).connect(mid).connect(cab).connect(output);
    output.connect(panner).connect(this.out);
    return { input, shaper, output };
  }

  private setDrive(drive: number): void {
    this.drive = drive;
    for (const a of [this.rhythmL, this.rhythmR]) {
      a.shaper.curve = ampCurve(drive) as Float32Array<ArrayBuffer>;
      // More gain sounds louder: compensate so every track sits at a similar level.
      a.input.gain.value = 0.5 + drive * 1.5;
      a.output.gain.value = 0.13 - drive * 0.05;
    }
    this.leadAmp.shaper.curve = ampCurve(0.15 + drive * 0.5) as Float32Array<ArrayBuffer>;
    this.leadAmp.input.gain.value = 0.8;
    this.leadAmp.output.gain.value = 0.11;
  }

  setVolume(v: number): void {
    this.out.gain.value = v;
  }

  play(id: TrackId | null): void {
    if (id === this.track) return;
    this.stop();
    this.track = id;
    if (!id) return;
    this.load(id);
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.06;
    // Look-ahead scheduler: wakes every 25 ms and queues notes for the next 120 ms with the
    // audio clock, so timing stays tight even when the main thread is busy.
    this.timer = window.setInterval(() => this.schedule(), 25);
    this.schedule();
  }

  private load(id: TrackId): void {
    const track = TRACKS[id];
    this.data = compile(track);
    // Relaxed Lo-Fi tempo (~24% calmer than original rock tempo) so it feels soothing and never tiring!
    this.baseStepTime = (60 / track.bpm / 4) * 1.24;
    this.stepTime = this.baseStepTime / this.ecoProfile.tempoScale;
    this.echo.delayTime.value = Math.min(1.4, this.stepTime * 3);
    this.setDrive(Math.min(0.22, track.drive * 0.25));
  }

  /** Queues `seconds` of a track at once (for OfflineAudioContext previews and checks). */
  queueAll(id: TrackId, seconds: number): void {
    this.load(id);
    const total = trackLength(id);
    for (let i = 0; i * this.stepTime < seconds; i++) this.playStep(i % total, i * this.stepTime);
  }

  stop(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.track = null;
    this.data = null;
  }

  private schedule(): void {
    if (!this.track || !this.data) return;
    const total = trackLength(this.track);
    while (this.nextTime < this.ctx.currentTime + 0.12) {
      if (this.step >= total) {
        if (!TRACKS[this.track].loop) return this.stop();
        this.step = 0;
      }
      this.playStep(this.step, this.nextTime);
      this.step += 1;
      this.nextTime += this.stepTime;
    }
  }

  private playStep(step: number, t: number): void {
    const d = this.data as Scheduled;
    const st = this.stepTime;
    const p = this.ecoProfile;
    const pitchMul = 2 ** ((p.pitchSemis * 100 + p.detuneCents) / 1200);
    for (const n of d.lead) {
      if (n.step !== step) continue;
      // In severe decay, flatten some intervals by an extra half-step for a sad, macabre minor feel
      const macabreDrop = p.voidDrone > 0 && step % 4 === 2 ? 2 ** (-1 / 12) : 1;
      this.lead(noteFreq(n.note) * d.leadScale * pitchMul * macabreDrop, t, n.length * st);
    }
    for (const n of d.bass)
      if (n.step === step) this.bass(n.freq * pitchMul, t, n.length * st * 0.9);
    for (const g of d.guitar)
      if (g.step === step) this.powerChord(g.root * pitchMul, t, g.length * st, g.muted);
    if (!p.dropDrums) {
      for (const a of d.arp) if (a.step === step) this.arp(a.freq * pitchMul, t, st, step);
      for (const dr of d.drums) {
        if (dr.step !== step) continue;
        if (dr.hits === 'k' || dr.hits === 'x' || dr.hits === 'c') this.kick(t);
        if (dr.hits === 's') this.snare(t);
        if (dr.hits === 'h' || dr.hits === 'x') this.hat(t, 0.03);
        if (dr.hits === 'o') this.hat(t, 0.12);
        if (dr.hits === 'c') this.crash(t);
      }
    }
    // Existential void drone on bar downbeats when ecosystem is severely damaged
    if (p.voidDrone > 0 && step % 16 === 0) {
      const rootFreq = (d.bass[0]?.freq ?? 65) * pitchMul;
      this.voidDrone(rootFreq, t, st * 14, p.voidDrone);
    }
  }

  /** Hollow dissonant sub-drone (root + haunting tritone/minor-2nd) for ecological collapse. */
  private voidDrone(freq: number, t: number, dur: number, level: number): void {
    const ctx = this.ctx;
    for (const ratio of [1, 1.0595, 1.4142]) {
      const o = ctx.createOscillator();
      o.type = ratio === 1 ? 'sine' : 'triangle';
      o.frequency.value = freq * ratio;
      const g = ctx.createGain();
      const amp = ratio === 1 ? level : level * 0.35;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(amp, t + Math.min(0.6, dur * 0.35));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.out);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  }

  /** Envelope helper: quick attack, hold, release. */
  private env(g: GainNode, t: number, level: number, dur: number, release: number): number {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + 0.005);
    g.gain.setTargetAtTime(level * 0.8, t + 0.01, 0.15);
    g.gain.setTargetAtTime(0, t + dur, release / 3);
    return t + dur + release * 2;
  }

  /** Warm Lo-Fi electric piano / chill chord pad (soft triangle + sine instead of harsh sawtooth!). */
  private powerChord(root: number, t: number, dur: number, muted: boolean): void {
    const ctx = this.ctx;
    const notes = muted ? [1, 1.5] : [1, 1.25, 1.5, 2];
    const length = muted ? Math.min(dur, 0.14) : dur * 1.1;
    const release = muted ? 0.08 : 0.28;
    [this.rhythmL, this.rhythmR].forEach((amp, side) => {
      const g = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = muted ? 850 : 1650;
      const end = this.env(g, t, muted ? 0.26 : 0.22, length, release);
      for (const ratio of notes) {
        const o = ctx.createOscillator();
        o.type = ratio === 1 ? 'sine' : 'triangle';
        o.frequency.value = root * ratio;
        o.detune.value = side ? 5 : -5;
        o.connect(filter);
        o.start(t);
        o.stop(end);
      }
      filter.connect(g).connect(amp.input);
    });
  }

  /** Soft Lo-Fi Rhodes / kalimba melody (warm triangle with gentle vibrato, never fatiguing!). */
  private lead(freq: number, t: number, dur: number): void {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, t);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 3.8;
    const depth = ctx.createGain();
    depth.gain.setValueAtTime(0, t);
    depth.gain.linearRampToValueAtTime(freq * 0.005, t + Math.min(0.35, dur));
    lfo.connect(depth).connect(o.frequency);
    const g = ctx.createGain();
    const end = this.env(g, t, 0.32, dur, 0.22);
    o.connect(g).connect(this.leadAmp.input);
    o.start(t);
    lfo.start(t);
    o.stop(end);
    lfo.stop(end);
  }

  /** Pick bass: saw + sine sub through a low-pass, with a little grit at high drive. */
  private bass(freq: number, t: number, dur: number): void {
    const ctx = this.ctx;
    const saw = ctx.createOscillator();
    saw.type = 'sawtooth';
    saw.frequency.value = freq;
    const sub = ctx.createOscillator();
    sub.frequency.value = freq;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 2;
    filter.frequency.setValueAtTime(900 + this.drive * 600, t);
    filter.frequency.exponentialRampToValueAtTime(380, t + 0.12);
    const g = ctx.createGain();
    const end = this.env(g, t, 0.3, dur, 0.05);
    saw.connect(filter);
    sub.connect(filter);
    filter.connect(g).connect(this.out);
    for (const o of [saw, sub]) {
      o.start(t);
      o.stop(end);
    }
  }

  /** Industrial arpeggio: gated square pulses with a moving band-pass, alternating sides. */
  private arp(freq: number, t: number, st: number, step: number): void {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = freq;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3;
    filter.frequency.value = 1200 + Math.sin(step / 6) * 700;
    const g = ctx.createGain();
    const end = this.env(g, t, 0.05, st * 0.45, 0.02);
    const panner = ctx.createStereoPanner();
    panner.pan.value = step % 2 ? 0.45 : -0.45;
    o.connect(filter).connect(g).connect(panner).connect(this.out);
    o.start(t);
    o.stop(end);
  }

  private kick(t: number): void {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.09);
    g.gain.setValueAtTime(0.85, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(g).connect(this.out);
    osc.start(t);
    osc.stop(t + 0.24);
    // Beater click so the kick cuts through the guitars.
    this.noiseHit(t, 0.015, 'highpass', 3500, 0.25);
  }

  private noiseHit(
    t: number,
    dur: number,
    type: BiquadFilterType,
    freq: number,
    level: number,
    pan = 0
  ): void {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    const panner = this.ctx.createStereoPanner();
    panner.pan.value = pan;
    src.connect(filter).connect(g).connect(panner).connect(this.out);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  private snare(t: number): void {
    this.noiseHit(t, 0.2, 'bandpass', 2200, 0.55);
    this.noiseHit(t, 0.08, 'highpass', 6000, 0.2);
    const body = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    body.type = 'triangle';
    body.frequency.setValueAtTime(240, t);
    body.frequency.exponentialRampToValueAtTime(160, t + 0.05);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    body.connect(g).connect(this.out);
    body.start(t);
    body.stop(t + 0.12);
  }

  private hat(t: number, dur: number): void {
    this.noiseHit(t, dur, 'highpass', 8000, 0.16, 0.3);
  }

  private crash(t: number): void {
    this.noiseHit(t, 1.1, 'highpass', 5200, 0.2, -0.3);
  }
}

/** Checks every track for typos: bar lengths, note names and per-bar data. Used by the tests. */
export function trackProblems(): string[] {
  const problems: string[] = [];
  for (const [id, t] of Object.entries(TRACKS)) {
    const bars = t.roots.length;
    if (t.lead.length !== bars)
      problems.push(`${id}: ${t.lead.length} compassos de melodia para ${bars} acordes`);
    if (t.chords.length !== bars)
      problems.push(`${id}: qualidade de acorde para ${t.chords.length} compassos`);
    if (t.drive < 0 || t.drive > 1) problems.push(`${id}: drive fora de 0–1`);
    for (const [name, row] of [
      ['baixo', t.bassRhythm],
      ['stabs', t.stabs],
    ] as const) {
      const n = row.trim().split(/\s+/).length;
      if (n !== 16) problems.push(`${id}: ${name} com ${n} passos`);
    }
    t.drums.forEach((d, i) => {
      if (d.length !== 16) problems.push(`${id}: bateria ${i} com ${d.length} passos`);
      if (/[^kshoxc.]/.test(d)) problems.push(`${id}: bateria ${i} com batida inválida`);
    });
    t.roots.forEach((r) => {
      try {
        noteFreq(`${r}2`);
      } catch {
        problems.push(`${id}: acorde inválido ${r}`);
      }
    });
    t.lead.forEach((bar, i) => {
      const tokens = bar.trim().split(/\s+/);
      if (tokens.length !== 16)
        problems.push(`${id}: compasso ${i + 1} com ${tokens.length} passos`);
      for (const tok of tokens) {
        if (tok === '.' || tok === '-') continue;
        try {
          noteFreq(tok);
        } catch {
          problems.push(`${id}: nota inválida ${tok}`);
        }
      }
    });
  }
  return problems;
}
