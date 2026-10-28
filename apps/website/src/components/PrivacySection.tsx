export default function PrivacySection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-label">Privacy & Security</div>
          <h2 className="section-title">Your data stays yours. Auditable by you.</h2>
          <p className="section-desc">
            DOTX is built on Tauri with a locked-down WebView, strict CSP and least-privilege IPC. We chose this stack so you don&apos;t have to trust a black box.
          </p>
        </div>

        <div className="privacy-grid">
          <div className="privacy-card">
            <h4>🔒 No telemetry, no catch</h4>
            <p>
              DOTX ships with no analytics, no crash reporter calling home, and no hidden “anonymous usage” switch. If we ever add optional diagnostics, it will be opt-in and documented.
            </p>
          </div>
          <div className="privacy-card">
            <h4>🛡️ Tauri + hardened WebView</h4>
            <p>
              Capabilities in <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>capabilities/main.json</code> grant only what the UI needs. Inline scripts blocked via CSP. Updates checked from the desktop app — not via ad networks.
            </p>
          </div>
          <div className="privacy-card">
            <h4>💾 Local-first storage</h4>
            <p>
              History, bookmarks and settings live on your device. Passwords delegate to the OS keychain when available. No account required to use DOTX day-to-day.
            </p>
          </div>
          <div className="privacy-card">
            <h4>📄 Privacy as a living doc</h4>
            <p>
              Our full privacy disclosure lives at <a href={`${import.meta.env.BASE_URL}privacy`} style={{ color: 'var(--violet)', textDecoration: 'underline' }}>/privacy</a>. Every change is versioned — we&apos;ll call out diffs in the changelog, not bury them.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          <span style={{ fontSize: 14 }} aria-hidden>
            ⚠️
          </span>
          <span>
            <strong style={{ color: 'var(--text-primary)' }}>Honesty check:</strong> DOTX is a preview. We do not claim third-party security audits, app-store listings, or an established review base yet. Privacy promises above reflect the current codebase
            (Tauri conf, Capabilities, CSP) — not a legal guarantee. We&apos;ll publish an audit when one exists.
          </span>
        </div>
      </div>
    </section>
  );
}
