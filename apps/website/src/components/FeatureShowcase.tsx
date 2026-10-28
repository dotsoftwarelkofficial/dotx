type Feature = {
  badge: 'shipped' | 'preview' | 'planned';
  badgeLabel: string;
  title: string;
  desc: string;
  bullets: string[];
  img: string;
  imgAlt: string;
};

const base = import.meta.env.BASE_URL;

const FEATURES: Feature[] = [
  {
    badge: 'shipped',
    badgeLabel: 'Shipped in preview',
    title: 'Workspaces that actually work',
    desc: 'Group tabs by project, client or mood — each workspace keeps its own tabs, history and layout. Switch with ⌘+1…9, not with extra windows.',
    bullets: ['Native vertical tabs with drag, pin, mute and duplicate', 'Workspace memory — restore exactly where you left off', 'Keyboard-first: all tab actions from the palette'],
    img: `${base}images/feature-workspaces.png`,
    imgAlt: 'Workspaces illustration showing Work, Personal, Research pills and tab list',
  },
  {
    badge: 'preview',
    badgeLabel: 'In active development',
    title: 'A command palette worth opening',
    desc: 'Every action — new tab, search, history, workspace — from one place. Fuzzy, fast and learned quickly. The address bar becomes a companion, not a billboard.',
    bullets: ['⌘K to open from anywhere, with command + search unified', 'Recent files, closed tabs, workspace switcher built-in', 'Typed commands: “mute tab”, “new workspace”, “pin”'],
    img: `${base}images/feature-palette.png`,
    imgAlt: 'Command palette floating modal illustration',
  },
  {
    badge: 'preview',
    badgeLabel: 'In active development',
    title: 'Reading, without the clutter',
    desc: 'A built-in reader strips ads, pop-ups and newsletter walls, keeps the original typography, and lets you highlight as you go. Your highlights stay on device.',
    bullets: ['One-click Reader with dark, sepia and light modes', 'Highlights + copy with source citation', 'No reader-account, no sync — fully local'],
    img: `${base}images/feature-reader.png`,
    imgAlt: 'Reader mode illustration with highlighted text line',
  },
  {
    badge: 'planned',
    badgeLabel: 'On the roadmap',
    title: 'A browser that learns your tabs',
    desc: 'Tab hibernation, smart archiving and a gentle nudge when you’ve had 40 tabs open for a week. Automation that helps — never surprises.',
    bullets: ['Auto-hibernate background tabs to reclaim memory', 'Archive stale tabs to a searchable shelf — one click to restore', 'No AI assistant until privacy story is proven; no hype'],
    img: `${base}images/feature-hibernation.png`,
    imgAlt: 'Memory saved dashboard showing 42% reduction and hibernated tabs',
  },
];

export default function FeatureShowcase() {
  return (
    <section id="features" className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything you need. Nothing you don&apos;t.</h2>
          <p className="section-desc">DOTX ships only what earns its place. Below: what&apos;s in today&apos;s preview, what&apos;s in active development, and what&apos;s genuinely planned — no vaporware.</p>
        </div>
        <div>
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`feature-row ${i % 2 === 1 ? 'reverse' : ''}`}>
              <div className="feature-visual" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                <img src={f.img} alt={f.imgAlt} loading="lazy" style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '4/3', objectFit: 'cover' }} />
              </div>
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
