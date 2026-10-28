import { Link } from 'react-router-dom';

export default function DownloadCTA() {
  return (
    <section className="section">
      <div className="container">
        <div className="download-cta">
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'inline-flex',
                gap: 8,
                alignItems: 'center',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--violet)',
                background: 'var(--violet-soft)',
                border: '1px solid var(--violet-border)',
                padding: '6px 12px',
                borderRadius: 999,
                marginBottom: 16,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--violet)' }} />
              Preview ready
            </div>
            <h2>Take back your web.</h2>
            <p>Join the preview. No account, no tracker — just a better browser for Windows.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/download" className="btn btn-primary btn-large">
                Download for Windows
                <span aria-hidden>→</span>
              </Link>
              <Link to="/changelog" className="btn btn-secondary btn-large">
                Read the changelog
              </Link>
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-tertiary)' }}>
              Requires Windows 10/11 x64 • MSI 2.9 MB • Free while in preview
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
