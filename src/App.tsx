import { useCallback, useState } from "react";
import { COMPOSERS, getComposer, type ComposerId } from "./data/composers";
import { ComposerCard } from "./components/ComposerCard";
import { StylePanel } from "./components/StylePanel";
import { Player } from "./components/Player";
import { EraTimeline } from "./components/EraTimeline";
import { generateAndPlay, stopMusic } from "./music/engine";
import type { GeneratedPiece } from "./music/types";
import "./App.css";

export default function App() {
  const [selectedId, setSelectedId] = useState<ComposerId | null>(null);
  const [generatingId, setGeneratingId] = useState<ComposerId | null>(null);
  const [piece, setPiece] = useState<GeneratedPiece | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedPiece[]>([]);

  const selected = selectedId ? getComposer(selectedId) : null;
  const pieceComposer = piece ? getComposer(piece.composerId) : null;

  const compose = useCallback(async (id: ComposerId) => {
    setError(null);
    setSelectedId(id);
    setGeneratingId(id);
    setStatus("Preparing the hall…");
    try {
      stopMusic();
      const meta = await generateAndPlay(id, undefined, (msg) => setStatus(msg));
      setStatus(null);
      setPiece(meta);
      setPlaying(true);
      setHistory((h) => [meta, ...h].slice(0, 8));
      const pieceId = meta.id;
      window.setTimeout(() => {
        setPiece((current) => {
          if (current?.id === pieceId) setPlaying(false);
          return current;
        });
      }, meta.durationSeconds * 1000 + 2000);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? e.message
          : "Could not start audio. Click again after interacting with the page.",
      );
      setPlaying(false);
      setStatus(null);
    } finally {
      setGeneratingId(null);
    }
  }, []);

  const handleStop = () => {
    stopMusic();
    setPlaying(false);
  };

  const handleReplay = async () => {
    if (!piece) return;
    // Re-generate same composer for a true replay of style (new seed for variety on "compose another")
    // For play again, re-run engine with new audio from same composer
    await compose(piece.composerId);
  };

  return (
    <div className="app">
      <div className="vignette" aria-hidden />
      <div className="stage-lights" aria-hidden />

      <header className="hero">
        <p className="eyebrow">Concert hall · generative studio</p>
        <h1>Composer Muse</h1>
        <p className="lede">
          Click a composer. Hear something <em>new</em> — built from their era’s
          rules, not a copy of a famous work. Each style has its own musical engine.
        </p>
      </header>

      <EraTimeline />

      <section className="gallery" aria-label="Composers">
        <h2 className="section-label">The program</h2>
        <div className="gallery-grid">
          {COMPOSERS.map((c) => (
            <ComposerCard
              key={c.id}
              composer={c}
              selected={selectedId === c.id}
              generating={generatingId === c.id}
              onSelect={() => void compose(c.id)}
            />
          ))}
        </div>
      </section>

      {status && (
        <p className="status-banner" role="status">
          {status}
        </p>
      )}
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}

      <div className="main-split">
        <Player
          piece={piece}
          composer={pieceComposer}
          playing={playing}
          onReplay={() => void handleReplay()}
          onReroll={() => piece && void compose(piece.composerId)}
          onStop={handleStop}
        />
        <StylePanel composer={selected} />
      </div>

      {history.length > 1 && (
        <section className="history">
          <h2 className="section-label">This evening’s sketches</h2>
          <ul>
            {history.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  className="history-item"
                  onClick={() => void compose(h.composerId)}
                >
                  <span className="h-title">{h.title}</span>
                  <span className="h-meta">
                    {getComposer(h.composerId).name} · {h.form}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="footer">
        <p>
          Original generative music <strong>inspired by</strong> historical styles —
          not reconstructions of specific works. Educational notes describe era and
          technique differences.
        </p>
      </footer>
    </div>
  );
}
