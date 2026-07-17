import * as Tone from "tone";

/**
 * Real instrument samples (nbrosowsky / tonejs-instruments via jsDelivr).
 * Chopin/Mozart/Beethoven → grand piano
 * Bach → organ (Baroque keyboard character)
 * Vivaldi → violin solo + cello + contrabass (string orchestra)
 */

const BASE =
  "https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments@master/samples";

export type InstrumentName =
  | "piano"
  | "violin"
  | "cello"
  | "contrabass"
  | "organ";

type LoadState = "idle" | "loading" | "ready" | "error";

const samplers: Partial<Record<InstrumentName, Tone.Sampler>> = {};
const loadState: Partial<Record<InstrumentName, LoadState>> = {};
const loadPromises: Partial<Record<InstrumentName, Promise<Tone.Sampler>>> = {};

/** Sparse note grids — Tone pitch-shifts between them */
const NOTE_MAPS: Record<InstrumentName, string[]> = {
  piano: [
    "C2",
    "D#2",
    "F#2",
    "A2",
    "C3",
    "D#3",
    "F#3",
    "A3",
    "C4",
    "D#4",
    "F#4",
    "A4",
    "C5",
    "D#5",
    "F#5",
    "A5",
    "C6",
    "D#6",
    "F#6",
    "A6",
  ],
  violin: [
    "G3",
    "A3",
    "C4",
    "E4",
    "G4",
    "A4",
    "C5",
    "E5",
    "G5",
    "A5",
    "C6",
    "E6",
    "G6",
    "A6",
  ],
  cello: [
    "C2",
    "E2",
    "G2",
    "A2",
    "C3",
    "E3",
    "G3",
    "A3",
    "C4",
    "E4",
    "G4",
    "A4",
    "C5",
  ],
  contrabass: ["G1", "A#1", "C2", "D2", "E2", "F#2", "G#2", "A2", "C#3", "E3", "G#3", "B3"],
  organ: [
    "C2",
    "D#2",
    "F#2",
    "A2",
    "C3",
    "D#3",
    "F#3",
    "A3",
    "C4",
    "D#4",
    "F#4",
    "A4",
    "C5",
    "D#5",
    "F#5",
    "A5",
    "C6",
  ],
};

function noteToFilename(note: string): string {
  // C#4 → Cs4.mp3  (library naming)
  return `${note.replace("#", "s")}.mp3`;
}

function buildUrls(instrument: InstrumentName): Record<string, string> {
  const urls: Record<string, string> = {};
  for (const note of NOTE_MAPS[instrument]) {
    urls[note] = noteToFilename(note);
  }
  return urls;
}

export async function loadInstrument(name: InstrumentName): Promise<Tone.Sampler> {
  if (samplers[name] && loadState[name] === "ready") {
    return samplers[name]!;
  }
  if (loadPromises[name]) return loadPromises[name]!;

  loadState[name] = "loading";
  loadPromises[name] = new Promise<Tone.Sampler>((resolve, reject) => {
    const sampler = new Tone.Sampler({
      urls: buildUrls(name),
      baseUrl: `${BASE}/${name}/`,
      release: name === "piano" ? 1.4 : name === "organ" ? 0.35 : 0.8,
      attack: name === "violin" || name === "cello" ? 0.04 : 0.005,
      onload: () => {
        loadState[name] = "ready";
        samplers[name] = sampler;
        resolve(sampler);
      },
      onerror: (err) => {
        loadState[name] = "error";
        reject(err ?? new Error(`Failed to load ${name}`));
      },
    });
  });

  return loadPromises[name]!;
}

/** Instruments needed for each composer’s palette */
export function instrumentsForComposer(
  id: "bach" | "vivaldi" | "mozart" | "beethoven" | "chopin",
): InstrumentName[] {
  switch (id) {
    case "chopin":
    case "mozart":
    case "beethoven":
      return ["piano"];
    case "bach":
      return ["organ"];
    case "vivaldi":
      return ["violin", "cello", "contrabass"];
  }
}

export async function preloadForComposer(
  id: "bach" | "vivaldi" | "mozart" | "beethoven" | "chopin",
  onProgress?: (msg: string | null) => void,
): Promise<void> {
  const needed = instrumentsForComposer(id);
  for (const name of needed) {
    onProgress?.(`Loading ${name} samples…`);
    await loadInstrument(name);
  }
  onProgress?.(null);
}

export function getSampler(name: InstrumentName): Tone.Sampler | undefined {
  return samplers[name];
}

export function isInstrumentReady(name: InstrumentName): boolean {
  return loadState[name] === "ready";
}
