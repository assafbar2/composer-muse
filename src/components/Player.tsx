import type { CSSProperties } from "react";
import type { GeneratedPiece } from "../music/types";
import type { Composer } from "../data/composers";

interface Props {
  piece: GeneratedPiece | null;
  composer: Composer | null;
  playing: boolean;
  onReplay: () => void;
  onReroll: () => void;
  onStop: () => void;
}

export function Player({
  piece,
  composer,
  playing,
  onReplay,
  onReroll,
  onStop,
}: Props) {
  if (!piece || !composer) {
    return (
      <section className="player empty-player">
        <div className="player-inner">
          <p className="player-placeholder">
            The hall is quiet. Choose a composer — a new piece will be composed and
            played here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`player ${playing ? "is-playing" : ""}`}
      style={
        {
          "--accent": composer.accent,
          "--accent-soft": composer.accentSoft,
        } as CSSProperties
      }
    >
      <div className="player-inner">
        <div className="player-meta">
          <span className="now-label">{playing ? "Now playing" : "Last composed"}</span>
          <h2 className="piece-title">{piece.title}</h2>
          <p className="piece-sub">
            Inspired by <strong>{composer.name}</strong>
            <span className="dot">·</span>
            {piece.form}
            <span className="dot">·</span>
            {piece.keyName}
            <span className="dot">·</span>
            {piece.tempoMarking} (~{piece.tempoBpm} BPM)
          </p>
          <p className="piece-blurb">{piece.blurb}</p>
        </div>

        <div className="player-controls">
          {playing ? (
            <button type="button" className="btn primary" onClick={onStop}>
              Stop
            </button>
          ) : (
            <button type="button" className="btn primary" onClick={onReplay}>
              Play again
            </button>
          )}
          <button type="button" className="btn ghost" onClick={onReroll}>
            Compose another
          </button>
        </div>

        <div className="techniques">
          <h3 className="subhead">Techniques in this piece</h3>
          <ul>
            {piece.techniquesUsed.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        {playing && (
          <div className="eq-bars" aria-hidden>
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
