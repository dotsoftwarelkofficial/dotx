import { Link } from "react-router-dom";
import { BrowserMock } from "../components/BrowserMock";
import { FEATURES } from "@dotx/shared";

export function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow"><i /> Premium for Windows · Tauri + Rust</span>
            <h1>
              A browser that feels <em>native</em> to Windows.
            </h1>
            <p>
              DOTX is a lightweight, private Windows browser with real tab isolation, a polished new-tab dashboard,
              and a website that actually ships — hosted on GitHub Pages, installers on GitHub Releases.
            </p>
            <div className="hero-ctas">
              <Link to="/download" className="btn btn-primary">⬇ Download for Windows</Link>
              <Link to="/features" className="btn btn-ghost">Explore features →</Link>
            </div>
            <div className="hero-stats">
              <span className="stat">⚡ <b>Fast startup</b> — lazy-loaded, no bloat</span>
              <span className="stat">🔒 <b>No telemetry</b> by default</span>
              <span className="stat">▦ <b>WebView2</b> — Chromium rendering</span>
            </div>
          </div>
          <BrowserMock />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Built for <span>real browsing</span>, not just a mockup</h2>
          <p className="lead">
            Every control is functional — navigation, tabs, bookmarks, history, downloads, and settings persist locally.
            The privileged UI never navigates directly to the open web.
          </p>
          <div className="grid-3">
            {FEATURES.map((f) => (
              <div className="card" key={f.title}>
                <div className="icon">{f.icon === "layers" ? "▦" : f.icon === "search" ? "⌕" : f.icon === "bookmark" ? "☆" : f.icon === "download" ? "⬇" : f.icon === "shield" ? "◈" : "▣"}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container grid-2">
          <div className="card">
            <span className="badge">Hosting</span>
            <h3 style={{ marginTop: 10 }}>Website → GitHub Pages</h3>
            <p>Static React + Vite build deployed via Actions. No server. Assets use <span className="kbd">BASE_URL</span> so they work under <span className="kbd">/dotx/</span>.</p>
            <div className="code" style={{ marginTop: 12 }}>
              https://USERNAME.github.io/dotx/<br />
              ↳ base: "/dotx/" · 404 fallback · sitemap + robots
            </div>
          </div>
          <div className="card">
            <span className="badge" style={{ background: "color-mix(in oklab,#2EE6E6 14%, transparent)", borderColor: "color-mix(in oklab,#2EE6E6 18%,transparent)", color: "#0E7490" }}>Releases</span>
            <h3 style={{ marginTop: 10 }}>Browser → GitHub Releases</h3>
            <p>Windows installers (.msi/.exe) are built on Windows runners and attached to versioned releases. Checksums included.</p>
            <div className="code" style={{ marginTop: 12 }}>
              dotx/releases/download/v0.1.0/DOTX_0.1.0_x64.msi<br />
              dotx/releases/download/v0.1.0/DOTX_0.1.0_x64.exe
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="callout" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
            <div>
              <strong>Ready to try DOTX?</strong>
              <p className="muted small" style={{ margin: "4px 0 0" }}>Windows 10/11 · WebView2 Runtime required · Installer via GitHub Releases</p>
            </div>
            <Link to="/download" className="btn btn-primary">Go to download →</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>What people ask</h2>
          <div className="grid-2" style={{ marginTop: 16 }}>
            <details className="faq-item" open>
              <summary>Is DOTX a real browser?</summary>
              <p>Yes — real navigation, tabs, persistence and downloads using a safely isolated WebView2 surface. The privileged UI never hosts arbitrary web content directly.</p>
            </details>
            <details className="faq-item" open>
              <summary>How is privacy handled?</summary>
              <p>No telemetry by default, private windows are isolated sessions, and browsing data controls are honest about what local privacy can and cannot do.</p>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
