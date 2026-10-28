import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand" style={{ marginBottom: 0 }}>
              <span className="brand-mark" aria-hidden>
                ◈
              </span>
              <span className="brand-wordmark">
                <strong>DOTX</strong>
                <span>for Windows</span>
              </span>
            </Link>
            <p>
              A premium, keyboard-first browser for Windows — calm by default, crafted for flow, and private by design. Built by DOT Software.
            </p>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-tertiary)' }}>
              <div>v0.1.0 preview • Not yet stable</div>
              <div style={{ marginTop: 4 }}>
                <a href="https://github.com/dotsoftwarelkofficial/dotx" style={{ display: 'inline', color: 'var(--violet)', padding: 0 }}>GitHub →</a>
              </div>
            </div>
          </div>

          <div>
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/download">Download</Link>
            <Link to="/changelog">Changelog</Link>
            <Link to="/faq">FAQ</Link>
          </div>

          <div>
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <a href="https://github.com/dotsoftwarelkofficial/dotx/discussions" target="_blank" rel="noreferrer">
              Discussions
            </a>
            <a href="https://github.com/dotsoftwarelkofficial/dotx/issues" target="_blank" rel="noreferrer">
              Report an issue
            </a>
          </div>

          <div>
            <h4>Legal</h4>
            <Link to="/privacy">Privacy</Link>
            <Link to="/security">Security</Link>
            <Link to="/support">Support</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} DOT Software. All rights reserved.</span>
          <span style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>Built with Tauri + React</span>
            <span aria-hidden>·</span>
            <a href="https://dotsoftwarelkofficial.github.io/dotx/" style={{ padding: 0, fontSize: 12 }}>dotx.app</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
