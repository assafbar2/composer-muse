import type { ComposerId } from "../data/composers";

export interface GeneratedPiece {
  id: string;
  composerId: ComposerId;
  title: string;
  form: string;
  keyName: string;
  tempoBpm: number;
  tempoMarking: string;
  durationSeconds: number;
  /** Educational: techniques used in THIS generation */
  techniquesUsed: string[];
  blurb: string;
  createdAt: number;
}

export type NoteName =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

export interface ScheduledNote {
  time: string | number;
  note: string;
  duration: string | number;
  velocity?: number;
}
