import { useState } from 'react';

export function Support() {
  const [sent, setSent] = useState(false);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') || '');
    const msg = String(data.get('message') || '');
    if (!email.includes('@') || msg.length < 10) {
      alert('Please enter a valid email and a message of at least 10 characters.');
      return;
    }
    setSent(true);
    form.reset();
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 840 }}>
        <div className="section-label">Support</div>
        <h1 style={{ fontSize: 'clamp(1.75rem,3vw,2.25rem)', marginTop: 12 }}>We’re here to help</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>
          DOTX is a static site on GitHub Pages — no server. For bugs, use GitHub Issues. For quick questions, the form below is front-end only until you wire a backend.
        </p>

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="privacy-card">
            <h4>Documentation</h4>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7 }}>
              <li>
                <a href="https://v2.tauri.app/start/prerequisites/" target="_blank" rel="noreferrer" style={{ color: 'var(--violet)', textDecoration: 'underline' }}>
                  Tauri prerequisites
                </a>
              </li>
              <li>
                <a href="https://github.com/dotsoftwarelkofficial/dotx" target="_blank" rel="noreferrer" style={{ color: 'var(--violet)', textDecoration: 'underline' }}>
                  GitHub repository
                </a>
              </li>
              <li>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>docs/ARCHITECTURE.md</code> & <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>docs/SECURITY.md</code>
              </li>
            </ul>
          </div>
          <div className="privacy-card">
            <h4>Report an issue</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 8 }}>Open an issue with steps, expected vs. actual, and your Windows version. For sensitive security issues, use a private advisory — see SECURITY.md.</p>
            <a className="btn btn-secondary" href="https://github.com/dotsoftwarelkofficial/dotx/issues" target="_blank" rel="noreferrer" style={{ marginTop: 12 }}>
              Open GitHub Issues →
            </a>
          </div>
        </div>

        <div id="contact" style={{ marginTop: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 15 }}>Contact</h3>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6, marginTop: 6 }}>This form is front-end only on GitHub Pages. To make it send email, connect a service like Formspree/Resend and replace the handler. Until then it shows a local confirmation.</p>
          {sent ? (
            <div style={{ marginTop: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
              <strong style={{ fontSize: 13 }}>Message noted (local demo)</strong>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6 }}>No email was sent because the site is static. For actionable requests, please open a GitHub Issue.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Email</span>
                <input name="email" type="email" required placeholder="you@example.com" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Message</span>
                <textarea name="message" required rows={4} placeholder="How can we help?" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', resize: 'vertical' }} />
              </label>
              <button className="btn btn-primary" type="submit">
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
