const FAQS = [
  {
    q: 'Is DOTX a real browser I can use today?',
    a: 'Yes — as a preview. You can browse, manage tabs and workspaces, and use the command palette. Some features (reader, smart archiving) are still in active development. We label every feature as Shipped / Preview / Planned so you know exactly what you’re getting.',
  },
  {
    q: 'What engine does DOTX use? Will my extensions work?',
    a: 'DOTX uses the system WebView (Edge WebView2 on Windows) via Tauri — the same engine behind many native apps. Chromium extension support is on the longer-term roadmap but is not in the current preview. Password managers that support the OS keychain already work.',
  },
  {
    q: 'Is DOTX free? What’s the business model?',
    a: 'DOTX is free while in preview. We plan a sustainable model — likely a paid Pro for teams with priority support — but core browsing will remain free. We won’t fund DOTX with ads or data. See /about for principles and the open roadmap.',
  },
  {
    q: 'What data does DOTX collect?',
    a: 'None by default. No analytics, no account required, storage is local. See /privacy for the current disclosure. If optional diagnostics are ever added, they will be opt-in with a clear setting — not a hidden toggle.',
  },
  {
    q: 'What are the system requirements?',
    a: 'Windows 10 1809+ or Windows 11, x64, with Edge WebView2 runtime (preinstalled on most Windows 11 PCs; installer will prompt on older systems). Download links on /download include MSI and setup EXE once a release is published.',
  },
  {
    q: 'How do I install and verify the download?',
    a: 'Go to /download for the latest release, SHA-256 checksums (when a release is published), and verification instructions. For now, no stable release is published — the download page shows Preview status and honest fallback copy.',
  },
  {
    q: 'Where does DOTX come from? Who builds it?',
    a: 'DOTX is built by DOT Software — a small team focused on calm, private software for Windows. Learn more at /about.',
  },
];

export default function FAQ() {
  return (
    <section className="section" style={{ background: 'var(--bg-elevated)' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Answers, not marketing.</h2>
          <p className="section-desc">Everything below is truthful about the current preview — we’d rather under-promise than publish fiction.</p>
        </div>

        <div className="faq-list">
          {FAQS.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <a href={`${import.meta.env.BASE_URL}faq`} style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'underline' }}>
            Full FAQ →
          </a>
        </div>
      </div>
    </section>
  );
}
