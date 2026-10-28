export function Security() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <span className="badge">Security</span>
        <h2 style={{ marginTop: 10 }}>Secure <span>by architecture</span></h2>
        <p className="lead">The UI that controls your computer is never the same surface that renders the web.</p>

        <div className="table-wrap" style={{ marginTop: 20 }}>
          <table>
            <thead><tr><th>Risk</th><th>DOTX approach</th></tr></thead>
            <tbody>
              <tr><td>XSS / page → app escape</td><td>Privileged UI isolated from untrusted content; narrow Tauri IPC with validated args; no FS/shell exposed to pages</td></tr>
              <tr><td>Open redirects / dangerous URLs</td><td>Strict URL parsing, scheme allow-list (http/https only), external protocol confirmation</td></tr>
              <tr><td>Path traversal (downloads)</td><td>Destination validation, sanitized filenames, no overwrite of arbitrary paths</td></tr>
              <tr><td>TLS</td><td>Certificate errors surfaced safely; never silent disable of validation</td></tr>
              <tr><td>Permissions</td><td>Camera/mic/location/notifications require user consent; sensible defaults</td></tr>
              <tr><td>Secrets</td><td>No API keys or signing keys committed; .env.example only</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Passwords & autofill</h3>
          <p className="muted">DOTX does not ship a plaintext password vault. If credential saving is offered, it uses an OS-backed store, requires user interaction, and is origin-locked. Until then we show a clear “coming soon” rather than faking it.</p>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Report a vulnerability</h3>
          <p className="muted">See <code>SECURITY.md</code> in the repository. For sensitive reports, open a private GitHub Security Advisory or contact the maintainers listed there. Please avoid public disclosure before a fix is available.</p>
        </div>
      </div>
    </section>
  );
}
