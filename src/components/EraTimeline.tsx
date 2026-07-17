import { ERA_TIMELINE } from "../data/composers";

export function EraTimeline() {
  return (
    <section className="era-timeline" aria-label="Musical eras">
      <h2 className="section-label">How eras differ</h2>
      <p className="section-hint">
        Style is not just “classical.” Bach and Vivaldi share the Baroque era but
        write differently; Mozart’s Classical clarity is not Chopin’s Romantic
        intimacy. Each card uses a <strong>dedicated style engine</strong> — not one
        generic generator with a name tag.
      </p>
      <div className="era-row">
        {ERA_TIMELINE.map((e) => (
          <article key={e.era} className="era-card">
            <div className="era-years">{e.years}</div>
            <h3>{e.era}</h3>
            <p className="era-composers">{e.composers}</p>
            <p className="era-idea">{e.idea}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
