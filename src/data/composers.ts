export type ComposerId =
  | "bach"
  | "vivaldi"
  | "mozart"
  | "beethoven"
  | "chopin";

export type Era =
  | "Baroque"
  | "High Classical"
  | "Classical → Romantic"
  | "Romantic";

export interface Composer {
  id: ComposerId;
  name: string;
  years: string;
  era: Era;
  tagline: string;
  instruments: string;
  /** Short card essence */
  essence: string;
  /** Accent color for concert-hall UI */
  accent: string;
  accentSoft: string;
  /** What makes THIS style different — educational */
  styleDiff: {
    summary: string;
    hallmarks: string[];
    vsOthers: string;
    listenFor: string[];
  };
  /** Fixed style bible for generation */
  bible: {
    texture: string;
    harmony: string;
    forms: string[];
    tempoFeel: string;
    dynamics: string;
    avoid: string;
  };
}

export const COMPOSERS: Composer[] = [
  {
    id: "bach",
    name: "Bach",
    years: "1685–1750",
    era: "Baroque",
    tagline: "Architecture in sound",
    instruments: "Pipe organ — imitative Baroque voices",
    essence: "Counterpoint · sequences · sacred clarity",
    accent: "#c9a227",
    accentSoft: "rgba(201, 162, 39, 0.18)",
    styleDiff: {
      summary:
        "Bach’s Baroque language is built from independent melodic lines that interlock (counterpoint), not from one big Romantic tune over soft chords.",
      hallmarks: [
        "Polyphonic texture — 2+ voices of equal importance",
        "Sequences: a short idea repeated higher or lower",
        "Steady motor pulse; less tempo rubato than Chopin",
        "Clear tonal centers with Baroque ornament and figuration",
      ],
      vsOthers:
        "Unlike Chopin’s singing melody + arpeggios, Bach weaves several lines. Unlike Beethoven’s dramatic silences and heroics, Bach’s drama is architectural — how lines fit together.",
      listenFor: [
        "Can you hear a second voice answering the first?",
        "Patterns that climb or fall in steps (sequences)",
        "Even, walking rhythm rather than free rubato",
      ],
    },
    bible: {
      texture: "Two-voice invention / imitative entries",
      harmony: "Functional Baroque progressions, circle-of-fifths motion",
      forms: ["invention", "prelude figuration", "fugato subject"],
      tempoFeel: "Steady allegro or andante; metronomic grace",
      dynamics: "Terrace dynamics; articulate keyboard attack",
      avoid: "Heavy Romantic pedal haze, orchestral storms, rubato soup",
    },
  },
  {
    id: "vivaldi",
    name: "Vivaldi",
    years: "1678–1741",
    era: "Baroque",
    tagline: "Venice in motion",
    instruments: "Solo violin + cello section + contrabass (string orchestra)",
    essence: "Ritornello · motor rhythm · bright strings",
    accent: "#3d9b8f",
    accentSoft: "rgba(61, 155, 143, 0.18)",
    styleDiff: {
      summary:
        "Vivaldi is Baroque like Bach, but theatrical and outdoor: solo brilliance over driving string patterns, not dense keyboard counterpoint.",
      hallmarks: [
        "Ritornello feel — a bright idea returns like a refrain",
        "Motoric sixteenth-note energy (rushing water, storm, spring)",
        "Solo vs. group contrast (concerto spirit)",
        "Clear major/minor colors and sequential harmony",
      ],
      vsOthers:
        "Same era as Bach, different job: Vivaldi paints scenes with violin fire; Bach builds cathedrals of counterpoint. Far lighter than Beethoven’s fist-on-the-door drama.",
      listenFor: [
        "Repeating motor rhythms in the accompaniment",
        "A “solo” line soaring above busy strings",
        "Sudden bright returns of the opening idea",
      ],
    },
    bible: {
      texture: "Solo figuration over motoric string patterns",
      harmony: "Sequences, clear tonal centers, Baroque sequences",
      forms: ["concerto allegro", "pastoral episode", "storm passage"],
      tempoFeel: "Energetic allegro or serene largo pulse",
      dynamics: "Terraced contrasts, Venetian brilliance",
      avoid: "Nocturne piano language, Wagnerian weight, jazz harmony",
    },
  },
  {
    id: "mozart",
    name: "Mozart",
    years: "1756–1791",
    era: "High Classical",
    tagline: "Sunlight and wit",
    instruments: "Solo grand piano — Classical clarity",
    essence: "Balanced phrases · Alberti bass · grace",
    accent: "#d4a574",
    accentSoft: "rgba(212, 165, 116, 0.18)",
    styleDiff: {
      summary:
        "Mozart’s High Classical style prizes clarity: balanced phrases, transparent accompaniment, and elegant surprise — never thick Romantic fog.",
      hallmarks: [
        "Question–answer phrase shapes (often 4+4 bars)",
        "Alberti-style broken-chord accompaniment",
        "Diatonic elegance with witty cadences",
        "Refined dynamics — smile, not thunder",
      ],
      vsOthers:
        "Lighter and more symmetrical than Beethoven. Less chromatic intimacy than Chopin. Far less polyphonic density than Bach.",
      listenFor: [
        "A graceful tune you could almost sing",
        "Even, sparkling left-hand patterns",
        "Clean cadences that feel like a bow at court",
      ],
    },
    bible: {
      texture: "Melody + transparent accompaniment",
      harmony: "Functional Classical progressions, elegant surprises",
      forms: ["sonata allegro spirit", "minuet lightness", "rondo play"],
      tempoFeel: "Graceful allegro or andante; dancing pulse",
      dynamics: "Refined contrasts, never brutal",
      avoid: "Stormy late-Romantic weight, dense counterpoint as default",
    },
  },
  {
    id: "beethoven",
    name: "Beethoven",
    years: "1770–1827",
    era: "Classical → Romantic",
    tagline: "Fist on destiny’s door",
    instruments: "Solo grand piano — orchestral force from the keys",
    essence: "Motif · contrast · heroic struggle",
    accent: "#8b7355",
    accentSoft: "rgba(139, 115, 85, 0.22)",
    styleDiff: {
      summary:
        "Beethoven bridges Classical form and Romantic emotion: short motifs develop into drama, with extreme dynamics and a sense of struggle → triumph.",
      hallmarks: [
        "Tiny motifs expanded into whole paragraphs",
        "Sudden silences and explosive fortissimo breaks",
        "Heroic minor-to-major emotional arcs",
        "Developmental drive — ideas transform, not just repeat",
      ],
      vsOthers:
        "More violent contrast than Mozart’s courtly balance. Less salon intimacy than Chopin. Motivic work instead of Bach’s continuous counterpoint weave.",
      listenFor: [
        "A short “knock” idea that returns transformed",
        "Quiet → sudden loud (theatrical dynamics)",
        "Dark tension that tries to break into light",
      ],
    },
    bible: {
      texture: "Bold motifs, dramatic rests, developmental force",
      harmony: "Strong tonic/dominant pillars, bold turns",
      forms: ["sonata drama", "funeral gravity", "triumphant close"],
      tempoFeel: "Brooding to driving allegro con brio",
      dynamics: "Extreme pp whispers to ff thunder",
      avoid: "Only Rococo prettiness; soft ambient pads as core",
    },
  },
  {
    id: "chopin",
    name: "Chopin",
    years: "1810–1849",
    era: "Romantic",
    tagline: "A private confession at the piano",
    instruments: "Solo grand piano only — singing line + arpeggios",
    essence: "Nocturne intimacy · rubato · chromatic color",
    accent: "#9b7bb8",
    accentSoft: "rgba(155, 123, 184, 0.2)",
    styleDiff: {
      summary:
        "Chopin’s Romantic piano is intimate and vocal: one singing melody floats over wide arpeggios, with chromatic harmony and flexible time (rubato).",
      hallmarks: [
        "Cantabile (singing) right-hand melody",
        "Wide left-hand arpeggios and pedal haze",
        "Chromatic color — notes that “yearn” between keys",
        "Rubato feel: time breathes with the phrase",
      ],
      vsOthers:
        "Opposite of Bach’s equal voices and Vivaldi’s outdoor motor energy. More private than Beethoven’s public heroism. More chromatic and free than Mozart’s Classical balance.",
      listenFor: [
        "A melody that feels like a human voice",
        "Shimmering arpeggios underneath",
        "Harmonies that slip sideways into unexpected color",
      ],
    },
    bible: {
      texture: "Melody + arpeggiated accompaniment",
      harmony: "Chromaticism, secondary dominants, distant colors",
      forms: ["nocturne", "prélude", "waltz fragment", "mazurka lilt"],
      tempoFeel: "Slow–moderate; floating pulse",
      dynamics: "Intimate pp–mf with poetic swells",
      avoid: "Full brass storms, rigid march, EDM drums",
    },
  },
];

export function getComposer(id: ComposerId): Composer {
  const c = COMPOSERS.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown composer: ${id}`);
  return c;
}

/** Compact era timeline for the educational strip */
export const ERA_TIMELINE = [
  {
    era: "Baroque",
    years: "~1600–1750",
    composers: "Bach · Vivaldi",
    idea: "Counterpoint, motor rhythm, terraced dynamics",
  },
  {
    era: "Classical",
    years: "~1750–1820",
    composers: "Mozart · (early) Beethoven",
    idea: "Clarity, balanced phrases, elegant form",
  },
  {
    era: "Romantic",
    years: "~1820–1900",
    composers: "Beethoven (late) · Chopin",
    idea: "Personal emotion, chromatic color, free expression",
  },
] as const;
