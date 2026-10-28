import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 28, height: 28, borderRadius: 9, background: "linear-gradient(135deg,#7C5CFF,#2EE6E6)", display: "grid", placeItems: "center", color: "white", fontWeight: 800, fontSize: 12 }}>◈</span>
              <strong>DOTX</strong>
            </div>
            <p className="muted small" style={{ marginTop: 10, maxWidth: 360 }}>
              Premium Windows browser built with Tauri + Rust + WebView2. Fast, private, and designed for Windows 10/11.
              Website hosted on GitHub Pages. Installers distributed via GitHub Releases.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/download">Download</Link>
            <Link to="/releases">Release Notes</Link>
            <Link to="/security">Security</Link>
          </div>
          <div>
            <h4>Resources</h4>
            <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub Repository</a>
            <a href="https://v2.tauri.app/" target="_blank" rel="noreferrer">Tauri Docs</a>
            <a href="https://learn.microsoft.com/en-us/microsoft-edge/webview2/" target="_blank" rel="noreferrer">WebView2</a>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
          <div>
            <h4>Support</h4>
            <Link to="/support">Help & Support</Link>
            <Link to="/faq">FAQ</Link>
            <a href="#contact">Contact</a>
            <span className="muted small">Windows 10/11 · WebView2 Runtime required</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} DOTX. Independent project — not affiliated with Microsoft, Google, or Opera.</span>
          <span className="muted">Build: Vite + React · Deployed via GitHub Pages</span>
        </div>
      </div>
    </footer>
  );
}
