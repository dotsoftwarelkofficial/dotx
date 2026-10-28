export function Privacy() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <span className="badge">Privacy</span>
        <h2 style={{ marginTop: 10 }}>Privacy that’s <span>honest</span></h2>
        <p className="lead">DOTX keeps your data local by default and tells you exactly what that means.</p>

        <div className="card" style={{ marginTop: 20 }}>
          <h3>What stays on your device</h3>
          <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
            <li>Bookmarks, history, and settings stored in local app storage with schema versioning.</li>
            <li>Private window activity is not written to normal history (explained in-app and here).</li>
            <li>No analytics or telemetry unless you explicitly opt in to a compliant program (disabled by default).</li>
          </ul>
        </div>

        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="card">
            <h3>What we don’t claim</h3>
            <p className="muted">DOTX does not promise perfect anonymity, VPN, or fingerprint invisibility. Network-level records, DNS, and OS artifacts remain outside the browser. We document this instead of overselling.</p>
          </div>
          <div className="card">
            <h3>Controls</h3>
            <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
              <li>Clear history by range or completely</li>
              <li>Retention limit + private session</li>
              <li>Per-site permissions (camera, mic, location, notifications)</li>
              <li>Search engine choice; cookie / site-data controls where engine supports</li>
            </ul>
          </div>
        </div>

        <div className="alert" style={{ marginTop: 16 }}>
          <strong>Telemetry:</strong> off by default. If a future update introduces optional metrics, it will ship behind an explicit consent dialog, a privacy policy update, and a way to disable it.
        </div>
      </div>
    </section>
  );
}
