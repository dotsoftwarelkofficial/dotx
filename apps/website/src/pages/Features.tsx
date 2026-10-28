import { Link } from 'react-router-dom';
import { FEATURES } from '@dotx/shared';

export function Features() {
  return (
    <>
      <section className="hero" style={{ padding: '64px 0 40px', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 720 }}>
          <div className="section-label">Features</div>
          <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', marginTop: 12 }}>A premium browser that stays out of your way.</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.6, marginTop: 12 }}>
            Six areas we care about deeply. Each one ships with real behavior, honest limits and a clear label: <strong style={{ color: '#10B981' }}>Shipped</strong> • <strong style={{ color: 'var(--violet)' }}>Preview</strong> • <strong style={{ color: '#F59E0B' }}>Planned</strong>.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 32 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="privacy-card" style={{ textAlign: 'left' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', fontSize: 14, marginBottom: 12 }}>◈</div>
                <h3 style={{ fontSize: 15, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                <div style={{ marginTop: 10, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: 6, display: 'inline-flex' }}>
                  {f.icon} • Shipped in preview shell
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <h3 style={{ fontSize: 15 }}>Capability matrix — what DOTX does today vs. what we won’t fake</h3>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--border)' }}>Preview v0.1.0</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-tertiary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Area</th>
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current behavior</th>
                    <th style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Honest limit</th>
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {[
                    ['Tabs', 'Independent WebView2 surfaces, drag-reorder, pin, restore, keyboard shortcuts', 'Memory cap for background tabs; full API still expanding'],
                    ['Navigation', 'URL validation, IDN safety, back/forward/reload, zoom, find', 'Blocked: javascript:, data:, file: — never render in privileged UI'],
                    ['Workspaces', 'Per-workspace tab sets,  ⌘+1…9 switching, restore on launch', 'Sync planned, local-only today'],
                    ['Bookmarks', 'Toolbar + folders + search + HTML import/export with duplicate recovery', 'Tagging and sync planned'],
                    ['History', 'Search + clear by range + retention control', 'Private windows not recorded; no cloud history'],
                    ['Downloads', 'Progress + open + reveal in folder + path-traversal protection', 'Pause/resume only where engine permits'],
                    ['Privacy', 'No telemetry, private window isolation, permission prompts', 'No VPN / fingerprint fantasy — ISP/DNS still outside scope'],
                  ].map(([a, b, c]) => (
                    <tr key={a} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{a}</td>
                      <td style={{ padding: '12px 20px' }}>{b}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-tertiary)' }}>{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/download" className="btn btn-primary">Download preview →</Link>
            <Link to="/about" className="btn btn-secondary">How we think about product</Link>
          </div>
        </div>
      </section>
    </>
  );
}
