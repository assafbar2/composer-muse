import * as Tone from "tone";
import type { ComposerId } from "../data/composers";
import type { GeneratedPiece } from "./types";
import { generatePiece, type SampleVoice } from "./generators";
import {
  getSampler,
  loadInstrument,
  preloadForComposer,
  type InstrumentName,
} from "./samples";

let fxReady = false;
let reverb: Tone.Reverb | null = null;
let hall: Tone.Reverb | null = null;
let comp: Tone.Compressor | null = null;
let master: Tone.Gain | null = null;
let currentParts: Tone.Part[] = [];
let playingId: string | null = null;
let stopTimer: number | null = null;

/** Per-instrument channel gains into FX */
const channels: Partial<Record<InstrumentName, Tone.Gain>> = {};

async function ensureFx(): Promise<void> {
  await Tone.start();
  if (fxReady) return;

  master = new Tone.Gain(0.9).toDestination();
  comp = new Tone.Compressor({ threshold: -16, ratio: 2.5, attack: 0.01, release: 0.2 });
  // Intimate room (piano / organ)
  reverb = new Tone.Reverb({ decay: 2.2, wet: 0.22, preDelay: 0.015 });
  // Larger hall (orchestra)
  hall = new Tone.Reverb({ decay: 3.6, wet: 0.32, preDelay: 0.025 });
  await Promise.all([reverb.generate(), hall.generate()]);

  reverb.connect(comp);
  hall.connect(comp);
  comp.connect(master);

  const mk = (wet: Tone.Reverb, vol: number) => {
    const g = new Tone.Gain(vol);
    g.connect(wet);
    return g;
  };

  channels.piano = mk(reverb, 1);
  channels.organ = mk(reverb, 0.85);
  channels.violin = mk(hall, 0.95);
  channels.cello = mk(hall, 0.75);
  channels.contrabass = mk(hall, 0.7);

  fxReady = true;
}

function disposeParts() {
  for (const p of currentParts) {
    try {
      p.stop(0);
      p.dispose();
    } catch {
      /* ignore */
    }
  }
  currentParts = [];
  if (stopTimer != null) {
    window.clearTimeout(stopTimer);
    stopTimer = null;
  }
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel(0);
  transport.position = 0;
  playingId = null;
}

export function stopMusic() {
  disposeParts();
}

export function getPlayingId(): string | null {
  return playingId;
}

function tuneFx(composerId: ComposerId) {
  if (!reverb || !hall) return;
  switch (composerId) {
    case "chopin":
      reverb.wet.value = 0.34;
      reverb.decay = 2.8;
      break;
    case "mozart":
      reverb.wet.value = 0.2;
      reverb.decay = 1.8;
      break;
    case "beethoven":
      reverb.wet.value = 0.26;
      reverb.decay = 2.4;
      break;
    case "bach":
      reverb.wet.value = 0.28;
      reverb.decay = 3.2; // church
      break;
    case "vivaldi":
      hall.wet.value = 0.36;
      hall.decay = 3.8;
      break;
  }
}

async function connectSamplers(voices: InstrumentName[]) {
  for (const name of voices) {
    const sampler = await loadInstrument(name);
    const ch = channels[name];
    if (!ch) continue;
    // Disconnect previous graph edges, then route through our channel
    sampler.disconnect();
    sampler.connect(ch);
    // Volume balance
    sampler.volume.value =
      name === "piano"
        ? -4
        : name === "violin"
          ? -6
          : name === "cello"
            ? -8
            : name === "contrabass"
              ? -7
              : -5; // organ
  }
}

export async function generateAndPlay(
  composerId: ComposerId,
  seed?: number,
  onStatus?: (msg: string | null) => void,
): Promise<GeneratedPiece> {
  await ensureFx();
  disposeParts();
  tuneFx(composerId);

  onStatus?.("Loading instrument samples…");
  await preloadForComposer(composerId, (m) => onStatus?.(m));
  await connectSamplers(
    composerId === "vivaldi"
      ? ["violin", "cello", "contrabass"]
      : composerId === "bach"
        ? ["organ"]
        : ["piano"],
  );
  onStatus?.(null);

  const piece = generatePiece(composerId, seed);
  const transport = Tone.getTransport();
  transport.bpm.value = piece.bpm;
  transport.position = 0;

  const secPerBeat = 60 / piece.bpm;

  // Group by sample voice
  const byVoice = new Map<SampleVoice, { time: number; note: string; duration: string | number; velocity: number }[]>();
  for (const n of piece.notes) {
    const list = byVoice.get(n.voice) ?? [];
    list.push({
      time: n.time * secPerBeat,
      note: n.note,
      duration: n.duration,
      velocity: n.velocity,
    });
    byVoice.set(n.voice, list);
  }

  for (const [voice, events] of byVoice) {
    const sampler = getSampler(voice as InstrumentName);
    if (!sampler) continue;

    const part = new Tone.Part((time, ev) => {
      try {
        sampler.triggerAttackRelease(ev.note, ev.duration, time, ev.velocity);
      } catch {
        /* out-of-range / not loaded note */
      }
    }, events.map((e) => [e.time, e] as const));

    part.start(0);
    currentParts.push(part);
  }

  transport.start();
  playingId = piece.meta.id;

  const ms = (piece.lengthBeats / piece.bpm) * 60 * 1000 + 2000;
  stopTimer = window.setTimeout(() => disposeParts(), ms);

  return piece.meta;
}

export function generateMetaOnly(composerId: ComposerId, seed?: number): GeneratedPiece {
  return generatePiece(composerId, seed).meta;
}
