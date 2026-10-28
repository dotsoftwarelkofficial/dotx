import { Link } from 'react-router-dom';
import SignatureMockup from './SignatureMockup';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow" aria-hidden />
      <div className="container-wide" style={{ position: 'relative' }}>
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div className="hero-eyebrow">The next generation of browsing — for Windows</div>

          <h1 className="hero-title">
            Your web.
            <br />
            Without the <em>noise.</em>
          </h1>

          <p className="hero-desc">
            DOTX is a premium, keyboard-first browser for Windows. Fast, private, and crafted to keep you in flow — not pull you out of it.
          </p>

          <div className="hero-actions">
            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = `${import.meta.env.BASE_URL}downloads/DOTX_0.1.0_x64_en-US.msi`;
                a.download = 'DOTX_0.1.0_x64_en-US.msi';
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
              className="btn btn-primary btn-large"
              title="Download directly — 2.8 MB MSI from this site"
            >
              Download for Windows <span aria-hidden>↓</span>
            </button>
            <Link to="/features" className="btn btn-secondary btn-large">
              See what&apos;s inside
            </Link>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>Direct download from this site — no GitHub redirect</div>

          <div className="hero-meta">
            <span>
              <span aria-hidden style={{ width: 14, height: 14, border: '1px solid var(--border)', borderRadius: 4, display: 'inline-grid', placeItems: 'center', fontSize: 9 }}>▢</span>
              Windows 10 & 11 • x64
            </span>
            <span style={{ width: 1, height: 12, background: 'var(--border)', display: 'inline-block' }} aria-hidden />
            <span>v0.1.0 preview • MSI 2.9 MB</span>
            <span style={{ width: 1, height: 12, background: 'var(--border)', display: 'inline-block' }} aria-hidden />
            <span>Free while in preview</span>
          </div>
        </div>

        <SignatureMockup />

        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16, fontSize: 12, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
          <span>✓ No account required</span>
          <span>✓ No data collection</span>
          <span>✓ Open roadmap</span>
        </div>
      </div>
    </section>
  );
}
