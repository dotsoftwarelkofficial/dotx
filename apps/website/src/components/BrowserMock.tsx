export function BrowserMock() {
  return (
    <div className="hero-card" role="img" aria-label="DOTX browser preview">
      <div className="hero-card-top">
        <span className="dot r" /><span className="dot y" /><span className="dot g" />
        <div className="tabs">
          <span className="tab active">◈ New Tab</span>
          <span className="tab">GitHub — DOTX</span>
          <span className="tab">+ </span>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>■ □ ×</span>
      </div>
      <div className="urlbar">
        <span style={{ color: "var(--muted)" }}>🔒</span>
        <input readOnly value="dotx://newtab  —  Search or enter address" aria-label="Address bar" />
        <span className="kbd">Ctrl+K</span>
      </div>
      <div className="hero-preview">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="badge">New</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Good evening — welcome to DOTX</span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>21:42 · Tue 28 Oct</span>
        </div>
        <div className="preview-grid">
          <div className="preview-box">
            <h4>Quick links</h4>
            <p>GitHub · Figma · Gmail · Linear — customizable, local-only</p>
          </div>
          <div className="preview-box">
            <h4>Bookmarks bar</h4>
            <p>Folders, search, import/export — HTML compatible</p>
          </div>
          <div className="preview-box">
            <h4>Privacy</h4>
            <p>No telemetry by default. Private window = isolated session.</p>
          </div>
          <div className="preview-box">
            <h4>Downloads</h4>
            <p>Real progress, safe paths, executable confirmation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
