import type { CSSProperties } from "react";
import type { Composer } from "../data/composers";

interface Props {
  composer: Composer | null;
}

export function StylePanel({ composer }: Props) {
  if (!composer) {
    return (
      <aside className="style-panel empty">
        <h2 className="section-label">Style classroom</h2>
        <p className="muted">
          Select a composer to learn what makes their language distinct — then hear a
          new piece built from those rules.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="style-panel"
      style={
        {
          "--accent": composer.accent,
          "--accent-soft": composer.accentSoft,
        } as CSSProperties
      }
    >
      <h2 className="section-label">Why {composer.name} sounds different</h2>
      <p className="style-summary">{composer.styleDiff.summary}</p>

      <h3 className="subhead">Hallmarks</h3>
      <ul className="hallmarks">
        {composer.styleDiff.hallmarks.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      <h3 className="subhead">Compared with the others</h3>
      <p className="vs-others">{composer.styleDiff.vsOthers}</p>

      <h3 className="subhead">Listen for</h3>
      <ul className="listen-for">
        {composer.styleDiff.listenFor.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>

      <div className="bible-footer">
        <span>{composer.instruments}</span>
        <span>{composer.bible.texture}</span>
      </div>
    </aside>
  );
}
