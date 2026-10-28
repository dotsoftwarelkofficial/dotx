import { Link } from 'react-router-dom';
export function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640, textAlign: 'center' }}>
        <div className="section-label" style={{ margin: '0 auto 16px' }}>
          404
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem,3vw,2.25rem)' }}>Page not found</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>The link may be outdated or moved. The site lives under <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12 }}>/dotx/</code> on GitHub Pages — deep links are supported.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            Back to home
          </Link>
          <Link to="/features" className="btn btn-secondary">
            Explore features
          </Link>
        </div>
      </div>
    </section>
  );
}
