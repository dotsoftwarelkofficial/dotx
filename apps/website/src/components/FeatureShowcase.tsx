type Feature = {
  badge: 'shipped' | 'preview' | 'planned';
  badgeLabel: string;
  title: string;
  desc: string;
  bullets: string[];
  visual: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    badge: 'shipped',
    badgeLabel: 'Shipped in preview',
    title: 'Workspaces that actually work',
    desc: 'Group tabs by project, client or mood — each workspace keeps its own tabs, history and layout. Switch with ⌘+1…9, not with extra windows.',
    bullets: ['Native vertical tabs with drag, pin, mute and duplicate', 'Workspace memory — restore exactly where you left off', 'Keyboard-first: all tab actions from the palette'],
    visual: (
      <div style={{ padding: 20, display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ background: 'var(--violet)', color: 'white', padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>Work</span>
          <span style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 999, fontSize: 12 }}>Personal</span>
          <span style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 999, fontSize: 12 }}>Research</span>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {[
            { t: 'Linear — Issues', u: 'linear.app', active: true },
            { t: 'GitHub • dotx', u: 'github.com/dotsoftware…', active: false },
            { t: 'Figma — DOTX brand', u: 'figma.com', active: false },
          ].map((row) => (
            <div key={row.t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: row.active ? 'var(--bg)' : 'var(--bg-elevated)', border: `1px solid ${row.active ? 'var(--border-strong)' : 'var(--border)'}` }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: row.active ? 'var(--violet)' : 'var(--text-tertiary)' }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{row.t}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{row.u}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    badge: 'preview',
    badgeLabel: 'In active development',
    title: 'A command palette worth opening',
    desc: 'Every action — new tab, search, history, workspace — from one place. Fuzzy, fast and learned quickly. The address bar becomes a companion, not a billboard.',
    bullets: ['⌘K to open from anywhere, with command + search unified', 'Recent files, closed tabs, workspace switcher built-in', 'Typed commands: “mute tab”, “new workspace”, “pin”'],
    visual: (
      <div style={{ padding: 24 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>⌘</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Search tabs, actions, history…</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--font-mono)', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 6 }}>ESC</span>
          </div>
          <div style={{ padding: 8, display: 'grid', gap: 4 }}>
            {[
              { k: '⌘ T', label: 'New tab', active: true },
              { k: '⌘ ⇧ T', label: 'Reopen closed tab' },
              { k: '⌘ 1', label: 'Switch to Work workspace' },
              { k: '⌘ K C', label: 'Clear browsing data' },
            ].map((r) => (
              <div key={r.label} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 8, background: r.active ? 'var(--violet-soft)' : 'transparent', border: `1px solid ${r.active ? 'var(--violet-border)' : 'transparent'}` }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 6 }}>{r.k}</span>
                <span style={{ fontSize: 13 }}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    badge: 'preview',
    badgeLabel: 'In active development',
    title: 'Reading, without the clutter',
    desc: 'A built-in reader strips ads, pop-ups and newsletter walls, keeps the original typography, and lets you highlight as you go. Your highlights stay on device.',
    bullets: ['One-click Reader with dark, sepia and light modes', 'Highlights + copy with source citation', 'No reader-account, no sync — fully local'],
    visual: (
      <div style={{ padding: 20, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ width: 32, height: 8, borderRadius: 999, background: 'var(--text-primary)' }} />
          <span style={{ width: 48, height: 8, borderRadius: 999, background: 'var(--border-strong)' }} />
          <span style={{ width: 24, height: 8, borderRadius: 999, background: 'var(--border-strong)' }} />
        </div>
        <div style={{ height: 1, background: 'var(--border)' }} />
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ height: 10, borderRadius: 999, background: 'var(--bg-elevated)', width: '90%' }} />
          <div style={{ height: 10, borderRadius: 999, background: 'var(--bg-elevated)', width: '100%' }} />
          <div style={{ height: 10, borderRadius: 999, background: 'var(--violet-soft)', width: '92%', border: '1px solid var(--violet-border)' }} />
          <div style={{ height: 10, borderRadius: 999, background: 'var(--bg-elevated)', width: '88%' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 10, background: 'var(--violet-soft)', color: 'var(--violet)', padding: '4px 8px', borderRadius: 999, border: '1px solid var(--violet-border)' }}>Highlight</span>
          <span style={{ fontSize: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: 999 }}>Aa</span>
          <span style={{ fontSize: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: 999 }}>◐ Theme</span>
        </div>
      </div>
    ),
  },
  {
    badge: 'planned',
    badgeLabel: 'On the roadmap',
    title: 'A browser that learns your tabs',
    desc: 'Tab hibernation, smart archiving and a gentle nudge when you’ve had 40 tabs open for a week. Automation that helps — never surprises.',
    bullets: ['Auto-hibernate background tabs to reclaim memory', 'Archive stale tabs to a searchable shelf — one click to restore', 'No AI assistant until privacy story is proven; no hype'],
    visual: (
      <div style={{ padding: 20 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Memory saved</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#10B981', fontWeight: 600 }}>~42% ↓</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
            <div style={{ width: '42%', height: '100%', background: 'linear-gradient(90deg, var(--violet), var(--blue))' }} />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <span>12 tabs hibernated</span><span style={{ color: 'var(--text-tertiary)' }}>2h ago</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <span>Archived: Q3 research</span><span style={{ color: 'var(--text-tertiary)' }}>— 24 tabs</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function FeatureShowcase() {
  return (
    <section id="features" className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything you need. Nothing you don&apos;t.</h2>
          <p className="section-desc">
            DOTX ships only what earns its place. Below: what&apos;s in today&apos;s preview, what&apos;s in active development, and what&apos;s genuinely planned — no vaporware.
          </p>
        </div>

        <div>
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`feature-row ${i % 2 === 1 ? 'reverse' : ''}`}>
              <div className="feature-visual">{f.visual}</div>
              <div className="feature-copy">
                <div className={`feature-badge ${f.badge}`}>{f.badgeLabel}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <ul className="feature-list">
                  {f.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
