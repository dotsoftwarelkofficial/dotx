import { Link } from 'react-router-dom';

export function About() {
  return (
    <div>
      <section className="section">
        <div className="container" style={{ maxWidth: 840 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>About</div>
          <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 12 }}>We built the browser we wanted to use.</h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            DOTX started as a question: what would a Windows browser feel like if it respected your focus first — not an advertiser’s dashboard?
            We’re a small team at <strong style={{ color: 'var(--text-primary)' }}>DOT Software</strong> (Lucknow / remote) who got tired of browsers that ship a feed, a crypto wallet and a shopping sidebar before they ship a calm address bar.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <div className="container" style={{ maxWidth: 840 }}>
          <div style={{ display: 'grid', gap: 24 }}>
            <div>
              <h3 style={{ marginBottom: 8 }}>Why Windows deserves its own browser</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 15 }}>
                Most modern browsers are cross-platform skins around the same engine, with the same weight and the same business model. Windows users live in a specific world — Start, Snap, Widgets, Copilot, high-DPI scaling, jump lists, real keyboard shortcuts. DOTX is built natively for that world using Tauri 2 (Rust + WebView2), so it launches fast, respects system conventions, and doesn’t bring Electron’s memory footprint.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="privacy-card">
                <h4 style={{ marginBottom: 8 }}>🎯 What we ship</h4>
                <p>Only features that earn their place: workspaces, vertical tabs, command palette, reader, local-first data. Everything is labeled Shipped / Preview / Planned — no vapor.</p>
              </div>
              <div className="privacy-card">
                <h4 style={{ marginBottom: 8 }}>🚫 What we’ll never ship</h4>
                <p>Ads in the address bar, sponsored shortcuts, hidden telemetry toggles, or a feed you can’t turn off. If a feature hurts focus, it doesn’t belong.</p>
              </div>
            </div>
            <div>
              <h3 style={{ marginBottom: 8 }}>How we build in the open</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 15 }}>
                DOTX is source-available during preview; issues, discussions and the roadmap live on GitHub. Preview builds publish with checksums and are built on Windows runners you can audit via Actions logs. When we have something worth auditing independently, we’ll publish that audit — not a badge we bought.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                <a href="https://github.com/dotsoftwarelkofficial/dotx" target="_blank" rel="noreferrer" className="btn btn-secondary">View GitHub →</a>
                <Link to="/changelog" className="btn btn-ghost">Read the changelog</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 840 }}>
          <div className="privacy-card" style={{ textAlign: 'center', padding: 32 }}>
            <h3 style={{ marginBottom: 8 }}>Contact</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              We’re not hiring right now, but we read every issue and discussion. The fastest way to reach us is GitHub: open an issue for bugs or start a discussion for ideas.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              <a href="https://github.com/dotsoftwarelkofficial/dotx/issues/new" className="btn btn-primary">Open an issue</a>
              <a href="https://github.com/dotsoftwarelkofficial/dotx/discussions" className="btn btn-secondary">Join discussions</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
