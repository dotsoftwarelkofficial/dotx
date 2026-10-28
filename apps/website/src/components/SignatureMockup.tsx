export default function SignatureMockup() {
  return (
    <div className="browser-frame" role="img" aria-label="DOTX browser interface preview showing tabs, address bar and content">
      {/* Window chrome */}
      <div className="browser-bar">
        <div className="browser-dots" aria-hidden>
          <span className="browser-dot r" />
          <span className="browser-dot y" />
          <span className="browser-dot g" />
        </div>
        <div className="browser-tabs">
          <div className="browser-tab active">
            <span style={{ width: 14, height: 14, background: 'linear-gradient(135deg,#6D5DF7,#3B82F6)', borderRadius: 4, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>DOTX — The calm browser</span>
            <span style={{ marginLeft: 'auto', opacity: 0.5 }}>×</span>
          </div>
          <div className="browser-tab" style={{ opacity: 0.7 }}>
            <span style={{ width: 12, height: 12, background: 'var(--bg-subtle)', borderRadius: 3, flexShrink: 0 }} />
            <span>linear.app</span>
          </div>
          <div className="browser-tab" style={{ opacity: 0.5, display: 'flex' }}>
            <span>github.com/dotx</span>
          </div>
          <div className="browser-tab" style={{ opacity: 0.35, minWidth: 36, justifyContent: 'center' }}>＋</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-tertiary)', fontSize: 16 }} aria-hidden>
          <span>—</span><span>□</span><span>×</span>
        </div>
      </div>

      <div className="browser-toolbar">
        <button className="toolbar-btn" aria-label="Back" disabled>‹</button>
        <button className="toolbar-btn" aria-label="Forward" disabled>›</button>
        <button className="toolbar-btn" aria-label="Reload">↻</button>
        <div className="address-bar">
          <span aria-hidden style={{ color: '#10B981' }}>🔒</span>
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>dotx.app</span>
          <span style={{ opacity: 0.5 }}>/workspace</span>
          <span>⌘K</span>
        </div>
        <button className="toolbar-btn" aria-label="Extensions">◫</button>
        <button className="toolbar-btn" aria-label="Profile" style={{ background: 'var(--violet-soft)', borderColor: 'var(--violet-border)', color: 'var(--violet)', borderWidth: 1, borderStyle: 'solid' }}>●</button>
      </div>

      <div className="browser-content">
        {/* Subtle gradient glow behind */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(600px 280px at 30% 10%, rgba(109,93,247,0.10), transparent 60%), radial-gradient(500px 240px at 80% 90%, rgba(59,130,246,0.06), transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div className="browser-content-grid" style={{ position: 'relative' }}>
          {/* Left — featured card */}
          <div
            className="content-card"
            style={{
              gridRow: 'span 2',
              background:
                'linear-gradient(180deg, var(--bg-card) 0%, color-mix(in srgb, var(--violet-soft) 40%, var(--bg-card)) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--violet), var(--blue))',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'white',
                  fontSize: 16,
                  marginBottom: 12,
                }}
              >
                ◈
              </div>
              <h4 style={{ fontSize: 15 }}>A browser that respects your flow</h4>
              <p>Workspaces, vertical tabs and a command palette that stays out of your way.</p>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <span style={{ background: 'var(--text-primary)', color: 'var(--bg)', borderRadius: 999, padding: '6px 12px', fontSize: 11, fontWeight: 600 }}>Try DOTX</span>
              <span style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 12px', fontSize: 11, fontWeight: 500 }}>Learn more</span>
            </div>
          </div>

          {/* Right stack */}
          <div className="content-card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', fontSize: 14 }}>◫</div>
            <div>
              <h4 style={{ margin: 0, fontSize: 13 }}>Workspaces</h4>
              <p style={{ margin: 0, fontSize: 12 }}>Group tabs by project — not by window.</p>
            </div>
          </div>
          <div className="content-card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', fontSize: 14 }}>⌘</div>
            <div>
              <h4 style={{ margin: 0, fontSize: 13 }}>Command palette</h4>
              <p style={{ margin: 0, fontSize: 12 }}>Jump anywhere — tabs, history, actions.</p>
            </div>
          </div>

          <div className="content-card" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px' }}>
            <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: '#10B981', boxShadow: '0 0 8px rgba(16,185,129,0.6)' }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>3 workspaces • 18 tabs • Zero clutter</span>
            </div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>⇧+Ctrl+T to restore</span>
          </div>
        </div>
      </div>

      {/* Sub-caption outside frame? We'll add below */}
    </div>
  );
}
