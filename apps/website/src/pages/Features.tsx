import { FEATURES } from "@dotx/shared";

export function Features() {
  return (
    <section className="section">
      <div className="container">
        <span className="badge">Features</span>
        <h2 style={{ marginTop: 10 }}>Everything you need — <span>nothing you don’t</span></h2>
        <p className="lead">Each feature ships with real behavior, safe storage, and honest limits. No fake progress or decorative toggles.</p>

        <div className="grid-3">
          {FEATURES.map((f) => (
            <div className="card" key={f.title}>
              <div className="icon">◈</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="muted small" style={{ display: "block", marginTop: 10 }}>Availability: Shipped in MVP · Windows</span>
            </div>
          ))}
        </div>

        <div className="table-wrap" style={{ marginTop: 20 }}>
          <table>
            <thead>
              <tr><th>Area</th><th>DOTX behavior</th><th>Honest limit</th></tr>
            </thead>
            <tbody>
              <tr><td><b>Tabs</b></td><td>Independent surfaces, drag reorder, pin, restore, shortcuts</td><td>Memory policy caps background tabs</td></tr>
              <tr><td><b>Navigation</b></td><td>URL validation, IDN handling, back/forward/reload, zoom, find</td><td>Blocked schemes: javascript:, data:, file:</td></tr>
              <tr><td><b>Bookmarks</b></td><td>Toolbar + folders + import/export (HTML)</td><td>Duplicate handling, corrupt import recovery</td></tr>
              <tr><td><b>History</b></td><td>Search, clear by range, retention setting</td><td>Private windows not recorded locally</td></tr>
              <tr><td><b>Downloads</b></td><td>Progress, open, show folder, path validation</td><td>Pause only where engine allows</td></tr>
              <tr><td><b>Privacy</b></td><td>Clear data, permission prompts, private window</td><td>No anonymity claims; network/DNS still visible to ISP</td></tr>
            </tbody>
          </table>
        </div>

        <div className="callout" style={{ marginTop: 16 }}>
          <strong>Design language</strong>
          <p className="muted small">Midnight black · graphite · deep navy · violet + electric cyan accents. Supports dark / light / system, respects reduced-motion, and works at any desktop width.</p>
        </div>
      </div>
    </section>
  );
}
