export default function Philosophy() {
  return (
    <section className="section" style={{ background: 'var(--bg-elevated)' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-label">Philosophy</div>
          <h2 className="section-title">Built on three non-negotiables</h2>
          <p className="section-desc">
            We didn&apos;t set out to make another Chromium skin. DOTX rethinks what a Windows browser should be when it respects your time, attention and privacy from the first pixel.
          </p>
        </div>

        <div className="philosophy-grid">
          <div className="philosophy-card">
            <div className="philosophy-icon" aria-hidden>◐</div>
            <h3>Calm by default</h3>
            <p>
              No banners, no pop-ups, no feed. A quiet toolbar, a command palette that appears only when you call it, and workspaces that hide what you don&apos;t need right now.
            </p>
          </div>
          <div className="philosophy-card">
            <div className="philosophy-icon" aria-hidden>⚡︎</div>
            <h3>Crafted for speed</h3>
            <p>
              Native Tauri shell with a React frontend — no Electron bloat. Fast launch, instant search, and gestures that feel like the OS itself.
            </p>
          </div>
          <div className="philosophy-card">
            <div className="philosophy-icon" aria-hidden>⬢</div>
            <h3>Private by design</h3>
            <p>
              No telemetry toggle hidden three menus deep. DOTX ships with no analytics, no account wall, and clear, auditable storage you control.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
