/** Minimal music theory helpers for style engines */

export type PitchClass = number; // 0–11, C=0

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
export const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10]; // natural
export const HARMONIC_MINOR = [0, 2, 3, 5, 7, 8, 11];

export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

export function chance(rng: () => number, p: number): boolean {
  return rng() < p;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function midiToNote(midi: number): string {
  const pc = ((midi % 12) + 12) % 12;
  const oct = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[pc]}${oct}`;
}

export function noteToMidi(note: string): number {
  const m = note.match(/^([A-G]#?)(-?\d+)$/);
  if (!m) return 60;
  const pc = NOTE_NAMES.indexOf(m[1] as (typeof NOTE_NAMES)[number]);
  const oct = parseInt(m[2]!, 10);
  return (oct + 1) * 12 + pc;
}

/** Scale degree 0–6 → MIDI in given octave, with optional accidental shift */
export function degreeToMidi(
  root: PitchClass,
  scale: readonly number[],
  degree: number,
  octave: number,
): number {
  const d = ((degree % 7) + 7) % 7;
  const octShift = Math.floor(degree / 7);
  return (octave + 1 + octShift) * 12 + root + scale[d]!;
}

export function chordTones(
  root: PitchClass,
  scale: readonly number[],
  degree: number, // 0=I, 1=ii, ...
  octave: number,
): number[] {
  return [0, 2, 4].map((off) =>
    degreeToMidi(root, scale, degree + off, octave),
  );
}

export const KEYS: { name: string; root: PitchClass; minor: boolean }[] = [
  { name: "C major", root: 0, minor: false },
  { name: "G major", root: 7, minor: false },
  { name: "D major", root: 2, minor: false },
  { name: "A major", root: 9, minor: false },
  { name: "F major", root: 5, minor: false },
  { name: "B♭ major", root: 10, minor: false },
  { name: "A minor", root: 9, minor: true },
  { name: "E minor", root: 4, minor: true },
  { name: "D minor", root: 2, minor: true },
  { name: "C minor", root: 0, minor: true },
  { name: "G minor", root: 7, minor: true },
  { name: "F♯ minor", root: 6, minor: true },
  { name: "C♯ minor", root: 1, minor: true },
  { name: "B minor", root: 11, minor: true },
  { name: "E♭ major", root: 3, minor: false },
];

/** Common Classical progressions as scale degrees of roots */
export const PROGRESSIONS: number[][] = [
  [0, 3, 4, 0], // I IV V I
  [0, 4, 5, 0], // I V vi I  (degrees: 0,4,5,0) — vi is degree 5
  [0, 5, 3, 4], // I vi IV V
  [0, 4, 0, 4], // I V I V
  [0, 3, 0, 4], // I IV I V
  [5, 3, 4, 0], // vi IV V I
  [0, 2, 3, 4], // I iii IV V-ish
];

export function titleParts(rng: () => number, pools: string[][]): string {
  return pools.map((p) => pick(rng, p)).join(" ");
}
