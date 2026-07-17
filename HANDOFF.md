# Composer Muse — Full Project Handoff

**Purpose of this doc:** Drop this into a **fresh LLM conversation** so the agent can resume work without prior chat history. It covers product intent, UX, education, sound architecture, file map, how to run, known gaps, and next improvements.

**Last updated:** 2026-07-17  
**Repo path:** `/Users/assafbarnir/1Code/xai/composer-muse`  
**GitHub:** https://github.com/assafbar2/composer-muse (public)  
**Live:** https://assafbar2.github.io/composer-muse/  
**Status:** Working web app — click composer → load samples → play generative piece in browser. Hosted free on GitHub Pages.

---

## 1. One-line product

**Composer Muse** is a dark “concert hall” web app: pick a famous composer, hear a **new original** piece *inspired by* their style (not a transcription of a famous work), and learn **how styles/eras differ**.

---

## 2. How to run (do this first)

```bash
cd /Users/assafbarnir/1Code/xai/composer-muse
npm install
npm run dev
```

Open the URL Vite prints (typically `http://127.0.0.1:5173` or `http://localhost:5173`).

- **No API key required** for music. Audio is client-side Tone.js + remote sample libraries.
- First click on a composer may take a few seconds: samples download (status banner: “Loading piano samples…” etc.).
- Browser needs a **user gesture** before Web Audio starts (the card click provides it).
- Production build: `npm run build` then `npm run preview`.

---

## 3. Product decisions (locked in conversation)

### 3.1 Scope (v1)

| Item | Decision |
|------|----------|
| Composers | **Bach, Vivaldi, Mozart, Beethoven, Chopin** (Bach added later) |
| Primary action | **Click composer card → compose + play** (card *is* the CTA) |
| Aesthetic | **Dark concert hall** — gold/ivory on near-black, vignette, stage lights, serif titles |
| Education | First-class: era timeline + style classroom + techniques for *this* piece |
| Music source | **Not** a cloud music model API for v1 — generative notes + **real instrument samples** |
| Legal framing | Always **“inspired by”**, never “by Chopin” or real famous titles (no Moonlight, Four Seasons, etc.) |

### 3.2 Why not one generic “classical” generator?

User asked how to handle different eras/styles (Chopin ≠ Bach ≠ Vivaldi).

**Approach locked:** **one dedicated style engine per composer** (melody rules, texture, instruments, tempo, form), not one engine with a name tag.

Same era can still differ:

- **Bach vs Vivaldi** (both Baroque): counterpoint/organ vs concerto/string orchestra  
- **Mozart vs Beethoven** (Classical bridge): balanced phrases vs motivic drama  
- **Chopin** (Romantic): intimate solo piano, rubato, arpeggios, chromatic color  

### 3.3 Sound-quality crisis & fix

**User feedback:** Music was “quite bad” — specifically the **instrument identity gap**: Chopin should be **piano**, Vivaldi should feel like a **whole orchestra**, not the same thin synth.

**Fix shipped:**

| Composer | Instruments (real samples) |
|----------|----------------------------|
| Chopin | Solo **grand piano** only |
| Mozart | Solo **grand piano** |
| Beethoven | Solo **grand piano** (octaves, drama) |
| Bach | **Pipe organ** (Baroque keyboard character; not Romantic piano) |
| Vivaldi | **String orchestra**: solo violin + section harmony + cello + contrabass |

Samples: [nbrosowsky/tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments) via jsDelivr CDN.

---

## 4. UX specification

### 4.1 Visual / layout (CTA-first)

**Rule:** The program (composer cards) must be visible without scrolling.
Education is valuable but secondary — it lives *below* the main event.

```
┌─────────────────────────────────────────────────────────┐
│  Compact hero: title + “Click a composer. Hear new.”    │
├─────────────────────────────────────────────────────────┤
│  THE PROGRAM — 5 cards  ← PRIMARY CTA (above the fold)  │
├─────────────────────────────────────────────────────────┤
│  Status / errors                                        │
├──────────────────────────────┬──────────────────────────┤
│  Player                      │  Style classroom         │
└──────────────────────────────┴──────────────────────────┘
│  History (if any)                                       │
│  “How eras differ” — education (after main event)       │
│  Footer + visit badge                                   │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Interaction rules

1. Card click → select + generate + play (after samples load).  
2. Selected card gets accent border/glow; generating state pulses.  
3. Player shows title, form, key, tempo marking, educational techniques.  
4. **Compose another** re-rolls same composer (new seed).  
5. History re-triggers compose for that composer.  
6. Stop halts Tone transport and parts.

### 4.3 Copy tone

- Museum / concert-hall language (“the program”, “this evening’s sketches”, “the hall is quiet”).  
- Educational without being dry.  
- Emphasize **new** and **inspired by**.

### 4.4 Design tokens (CSS)

- Fonts: **Cormorant Garamond** (display), **Source Sans 3** (body) — Google Fonts in `index.css`.  
- Colors: near-black `#0a0806`, ivory, muted gold `#c9a227`, per-composer accent CSS vars.  
- Per-composer accents live on each entry in `src/data/composers.ts` (`accent`, `accentSoft`).

---

## 5. Educational design (where learning lives)

User asked education to be explicit. It is **not** only a tooltip:

| Location | Content |
|----------|---------|
| **Era timeline** (`EraTimeline`) | Baroque / Classical / Romantic years, who belongs, core idea; note that engines are dedicated |
| **Style classroom** (`StylePanel`) | On select: summary, hallmarks, “compared with others”, “listen for”, instruments + texture |
| **Player techniques** | What *this generation* used (e.g. “Solo grand piano only”, “Ritornello returns”) |
| **Composer cards** | Era badge, years, tagline, essence line |

Source of truth for educational copy: **`src/data/composers.ts`** (`styleDiff`, `bible`, `ERA_TIMELINE`).

---

## 6. Music architecture

### 6.1 Pipeline

```
Click composer
    → Tone.start() + FX bus (reverb/hall/compressor)
    → preload samples for that composer’s palette
    → generators.generatePiece(id)  // pure JS note list
    → schedule Tone.Part(s) on real Tone.Sampler instruments
    → Transport.start() → audio out
```

### 6.2 Modules

| File | Role |
|------|------|
| `src/music/theory.ts` | RNG, scales, chords, MIDI helpers, key list |
| `src/music/generators.ts` | **Style engines** — produce `{ notes, bpm, meta }` |
| `src/music/samples.ts` | Load CDN samples into `Tone.Sampler` |
| `src/music/engine.ts` | FX, schedule parts, play/stop API |
| `src/music/types.ts` | `GeneratedPiece` public meta type |

### 6.3 Note model

Generators emit notes in **quarter-note beats** from 0. Engine converts with `secPerBeat = 60 / bpm` for Tone.Part (numeric times = seconds).

Each note: `{ voice, time, note, duration, velocity }`  
`voice` is a sample instrument: `piano | violin | cello | contrabass | organ`.

### 6.4 Style engine summary (keep these distinct)

**Chopin**

- Solo piano only  
- Slow–moderate (≈48–76 BPM)  
- 6/8-feel bars (3 quarter beats)  
- Held bass + wide LH arpeggios + cantabile RH + soft rubato offsets + occasional chromatic neighbor  
- Wet-er intimate reverb  

**Vivaldi**

- Violin (solo + mid harmony) + cello motor + contrabass roots  
- Allegro (~104–136)  
- Ritornello every ~5 bars (tutti) vs solo episodes  
- Larger hall reverb  

**Bach**

- Organ, multi-voice  
- Imitative second voice, sequences, pedal bass  
- Steady pulse, church-ish reverb  

**Mozart**

- Piano: Alberti LH + clear balanced phrases + soft bass root  
- Bright Classical, less reverb than Chopin  

**Beethoven**

- Piano: short motif in octaves, sparse dramatic bars, storm section, minor→major flash if minor  
- Strong dynamics  

### 6.5 Sample CDN

```
https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments@master/samples/{instrument}/
```

Instruments used: `piano`, `violin`, `cello`, `contrabass`, `organ`.  
Note files use library naming: `C#4` → `Cs4.mp3` (see `noteToFilename` in `samples.ts`).

Sparse sample maps (Tone pitch-shifts between keys) to balance quality vs download size.

### 6.6 What this is *not*

- Not Suno/Udio/MusicGen  
- Not MIDI export (yet)  
- Not score notation display (yet)  
- Not “sounds like a recording of the Berlin Philharmonic” — sampled instruments + algorithmic composition; better than synth beeps, still generative sketches  

---

## 7. File map

```
composer-muse/
├── HANDOFF.md                 ← this document
├── README.md                  ← short run instructions
├── package.json               ← react, tone, vite
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx                ← state: select, generate, play, history
    ├── App.css                ← concert-hall layout
    ├── index.css              ← tokens + fonts
    ├── data/composers.ts      ← composers, eras, educational copy, accents
    ├── components/
    │   ├── ComposerCard.tsx
    │   ├── EraTimeline.tsx
    │   ├── StylePanel.tsx
    │   └── Player.tsx
    └── music/
        ├── types.ts
        ├── theory.ts
        ├── generators.ts      ← musical substance
        ├── samples.ts         ← instrument identity
        └── engine.ts          ← play / stop
```

**Stack:** Vite + React 19 + TypeScript + Tone.js 15.  
**No** OpenAI/xAI/SpaceXAI wiring in the app today (optional future for titles/blurbs).

---

## 8. Public API surface (for agents editing code)

```ts
// engine.ts
generateAndPlay(composerId, seed?, onStatus?: (msg: string | null) => void): Promise<GeneratedPiece>
stopMusic(): void
getPlayingId(): string | null

// generators.ts
generatePiece(composerId, seed?): InternalPiece

// samples.ts
preloadForComposer(id, onProgress?)
instrumentsForComposer(id) // which samples to load
```

`GeneratedPiece` fields: `id`, `composerId`, `title`, `form`, `keyName`, `tempoBpm`, `tempoMarking`, `durationSeconds`, `techniquesUsed[]`, `blurb`, `createdAt`.

---

## 9. Known limitations & honest quality bar

1. **Composition quality** is algorithmic — plausible “in the language of”, not concert repertoire.  
2. **Samples** are free public multipacks — not Spitfire/VSL; violin can sound stiff if over-triggered.  
3. **Vivaldi “orchestra”** = strings only (no winds/brass/harpsichord continuo yet).  
4. **Bach** uses organ, not true harpsichord (no harpsichord in that sample pack).  
5. **Polyphony** heavy on Vivaldi/Beethoven can get dense; sampler may choke on weak devices.  
6. **Offline**: first play needs network for CDN samples (then browser cache).  
7. **No download** of audio file.  
8. Early version used pure Tone synths; that was rejected — do **not** regress to synth-only without samples.

---

## 10. Suggested next work (priority order)

Use this backlog if the user says “improve it” without detail:

1. **Sound quality**
   - Richer piano map (more sample notes) or `@tonejs/piano` / Salamander if CDN available  
   - Vivaldi: add continuo harpsichord or light viola layer; thin overlapping violin notes  
   - True harpsichord samples for Bach if a free pack is found  
   - Velocity curves and humanization  
2. **Composition quality**
   - Better phrase grammar / cadences  
   - Avoid note soup: fewer simultaneous mid voices on Vivaldi  
   - Longer, more memorable motifs with clear return  
3. **UX**
   - Mood chips (gentle / stormy) in v1.1  
   - Progress bar while samples load  
   - Waveform or simple visualizer tied to real meters  
   - Download WAV (Tone offline render)  
4. **Education**
   - Side-by-side A/B: same motif through two engines  
   - Short “era story” modal  
5. **AI optional**
   - SpaceXAI (`XAI_API_KEY`, `https://api.x.ai/v1`, model `grok-4.5`) only for titles/blurbs/variation seeds — keep samples + engines as source of sound unless product direction changes  

---

## 11. Original prompt stack (design phase — still useful)

If someone reintroduces LLM-driven music prompts or a music API later, the design-phase stack was:

1. **Layer A — Style Bible** (fixed per composer in `composers.ts` `bible` + `styleDiff`)  
2. **Layer B — Variation seed** (LLM invents form/key/mood/title as JSON)  
3. **Layer C — Music realization** (today: generators + samples; alt: text-to-music API)

Do **not** send only `"music in the style of Chopin"` to a model — encode era, instruments, texture, avoid-list.

---

## 12. Commands for a fresh agent

```text
Read HANDOFF.md and README.md in composer-muse.
Run the app (npm run dev) and verify Chopin = piano samples, Vivaldi = strings.
Then implement: <user’s new request>
```

Do not rebuild from scratch unless asked. Prefer editing `generators.ts` / `samples.ts` / `composers.ts` / CSS.

---

## 13. Quick regression checklist

After any audio change:

- [ ] `npm run build` passes  
- [ ] Chopin: only piano, slow intimate texture  
- [ ] Vivaldi: violin + cello + bass clearly different layers  
- [ ] Bach: organ, not piano patch  
- [ ] Mozart/Beethoven: piano  
- [ ] Status banner during first sample load  
- [ ] Stop works; second composer switches cleanly  
- [ ] Educational panel updates on select  
- [ ] No real famous work titles in generated `title`  

---

## 14. Conversation history summary (for context only)

1. User asked to design UI + prompts before building.  
2. Recommended gallery cards + two-layer style bibles + variation prompts.  
3. User: dark concert hall, build end-to-end with playable music, education, multi-style approach, add Bach — **Go**.  
4. Built Vite/React/Tone app with synth engines.  
5. User: music quality bad; Chopin must be piano, Vivaldi whole orchestra — gap.  
6. Replaced synths with real samples + rewritten generators.  
7. User: usage limits + this handoff doc.

---

*End of handoff. Prefer this file over reconstructing intent from scattered chat.*
