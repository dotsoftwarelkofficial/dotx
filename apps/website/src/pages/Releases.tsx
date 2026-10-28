export function Releases() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <span className="badge">Release Notes</span>
        <h2 style={{ marginTop: 10 }}>Changelog</h2>
        <p className="lead">Versioned releases live on GitHub Releases with installers and SHA-256 checksums. Until the first public release, this page tracks the preview plan.</p>

        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span className="badge">v0.1.0-preview</span>
            <span className="muted small">Not yet published · Target: initial preview</span>
          </div>
          <h3 style={{ marginTop: 10 }}>Planned — Website + Browser MVP</h3>
          <ul className="muted" style={{ paddingLeft: 18 }}>
            <li>GitHub Pages website with Vite base-path support, 404 fallback, sitemap & robots</li>
            <li>Desktop shell: Tauri 2 + React + Rust, custom titlebar, window controls</li>
            <li>Real navigation + tabs with isolated content surface</li>
            <li>Bookmarks, history, settings persistence, download manager</li>
            <li>CI + Windows installer workflow</li>
          </ul>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <h3>v0.2.0 — Planned</h3>
          <p className="muted">Private browsing (isolated), find-in-page, zoom, import/export polish, content-blocking evaluation.</p>
        </div>

        <div className="alert" style={{ marginTop: 16 }}>
          <strong>No binaries until CI verifies them.</strong> We never link to fabricated downloads. When a release is published, checksums and release notes will be attached on GitHub.
        </div>
      </div>
    </section>
  );
}
