import { useState } from 'react';

const PANELS = [
  {
    id: 'tabs',
    label: 'Tab management →',
    title: 'Tabs, elevated',
    text: 'Vertical tabs with grouping, pinning, hibernation, and search. DOTX treats tabs as a workspace — not a junk drawer.',
    points: ['Multi-select + bulk close/pin/move', 'Search tabs by title/URL across all workspaces', 'Recently closed recovery, always available'],
  },
  {
    id: 'address',
    label: 'Address bar →',
    title: 'Your companion, not a billboard',
    text: 'The address bar merges navigation, search and commands. No sponsored suggestions. Type “>” for commands, “@” for history.',
    points: ['No ads, no sponsored shortcuts — ever', 'Search engine of your choice, switch in one click', 'Inline history + tab preview while you type'],
  },
  {
    id: 'privacy',
    label: 'Security →',
    title: 'Respectful by default',
    text: 'Built on Tauri with a locked-down WebView. DOTX runs with least-privilege capabilities and a strict CSP.',
    points: ['No remote telemetry, no forced account', 'Local-only storage (history, passwords via OS keychain)', 'HTTPS enforcement + clear permissions UI'],
  },
];

export default function ProductDetails() {
  const [active, setActive] = useState('tabs');
  const panel = PANELS.find((p) => p.id === active) ?? PANELS[0];

  return (
    <section className="section" style={{ background: 'var(--bg-elevated)' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: 24 }}>
          <div className="section-label">Product details</div>
          <h2 className="section-title">The details that make flow possible</h2>
        </div>

        <div className="details-tabs">
          {PANELS.map((p) => (
            <button
              key={p.id}
              className={`details-tab ${active === p.id ? 'active' : ''}`}
              onClick={() => setActive(p.id)}
              aria-selected={active === p.id}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="details-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 0, minHeight: 320 }}>
          <div style={{ padding: 32, borderRight: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>{panel.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>{panel.text}</p>
            <ul className="feature-list">
              {panel.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </div>
          <div style={{ padding: 20, background: 'var(--bg)', display: 'grid', placeItems: 'center' }}>
            {/* Visual per panel */}
            {active === 'tabs' && (
              <div style={{ width: '100%', maxWidth: 360, display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                  <span style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '6px 10px', borderRadius: 8 }}>⇧⌘T — Reopen</span>
                  <span style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '6px 10px', borderRadius: 8 }}>⌘⇧D — Bookmark all</span>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'grid', gap: 6 }}>
                  {['Design system — Linear', 'Tabs API • MDN', 'DOTX Roadmap'].map((t, idx) => (
                    <div key={t} style={{ display: 'flex', gap: 10, padding: '8px 10px', borderRadius: 8, background: idx === 0 ? 'var(--bg-elevated)' : 'transparent', border: `1px solid ${idx === 0 ? 'var(--border-strong)' : 'transparent'}` }}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: idx === 0 ? 'var(--violet)' : 'var(--bg-subtle)', marginTop: 6 }} />
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {active === 'address' && (
              <div style={{ width: '100%', maxWidth: 420 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: 8, padding: '12px 14px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--violet)' }}>›</span>
                    <span>linear workspace</span>
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 6 }}>↵ to open</span>
                  </div>
                  <div style={{ padding: 10, display: 'grid', gap: 4, fontSize: 13 }}>
                    <div style={{ padding: '8px 10px', background: 'var(--violet-soft)', borderRadius: 8, border: '1px solid var(--violet-border)' }}>Open workspace “Linear”</div>
                    <div style={{ padding: '8px 10px' }}>Search history for “linear”</div>
                  </div>
                </div>
              </div>
            )}
            {active === 'privacy' && (
              <div style={{ width: '100%', maxWidth: 360, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: '#10B981' }} />Shield — Strict
                </div>
                <div style={{ height: 1, background: 'var(--border)' }} />
                <div style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tracking blocked</span><span style={{ color: '#10B981' }}>on</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Telemetry</span><span style={{ color: '#10B981' }}>never</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Storage</span><span style={{ color: 'var(--text-primary)' }}>local only</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
