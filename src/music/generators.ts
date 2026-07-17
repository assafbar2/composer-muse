import type { ComposerId } from "../data/composers";
import type { GeneratedPiece } from "./types";
import {
  HARMONIC_MINOR,
  KEYS,
  MAJOR_SCALE,
  MINOR_SCALE,
  chance,
  chordTones,
  clamp,
  degreeToMidi,
  midiToNote,
  mulberry32,
  pick,
  titleParts,
} from "./theory";

/** Mapped to real samples in the player */
export type SampleVoice =
  | "piano"
  | "violin"
  | "cello"
  | "contrabass"
  | "organ";

export interface GenNote {
  voice: SampleVoice;
  /** quarter-note beats from start */
  time: number;
  note: string;
  duration: string | number;
  velocity: number;
}

export interface InternalPiece {
  meta: GeneratedPiece;
  notes: GenNote[];
  bpm: number;
  lengthBeats: number;
}

function scaleFor(minor: boolean, romantic = false) {
  if (minor) return romantic ? HARMONIC_MINOR : MINOR_SCALE;
  return MAJOR_SCALE;
}

function deg(
  root: number,
  scale: readonly number[],
  degree: number,
  octave: number,
): string {
  return midiToNote(degreeToMidi(root, scale, degree, octave));
}

/* ═══════════════════════ CHOPIN — solo piano nocturne ═══════════════════════ */

function genChopin(rng: () => number, seed: number): InternalPiece {
  const key = pick(
    rng,
    KEYS.filter(
      (k) =>
        k.minor ||
        ["D major", "A major", "F major", "B♭ major", "E♭ major", "G major"].includes(
          k.name,
        ),
    ),
  );
  const scale = scaleFor(key.minor, true);
  const bpm = Math.round(48 + rng() * 28); // Lento–Andante
  const bars = 14 + Math.floor(rng() * 6);
  const barBeats = 3; // 6/8 compound feel
  const lengthBeats = bars * barBeats;
  const notes: GenNote[] = [];
  const prog = pick(rng, [
    [0, 5, 3, 4], // I vi IV V
    [0, 3, 4, 0],
    [0, 4, 5, 3],
    [5, 3, 4, 0],
  ]);

  // Singing motif (scale degrees relative to chord root offset later)
  const motif = [4, 4, 5, 4, 2, 3, 4, 7, 5, 4, 3, 2, 0, 2, 4, 5];

  for (let bar = 0; bar < bars; bar++) {
    const t = bar * barBeats;
    const degRoot = prog[bar % prog.length]!;
    const isCadence = bar === bars - 1 || bar % 4 === 3;

    // Low bass note (held) — left-hand foundation
    notes.push({
      voice: "piano",
      time: t,
      note: deg(key.root, scale, degRoot, 2),
      duration: isCadence ? "2n." : "2n",
      velocity: 0.38,
    });

    // Wide arpeggio accompaniment (6 eighths in 6/8)
    const chord = chordTones(key.root, scale, degRoot, 3);
    const arp = [
      chord[0]! - 12,
      chord[1]! - 12,
      chord[2]! - 12,
      chord[0]!,
      chord[1]!,
      chord[2]! + (chance(rng, 0.35) ? 12 : 0),
    ];
    for (let i = 0; i < 6; i++) {
      const rubato = (rng() - 0.5) * 0.05;
      notes.push({
        voice: "piano",
        time: t + i * 0.5 + rubato,
        note: midiToNote(clamp(arp[i]!, 36, 72)),
        duration: "8n",
        velocity: 0.22 + (i === 0 ? 0.08 : 0),
      });
    }

    // Cantabile melody — longer values, occasional chromatic neighbor
    const phrase = bar % 8 < 4 ? motif : [...motif].reverse();
    // 4 melody notes per bar (half-note-ish in 6/8)
    for (let i = 0; i < 4; i++) {
      let d = phrase[(bar * 2 + i) % phrase.length]! + degRoot;
      let midi = degreeToMidi(key.root, scale, d, 5);
      if (chance(rng, 0.12)) midi += chance(rng, 0.5) ? 1 : -1; // chromatic color
      midi = clamp(midi, 60, 84);
      const rubato = (rng() - 0.5) * 0.07;
      const long = i === 0 || i === 3 || isCadence;
      notes.push({
        voice: "piano",
        time: t + i * 0.75 + rubato,
        note: midiToNote(midi),
        duration: long ? "4n." : "4n",
        velocity: 0.55 + rng() * 0.2,
      });
    }

    // Soft inner-voice chord on beat 1 (Romantic color)
    if (bar % 2 === 0) {
      const inner = chordTones(key.root, scale, degRoot, 4);
      for (const m of [inner[1]!, inner[2]!]) {
        notes.push({
          voice: "piano",
          time: t + 0.05,
          note: midiToNote(m),
          duration: "2n",
          velocity: 0.18,
        });
      }
    }
  }

  const form = pick(rng, ["Nocturne sketch", "Prélude", "Rêverie", "Berceuse"]);
  const title = titleParts(rng, [
    ["Nocturne", "Prélude", "Rêverie", "Berceuse", "Elegy", "Souvenir"],
    ["in"],
    [key.name],
  ]);

  return {
    bpm,
    lengthBeats,
    notes,
    meta: {
      id: `chopin-${seed}`,
      composerId: "chopin",
      title,
      form,
      keyName: key.name,
      tempoBpm: bpm,
      tempoMarking: bpm < 58 ? "Lento" : "Andante",
      durationSeconds: Math.round((lengthBeats / bpm) * 60),
      techniquesUsed: [
        "Solo grand piano only",
        "Cantabile (singing) right-hand melody",
        "Wide left-hand arpeggios + held bass",
        "Gentle rubato and chromatic neighbors",
      ],
      blurb: `${form} in ${key.name} — intimate Romantic piano: one voice that sings over shimmering arpeggios.`,
      createdAt: Date.now(),
    },
  };
}

/* ═══════════════════════ VIVALDI — string orchestra ═══════════════════════ */

function genVivaldi(rng: () => number, seed: number): InternalPiece {
  const key = pick(
    rng,
    KEYS.filter((k) =>
      ["E major", "G major", "A major", "D major", "A minor", "E minor", "C major", "B minor"].includes(
        k.name,
      ),
    ),
  );
  const scale = scaleFor(key.minor);
  const bpm = Math.round(104 + rng() * 32);
  const bars = 20 + Math.floor(rng() * 6);
  const lengthBeats = bars * 4;
  const notes: GenNote[] = [];

  // Ritornello theme (solo + tutti)
  const rit = [0, 2, 4, 5, 4, 2, 0, 4, 5, 7, 5, 4, 2, 0, 2, 0];
  const soloRun = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0, 2, 4, 5, 7, 4];

  for (let bar = 0; bar < bars; bar++) {
    const t = bar * 4;
    const isRit = bar % 5 === 0 || bar === bars - 1;
    const isSolo = !isRit && bar % 5 !== 4;
    const degRoot = isRit ? 0 : pick(rng, [0, 3, 4, 5]);

    // Contrabass: harmonic foundation (orchestra floor)
    for (let beat = 0; beat < 4; beat++) {
      notes.push({
        voice: "contrabass",
        time: t + beat,
        note: deg(key.root, scale, degRoot, 2),
        duration: "4n",
        velocity: isRit ? 0.55 : 0.4,
      });
    }

    // Cello section: motoric mid-range (orchestral body)
    for (let i = 0; i < 8; i++) {
      const d = degRoot + (i % 2 === 0 ? 0 : 2);
      notes.push({
        voice: "cello",
        time: t + i * 0.5,
        note: deg(key.root, scale, d, 3),
        duration: "8n",
        velocity: isRit ? 0.45 : 0.32,
      });
    }

    // Second violin texture (tutti harmony) — same violin sampler, lower register
    if (isRit || bar % 2 === 0) {
      const ch = chordTones(key.root, scale, degRoot, 4);
      for (let beat = 0; beat < 4; beat++) {
        notes.push({
          voice: "violin",
          time: t + beat,
          note: midiToNote(ch[1]!),
          duration: "4n",
          velocity: isRit ? 0.35 : 0.22,
        });
        notes.push({
          voice: "violin",
          time: t + beat + 0.02,
          note: midiToNote(ch[2]!),
          duration: "4n",
          velocity: isRit ? 0.3 : 0.18,
        });
      }
    }

    // Solo violin — brilliant top line
    const line = isRit ? rit : soloRun;
    for (let i = 0; i < 8; i++) {
      const d = line[i]! + (isSolo ? degRoot * 0 : 0) + (isRit ? 0 : Math.floor(degRoot / 2));
      const midi = clamp(degreeToMidi(key.root, scale, d + (isRit ? 0 : degRoot > 3 ? 1 : 0), 5), 55, 93);
      notes.push({
        voice: "violin",
        time: t + i * 0.5,
        note: midiToNote(midi),
        duration: isRit && i % 4 === 3 ? "4n" : "8n",
        velocity: isRit ? 0.72 : 0.62 + rng() * 0.15,
      });
    }
  }

  const form = pick(rng, [
    "Concerto allegro",
    "Ritornello allegro",
    "Storm episode",
    "Pastoral allegro",
  ]);
  const title = titleParts(rng, [
    ["Spring", "Tide", "Zephyr", "Tempest", "Lagoon", "Aurora", "Festival", "Solstice"],
    ["Concerto", "Allegro", "Caprice"],
  ]);

  return {
    bpm,
    lengthBeats,
    notes,
    meta: {
      id: `vivaldi-${seed}`,
      composerId: "vivaldi",
      title,
      form,
      keyName: key.name,
      tempoBpm: bpm,
      tempoMarking: "Allegro",
      durationSeconds: Math.round((lengthBeats / bpm) * 60),
      techniquesUsed: [
        "String orchestra: solo violin + section + cello + contrabass",
        "Ritornello returns (tutti vs solo)",
        "Motoric Baroque accompaniment",
        "Concerto brilliance in the top line",
      ],
      blurb: `${form} in ${key.name} — full string orchestra texture, not a keyboard sketch.`,
      createdAt: Date.now(),
    },
  };
}

/* ═══════════════════════ BACH — organ / Baroque keyboard ═══════════════════════ */

function genBach(rng: () => number, seed: number): InternalPiece {
  const key = pick(rng, KEYS.filter((k) => !k.minor || chance(rng, 0.45)));
  const scale = scaleFor(key.minor);
  const bpm = Math.round(84 + rng() * 36);
  const bars = 16 + Math.floor(rng() * 6);
  const lengthBeats = bars * 4;
  const notes: GenNote[] = [];
  const prog = [0, 3, 4, 0, 0, 5, 4, 0];
  const subject = [0, 2, 4, 3, 2, 1, 0, 4, 5, 4, 3, 2, 1, 0, -1, 0];

  for (let bar = 0; bar < bars; bar++) {
    const t = bar * 4;
    const degRoot = prog[bar % prog.length]!;
    const seq = bar >= 8 ? (bar % 2 === 0 ? 2 : -1) : 0;

    // Upper voice (subject / sequences)
    for (let i = 0; i < 8; i++) {
      const d = subject[i]! + degRoot + seq;
      notes.push({
        voice: "organ",
        time: t + i * 0.5,
        note: deg(key.root, scale, d, 4),
        duration: "8n",
        velocity: 0.58,
      });
    }

    // Lower voice — imitation delayed by half a beat after bar 0
    if (bar > 0) {
      for (let i = 0; i < 8; i++) {
        const d = subject[(i + 3) % 16]! + degRoot - 2 + seq;
        notes.push({
          voice: "organ",
          time: t + i * 0.5 + 0.25,
          note: deg(key.root, scale, d, 3),
          duration: "8n",
          velocity: 0.48,
        });
      }
    }

    // Pedal / bass on strong beats
    for (let beat = 0; beat < 4; beat++) {
      notes.push({
        voice: "organ",
        time: t + beat,
        note: deg(key.root, scale, degRoot + (beat === 3 ? -1 : 0), 2),
        duration: "4n",
        velocity: 0.42,
      });
    }
  }

  const form = pick(rng, ["Two-voice invention", "Prelude", "Fugato sketch", "Sinfonia"]);
  const title = titleParts(rng, [
    ["Invention", "Prelude", "Canon", "Sinfonia", "Capriccio"],
    ["in"],
    [key.name.split(" ")[0]!],
  ]);

  return {
    bpm,
    lengthBeats,
    notes,
    meta: {
      id: `bach-${seed}`,
      composerId: "bach",
      title,
      form,
      keyName: key.name,
      tempoBpm: bpm,
      tempoMarking: bpm > 108 ? "Allegro moderato" : "Andante",
      durationSeconds: Math.round((lengthBeats / bpm) * 60),
      techniquesUsed: [
        "Pipe organ (Baroque keyboard character)",
        "Imitative counterpoint — a second voice answers the first",
        "Sequences climbing with the harmony",
        "Steady motor pulse, little rubato",
      ],
      blurb: `${form} in ${key.name} — architectural Baroque lines on organ, not Romantic piano.`,
      createdAt: Date.now(),
    },
  };
}

/* ═══════════════════════ MOZART — Classical piano ═══════════════════════ */

function genMozart(rng: () => number, seed: number): InternalPiece {
  const key = pick(
    rng,
    KEYS.filter((k) =>
      ["C major", "G major", "D major", "F major", "A major", "A minor", "D minor", "B♭ major"].includes(
        k.name,
      ),
    ),
  );
  const scale = scaleFor(key.minor);
  const bpm = Math.round(112 + rng() * 28);
  const bars = 16 + Math.floor(rng() * 8);
  const lengthBeats = bars * 4;
  const notes: GenNote[] = [];
  const prog = pick(rng, [
    [0, 4, 0, 4],
    [0, 3, 4, 0],
    [0, 5, 3, 4],
    [0, 4, 5, 0],
  ]);
  const motifA = [0, 2, 4, 2, 3, 1, 0, 0, 2, 4, 5, 4, 2, 0, -1, 0];
  const motifB = [4, 2, 0, 1, 2, 4, 5, 4, 3, 1, 0, 2, 4, 2, 0, 0];

  for (let bar = 0; bar < bars; bar++) {
    const t = bar * 4;
    const degRoot = prog[bar % prog.length]!;
    const phrase = bar % 8 < 4 ? motifA : motifB;
    const chord = chordTones(key.root, scale, degRoot, 3);

    // Alberti: low–high–mid–high on piano
    const pat = [0, 2, 1, 2];
    for (let i = 0; i < 8; i++) {
      const n = chord[pat[i % 4]!]! - 12;
      notes.push({
        voice: "piano",
        time: t + i * 0.5,
        note: midiToNote(n),
        duration: "8n",
        velocity: 0.28,
      });
    }

    // Soft bass root
    notes.push({
      voice: "piano",
      time: t,
      note: deg(key.root, scale, degRoot, 2),
      duration: "1m",
      velocity: 0.32,
    });

    // Clear melody
    for (let i = 0; i < 8; i++) {
      const d = phrase[i]! + degRoot;
      const isCad = bar % 4 === 3 && i >= 6;
      notes.push({
        voice: "piano",
        time: t + i * 0.5,
        note: deg(key.root, scale, d, 5),
        duration: isCad ? "4n" : "8n",
        velocity: 0.58 + (i === 0 ? 0.08 : 0),
      });
    }
  }

  const form = pick(rng, [
    "Sonata allegro spirit",
    "Rondo",
    "Minuet sketch",
    "Piano sonatina",
  ]);
  const title = titleParts(rng, [
    ["Sonatina", "Rondo", "Minuet", "Divertimento", "Allegro"],
    ["in"],
    [key.name],
  ]);

  return {
    bpm,
    lengthBeats,
    notes,
    meta: {
      id: `mozart-${seed}`,
      composerId: "mozart",
      title,
      form,
      keyName: key.name,
      tempoBpm: bpm,
      tempoMarking: "Allegro",
      durationSeconds: Math.round((lengthBeats / bpm) * 60),
      techniquesUsed: [
        "Solo piano — Classical clarity",
        "Alberti broken-chord accompaniment",
        "Balanced question–answer phrases",
        "Clean cadences",
      ],
      blurb: `${form} in ${key.name} — bright Classical piano: graceful tune over sparkling left hand.`,
      createdAt: Date.now(),
    },
  };
}

/* ═══════════════════════ BEETHOVEN — dramatic piano ═══════════════════════ */

function genBeethoven(rng: () => number, seed: number): InternalPiece {
  const minors = KEYS.filter((k) =>
    ["C minor", "D minor", "E minor", "G minor", "A minor", "C♯ minor", "F minor"].includes(
      k.name,
    ),
  );
  const majors = KEYS.filter((k) =>
    ["C major", "E♭ major", "F major", "G major"].includes(k.name),
  );
  const key = chance(rng, 0.72) ? pick(rng, minors) : pick(rng, majors);
  const scale = scaleFor(key.minor, true);
  const bpm = Math.round(96 + rng() * 44);
  const bars = 16 + Math.floor(rng() * 8);
  const lengthBeats = bars * 4;
  const notes: GenNote[] = [];
  const motifDeg = [0, 0, 0, -2];
  const motifDur = [0.5, 0.5, 0.5, 1.5];

  for (let bar = 0; bar < bars; bar++) {
    const t = bar * 4;
    const section =
      bar < bars / 3 ? "exposition" : bar < (2 * bars) / 3 ? "storm" : "resolve";
    const degRoot = section === "storm" ? 4 : 0;

    if (bar % 2 === 0 || section === "storm") {
      let mt = t;
      for (let i = 0; i < 4; i++) {
        const d = motifDeg[i]! + (section === "storm" ? 2 : 0) + (bar > bars / 2 ? 1 : 0);
        const midi = degreeToMidi(key.root, scale, d, section === "storm" ? 4 : 3);
        const vel = section === "storm" ? 0.88 : section === "resolve" ? 0.55 : 0.78;
        // Octave doubling = power (still piano)
        notes.push({
          voice: "piano",
          time: mt,
          note: midiToNote(midi + 12),
          duration: motifDur[i]!,
          velocity: vel,
        });
        notes.push({
          voice: "piano",
          time: mt,
          note: midiToNote(midi),
          duration: motifDur[i]!,
          velocity: vel * 0.85,
        });
        notes.push({
          voice: "piano",
          time: mt,
          note: midiToNote(midi - 12),
          duration: motifDur[i]!,
          velocity: vel * 0.7,
        });
        mt += motifDur[i]!;
      }
    } else if (chance(rng, 0.4)) {
      // Dramatic sparse bar
      notes.push({
        voice: "piano",
        time: t,
        note: deg(key.root, scale, degRoot, 2),
        duration: "2n",
        velocity: 0.4,
      });
    } else {
      for (let i = 0; i < 4; i++) {
        const d = degRoot + [0, 2, 4, 5][i]!;
        notes.push({
          voice: "piano",
          time: t + i,
          note: deg(key.root, scale, d, 4),
          duration: "4n",
          velocity: 0.5 + i * 0.08,
        });
      }
    }

    // Left-hand pillars
    for (let beat = 0; beat < 4; beat++) {
      if (section === "storm" || beat % 2 === 0) {
        notes.push({
          voice: "piano",
          time: t + beat,
          note: deg(key.root, scale, degRoot, 2),
          duration: "4n",
          velocity: section === "storm" ? 0.6 : 0.42,
        });
      }
    }
  }

  // Major flash ending if minor
  if (key.minor) {
    const t = (bars - 1) * 4;
    for (let i = 0; i < 4; i++) {
      const d = [0, 2, 4, 7][i]!;
      notes.push({
        voice: "piano",
        time: t + i,
        note: deg(key.root, MAJOR_SCALE, d, 4),
        duration: "4n",
        velocity: 0.75,
      });
      notes.push({
        voice: "piano",
        time: t + i,
        note: deg(key.root, MAJOR_SCALE, d, 3),
        duration: "4n",
        velocity: 0.55,
      });
    }
  }

  const form = pick(rng, ["Motivic drama", "Sonata fragment", "Heroic sketch", "Pathétique spirit"]);
  const title = titleParts(rng, [
    ["Path", "Tempest", "Defiance", "Omen", "Ascent", "Hammer", "Threshold"],
    ["in"],
    [key.name],
  ]);

  return {
    bpm,
    lengthBeats,
    notes,
    meta: {
      id: `beethoven-${seed}`,
      composerId: "beethoven",
      title,
      form,
      keyName: key.name,
      tempoBpm: bpm,
      tempoMarking: bpm > 120 ? "Allegro con brio" : "Maestoso",
      durationSeconds: Math.round((lengthBeats / bpm) * 60),
      techniquesUsed: [
        "Solo piano — orchestral force from the keyboard",
        "Short motif in octaves, developed across the piece",
        "Extreme dynamic contrast",
        key.minor ? "Minor struggle with a brighter closing flash" : "Heroic major drive",
      ],
      blurb: `${form} in ${key.name} — Beethoven’s drama on piano: motif, silence, and thunder.`,
      createdAt: Date.now(),
    },
  };
}

export function generatePiece(composerId: ComposerId, seed?: number): InternalPiece {
  const s = seed ?? (Math.floor(Math.random() * 1e9) ^ Date.now());
  const rng = mulberry32(s);
  switch (composerId) {
    case "bach":
      return genBach(rng, s);
    case "vivaldi":
      return genVivaldi(rng, s);
    case "mozart":
      return genMozart(rng, s);
    case "beethoven":
      return genBeethoven(rng, s);
    case "chopin":
      return genChopin(rng, s);
    default:
      return genMozart(rng, s);
  }
}
