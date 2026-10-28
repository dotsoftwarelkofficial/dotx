export function Faq() {
  const items = [
    { q: 'Is DOTX free?', a: 'Yes — DOTX is free while in preview. Core browsing will remain free; we plan a Pro for teams later. We won’t fund it with ads or data. See /about for our model.' },
    { q: 'Why Tauri + WebView2 instead of Electron?', a: 'Smaller bundle, native WebView2 (Chromium) already on Windows, Rust backend for security and performance. Trade-offs are documented in docs/ARCHITECTURE.md.' },
    { q: 'Does it work on Windows 10?', a: 'Yes — Windows 10 1809+ and Windows 11 x64. WebView2 Runtime is required (Evergreen, preinstalled on most Windows 11 PCs).' },
    { q: 'Where is my data stored?', a: 'Locally on your PC with schema versioning. Private window data is isolated and not written to normal history. See Privacy for what local privacy can and cannot do.' },
    { q: 'Is DOTX a real browser I can use today?', a: 'As a preview — yes for browsing, tabs, workspaces, and downloads. Reader, smart archiving and extension support are Preview/Planned and labeled clearly.' },
    { q: 'How do I update?', a: 'Download the newer installer from Releases (when published). Auto-update will only be enabled when a signed, verified update infrastructure is configured.' },
    { q: 'What data does DOTX collect?', a: 'None by default. No analytics or account required. If optional diagnostics are ever added, they’ll be opt-in with a clear setting.' },
    { q: 'How do I verify downloads?', a: 'Every release lists SHA-256 checksums in its GitHub Release notes. Use Get-FileHash in PowerShell and compare — instructions on /download.' },
  ];
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="section-label">FAQ</div>
          <h1 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', marginTop: 12 }}>Frequently asked questions</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>Truthful answers about the current preview — no marketing inflation.</p>
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 32 }}>
          {items.map((it) => (
            <details key={it.q} className="faq-item">
              <summary>{it.q}</summary>
              <p>{it.a}</p>
            </details>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-tertiary)' }}>
          Still stuck?{' '}
          <a href="https://github.com/dotsoftwarelkofficial/dotx/issues" target="_blank" rel="noreferrer" style={{ color: 'var(--violet)', textDecoration: 'underline' }}>
            Open an issue on GitHub
          </a>
          .
        </div>
      </div>
    </section>
  );
}
