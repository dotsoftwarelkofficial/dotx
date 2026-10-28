export function Faq() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <span className="badge">FAQ</span>
        <h2 style={{ marginTop: 10 }}>Frequently asked <span>questions</span></h2>
        <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
          <details className="faq-item" open><summary>Is DOTX free?</summary><p>Yes. It’s an independent open project. Installers are free via GitHub Releases.</p></details>
          <details className="faq-item" open><summary>Why Tauri + WebView2 instead of Electron?</summary><p>Smaller bundle, native WebView2 (Chromium) already on Windows, Rust backend for security and performance. We document the trade-offs in ARCHITECTURE.md.</p></details>
          <details className="faq-item"><summary>Does it work on Windows 10?</summary><p>Yes — Windows 10 1809+ and Windows 11. WebView2 Runtime is required (Evergreen).</p></details>
          <details className="faq-item"><summary>Where is my data stored?</summary><p>Locally on your PC with schema versioning. Private window data is isolated and not written to normal history. See Privacy for limits.</p></details>
          <details className="faq-item"><summary>How do I update?</summary><p>Download the newer installer from Releases. Auto-update is only enabled when a signed, verified update infrastructure is configured.</p></details>
          <details className="faq-item"><summary>Can I use it as my daily browser today?</summary><p>The preview is functional for browsing, bookmarks, and downloads. We’re still hardening edge cases — see Release Notes for what’s verified.</p></details>
        </div>
      </div>
    </section>
  );
}
