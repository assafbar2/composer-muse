import type { CSSProperties } from "react";
import type { Composer } from "../data/composers";

interface Props {
  composer: Composer;
  selected: boolean;
  generating: boolean;
  onSelect: () => void;
}

export function ComposerCard({ composer, selected, generating, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`composer-card ${selected ? "selected" : ""} ${generating ? "generating" : ""}`}
      style={
        {
          "--accent": composer.accent,
          "--accent-soft": composer.accentSoft,
        } as CSSProperties
      }
      onClick={onSelect}
      aria-pressed={selected}
      aria-busy={generating}
    >
      <div className="card-glow" />
      <div className="card-top">
        <span className="era-badge">{composer.era}</span>
        <span className="years">{composer.years}</span>
      </div>
      <h3 className="composer-name">{composer.name}</h3>
      <p className="tagline">{composer.tagline}</p>
      <p className="essence">{composer.essence}</p>
      <div className="card-cta">
        {generating ? (
          <span className="cta-text pulse">Composing…</span>
        ) : (
          <span className="cta-text">
            <span className="note-icon" aria-hidden>
              ♪
            </span>{" "}
            Compose new piece
          </span>
        )}
      </div>
    </button>
  );
}
