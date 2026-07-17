# Composer Muse

**Click a composer. Hear something new. Learn why it sounds that way.**

A dark concert-hall web app that generates **original instrumental music inspired by** Bach, Vivaldi, Mozart, Beethoven, and Chopin — then teaches you what makes each style different.

> **Live demo:** [https://assafbar2.github.io/composer-muse/](https://assafbar2.github.io/composer-muse/)  
> **Handoff for agents / new sessions:** [`HANDOFF.md`](./HANDOFF.md) · **Share copy:** [`docs/SOCIAL.md`](./docs/SOCIAL.md)

---

## The story

Classical “style” is often treated as one blob: *piano, old, fancy*. It isn’t.

- **Bach** builds architecture — interlocking lines (counterpoint) on a Baroque keyboard.
- **Vivaldi** paints outdoors — solo brilliance over a motor string orchestra.
- **Mozart** smiles in balanced phrases — Classical clarity and Alberti bass.
- **Beethoven** kicks the door — short motifs, silence, storm, hard-won light.
- **Chopin** confesses at the piano — singing melody, arpeggios, rubato, chromatic color.

Composer Muse was built so you can **hear that difference**, not only read about it. Each name is a **dedicated style engine** (rules for texture, harmony, tempo, and **real instrument samples**), not one generic “classical” generator with a sticker on it.

Music is **original and generative** — *inspired by* historical languages, never a transcription of a famous work. No API key. Runs in the browser.

---

## Try it

1. Open the [live hall](https://assafbar2.github.io/composer-muse/).
2. Click **Chopin** (first load may fetch piano samples for a few seconds).
3. Click **Vivaldi** — strings, not the same piano patch.
4. Read the **Style classroom** panel: hallmarks, “vs others,” and what to listen for.

---

## What’s on stage (features)

| Area | What you get |
|------|----------------|
| **Program** | Five composer cards — click = compose + play |
| **Sound** | Real samples: piano / organ / violin+cello+contrabass |
| **Education** | Era timeline · style classroom · techniques used *in this piece* |
| **Aesthetic** | Dark concert hall — gold, ivory, vignette |
| **Privacy** | No account; optional lightweight visit counter (see below) |

### Style engines (not one generator)

| Composer | Era | Sounds like | Engine focus |
|----------|-----|-------------|--------------|
| Bach | Baroque | Pipe organ | Imitation, sequences, steady pulse |
| Vivaldi | Baroque | String orchestra | Ritornello, motor rhythm, solo line |
| Mozart | High Classical | Solo piano | Balanced phrases, Alberti bass |
| Beethoven | Classical → Romantic | Solo piano | Motif, contrast, drama |
| Chopin | Romantic | Solo piano | Cantabile melody, arpeggios, rubato |

---

## Stack

- **Vite + React + TypeScript**
- **Tone.js** — scheduling + `Tone.Sampler`
- **Samples** — [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments) (CDN)
- **Host** — GitHub Pages (free)
- **No** music cloud API or server-side keys

---

## Run locally

```bash
git clone https://github.com/assafbar2/composer-muse.git
cd composer-muse
npm install
npm run dev
```

Open the URL Vite prints. Production build:

```bash
npm run build
npm run preview
```

`vite.config.ts` sets `base: '/composer-muse/'` for GitHub Pages.

---

## Visit counts (optional, free)

The live site shows a small **hits** badge in the footer via a free public counter service (no cookies, no account required on our side). Approximate — good enough to see if anyone’s walking into the hall.

Repo traffic (clones, views of the GitHub page) is also free under **Insights → Traffic** on this public repo.

---

## Roadmap & ideas for the future

Contributions and forks welcome. High-value directions:

1. **Better composition** — clearer motifs, stronger cadences, less note-soup on tutti bars  
2. **Richer samples** — denser piano map, harpsichord for Bach, winds for Vivaldi  
3. **Mood chips** — gentle / stormy / triumphant without leaving the one-click flow  
4. **Export** — download WAV / MIDI of the sketch  
5. **A/B classroom** — same seed idea through two engines side by side  
6. **More composers** — Debussy, Joplin, Satie, Hildegard, … with new engines  
7. **Optional LLM layer** — titles/blurbs via an API; keep samples as the sound source  
8. **PWA** — installable concert hall offline after first sample cache  

See also backlog notes in [`HANDOFF.md`](./HANDOFF.md).

---

## Project layout

```
src/
  data/composers.ts     # eras, education, accents
  music/generators.ts   # style engines
  music/samples.ts      # instrument samples
  music/engine.ts       # play / stop
  components/           # cards, player, classroom, timeline
docs/
  SOCIAL.md             # ready-to-post social copy
HANDOFF.md              # full agent / resume doc
```

---

## Disclaimer

Original generative sketches **inspired by** historical musical languages. Not affiliated with any estate, publisher, or recording label. Not reconstructions of copyrighted or canonical works by title.

---

## License

MIT — see [`LICENSE`](./LICENSE). Use, fork, teach, remix.
