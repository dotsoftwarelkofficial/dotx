export function Changelog() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 860 }}>
        <div className="section-label">Changelog</div>
        <h1 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', marginTop: 12 }}>Releases live on GitHub</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>
          Every DOTX version is a GitHub Release with installers and SHA-256 checksums. This page mirrors what’s verifiable — nothing fabricated.
        </p>

        {/* v0.1.0 */}
        <div style={{ marginTop: 32, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--violet-soft)', color: 'var(--violet)', border: '1px solid var(--violet-border)', padding: '4px 10px', borderRadius: 999, fontWeight: 600 }}>v0.1.0</span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Preview • Oct 28, 2026</span>
              </div>
              <h3 style={{ margin: '10px 0 0', fontSize: 18 }}>Foundation: Tauri hardened + CI green</h3>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
              draft prerelease on GitHub
            </span>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
              <li><strong style={{ color: 'var(--text-primary)' }}>Desktop hardened:</strong> CSP enforced, least-privilege Tauri capabilities (<code>capabilities/main.json</code>), icons fixed (icon.ico 6 sizes + icon.icns), bundle verified.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>CI proven:</strong> Windows runner builds MSI <span style={{ fontFamily: 'var(--font-mono)' }}>2928640 bytes</span> SHA-256 <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>21AB6F59...</span> and NSIS EXE <span style={{ fontFamily: 'var(--font-mono)' }}>1949298 bytes</span> SHA-256 <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>E1DD8415...</span></li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Website preserved:</strong> Deploy Pages intact on <code>https://dotsoftwarelkofficial.github.io/dotx/</code> with base <code>/dotx/</code>.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Premium site redesign:</strong> Linear-grade refresh now live (dark-first, fluid typography, verified Downloads).</li>
            </ul>
            <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="https://github.com/dotsoftwarelkofficial/dotx/releases" target="_blank" rel="noreferrer" className="btn btn-secondary">View on GitHub →</a>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)', alignSelf: 'center' }}>Artifacts attached to workflow run 40639918198 — draft release pending publish</span>
            </div>
          </div>
        </div>

        {/* Planned */}
        <div style={{ marginTop: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Roadmap</div>
          <h3 style={{ marginTop: 12, fontSize: 16 }}>Up next — v0.2.0 preview</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6, lineHeight: 1.6 }}>
            Vertical tabs polish, reader mode, workspace persistence improvements, and extension bridge evaluation. We’ll only add to this list when implementation lands.
          </p>
        </div>

        <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Verification:</strong> Do not trust download links that aren’t on <span style={{ fontFamily: 'var(--font-mono)' }}>github.com/dotsoftwarelkofficial/dotx/releases</span>. This site fetches the live release list via the GitHub API — if no release exists, it truthfully shows “no installer yet.”
        </div>
      </div>
    </section>
  );
}
