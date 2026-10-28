export function Privacy() {
  return (
    <>
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="section-label">Privacy</div>
          <h1 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', marginTop: 12 }}>Privacy that’s honest, not hidden.</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.7, fontSize: 15 }}>
            DOTX is a preview built on Tauri with local-first storage. Below is what actually happens with your data today — versioned, auditable, and not buried in legalese. Last updated Oct 28, 2026.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="privacy-card">
              <h4>📦 What stays on your device</h4>
              <p>
                Bookmarks, history, and settings are stored in local app storage (Tauri + WebView localStorage with schema versioning). Private window activity is not written to normal history — the app indicates this both in-UI and here. No sync to DOT Software servers today.
              </p>
            </div>
            <div className="privacy-card">
              <h4>🚫 What we don’t collect</h4>
              <p>
                No analytics, no crash telemetry, no “anonymous usage” by default. The website itself is static on GitHub Pages (see GitHub’s pages privacy). We will not introduce telemetry without an explicit opt-in dialog, a privacy policy diff, and a way to turn it off.
              </p>
            </div>
            <div className="privacy-card">
              <h4>🔐 What we do with system integration</h4>
              <p>
                DOTX uses the system WebView2 engine and OS keychain for password storage when available. Permissions (camera, mic, location, notifications) are gated behind per-site prompts — denied by default. Capabilities in{' '}
                <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>capabilities/main.json</code> grant least privilege; CSP blocks inline scripts.
              </p>
            </div>
            <div className="privacy-card">
              <h4>⚠️ What we don’t claim</h4>
              <p>
                DOTX does not promise anonymity, VPN, or fingerprint invisibility. Your ISP, DNS provider, and OS can still observe network traffic. We document limits instead of selling a fantasy.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 24, padding: 16, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-card)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Controls available today:</strong> Clear history by range or completely; retention limit; private session; per-site permissions; search engine choice; cookie/site-data controls where the engine supports it.
            <div style={{ marginTop: 8 }}>
              Questions? Open an issue at{' '}
              <a href="https://github.com/dotsoftwarelkofficial/dotx/issues" target="_blank" rel="noreferrer" style={{ color: 'var(--violet)', textDecoration: 'underline' }}>
                github.com/dotsoftwarelkofficial/dotx/issues
              </a>{' '}
              or review the desktop source in <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>apps/desktop</code>.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
