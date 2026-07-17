# Composer Muse

Dark concert-hall web app: pick a famous composer, hear a **new** piece generated in their style, and learn what makes each style different.

**Full project handoff (for a fresh LLM session):** see [`HANDOFF.md`](./HANDOFF.md) — UX, education, sound architecture, file map, backlog, and regression checklist.

## Composers

Bach · Vivaldi · Mozart · Beethoven · Chopin

Each composer has a **dedicated style engine** (not one generic classical generator):

| Composer  | Era                    | Engine focus                                      |
|-----------|------------------------|---------------------------------------------------|
| Bach      | Baroque                | Imitative counterpoint, sequences, steady pulse   |
| Vivaldi   | Baroque                | Ritornello, motor rhythm, solo-over-strings       |
| Mozart    | High Classical         | Balanced phrases, Alberti bass, clear cadences    |
| Beethoven | Classical → Romantic   | Motivic drama, dynamic contrast, heroic arcs      |
| Chopin    | Romantic               | Cantabile melody, arpeggios, rubato, chromaticism |

## Educational UI

- **Era timeline** at the top — Baroque / Classical / Romantic at a glance  
- **Style classroom** panel — hallmarks, “vs others,” and “listen for” after you pick a composer  
- **Techniques in this piece** — what the current generation actually used  

## Run

```bash
cd composer-muse
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Click a composer card — audio starts after the browser allows Web Audio (user gesture).

## Stack

- Vite + React + TypeScript  
- [Tone.js](https://tonejs.github.io/) for synthesis and scheduling  
- No external music API or API key required  

## Note

Music is **original generative audio inspired by** historical languages — not transcriptions of famous works.
