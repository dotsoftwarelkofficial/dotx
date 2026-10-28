export function Security() {
  return (
    <>
      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="section-label">Security</div>
          <h1 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', marginTop: 12 }}>Secure by architecture — not by slogan.</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.7, fontSize: 15 }}>
            DOTX isolates the privileged UI from untrusted web content and exposes only narrow, validated IPC. Everything below is what the current codebase does — auditable in{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>apps/desktop/src-tauri</code>.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg-elevated)', paddingTop: 24 }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-tertiary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk</th>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>DOTX approach (verifiable)</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--text-primary)', fontWeight: 600 }}>XSS / page → app escape</td>
                  <td style={{ padding: '12px 20px' }}>Privileged UI isolated from WebView content; narrow Tauri IPC with validated args; no FS/shell exposed to pages; CSP in <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>tauri.conf.json</code>.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--text-primary)', fontWeight: 600 }}>Dangerous URLs</td>
                  <td style={{ padding: '12px 20px' }}>Strict URL parsing, scheme allow-list (http/https only), <code>safeUrl()</code> in shared, external protocol confirmation.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--text-primary)', fontWeight: 600 }}>Path traversal</td>
                  <td style={{ padding: '12px 20px' }}>Download destination validation, sanitized filenames, no overwrite of arbitrary paths.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--text-primary)', fontWeight: 600 }}>TLS</td>
                  <td style={{ padding: '12px 20px' }}>Certificate errors surfaced safely; never silent-disable validation.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--text-primary)', fontWeight: 600 }}>Permissions</td>
                  <td style={{ padding: '12px 20px' }}>Camera/mic/location/notifications require consent in <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>tauri.conf.json</code> + runtime prompt; sensible defaults.</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', color: 'var(--text-primary)', fontWeight: 600 }}>Secrets</td>
                  <td style={{ padding: '12px 20px' }}>No API keys or signing keys committed; <code>.env.example</code> only. CI uses least-privilege <code>GITHUB_TOKEN</code>.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="privacy-card">
              <h4>Passwords & autofill</h4>
              <p>DOTX does not ship a plaintext vault. Credential saving, when offered, uses the OS keychain, requires interaction and is origin-locked. Until then we ship an honest “coming soon”.</p>
            </div>
            <div className="privacy-card" style={{ background: 'var(--bg-card)' }}>
              <h4>Report a vulnerability</h4>
              <p>
                See <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>SECURITY.md</code> in the repo. For sensitive reports, open a private GitHub Security Advisory. Please avoid public disclosure before a fix.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Honesty note:</strong> We do not claim a completed external audit. The table above reflects the checked-in configuration — you can verify it by reading the Tauri config and Rust sources directly.
          </div>
        </div>
      </section>
    </>
  );
}
