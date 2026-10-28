import { useState } from "react";

export function Support() {
  const [sent, setSent] = useState(false);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "");
    const msg = String(data.get("message") || "");
    if (!email.includes("@") || msg.length < 10) {
      alert("Please enter a valid email and a message of at least 10 characters.");
      return;
    }
    // No backend — static site. Show success locally and point to GitHub Issues.
    setSent(true);
    form.reset();
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <span className="badge">Support</span>
        <h2 style={{ marginTop: 10 }}>We’re here to <span>help</span></h2>
        <p className="lead">DOTX is hosted as a static site — there’s no server. For bugs, use GitHub Issues. For quick questions, use the form below (no data is sent to a server unless you wire one up).</p>

        <div className="grid-2" style={{ marginTop: 20 }}>
          <div className="card">
            <h3>Documentation</h3>
            <ul className="muted" style={{ paddingLeft: 18 }}>
              <li><a href="https://v2.tauri.app/start/prerequisites/" target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>Tauri prerequisites</a></li>
              <li><a href="https://github.com/" target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>GitHub repository</a></li>
              <li><code>docs/ARCHITECTURE.md</code> &amp; <code>docs/SECURITY.md</code></li>
            </ul>
          </div>
          <div className="card">
            <h3>Report an issue</h3>
            <p className="muted small">Open an issue with steps, expected vs actual, and your Windows version. For sensitive security issues use a private advisory — see SECURITY.md.</p>
            <a className="btn btn-ghost" href="https://github.com/" target="_blank" rel="noreferrer">Open GitHub Issues →</a>
          </div>
        </div>

        <div className="card" style={{ marginTop: 16 }} id="contact">
          <h3>Contact</h3>
          <p className="muted small">This form is front-end only on GitHub Pages. To make it send email, connect a service like Formspree, Resend, or a Cloudflare Worker and replace the handler. Until then it shows a local confirmation.</p>
          {sent ? (
            <div className="alert" style={{ marginTop: 10 }}>
              <strong>Message noted (local demo)</strong>
              <p className="muted small" style={{ margin: "6px 0 0" }}>No email was sent because the site is static. To handle real submissions, wire the form to your backend and update this page. For now please open a GitHub Issue for actionable requests.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span className="muted small">Email</span>
                <input name="email" type="email" required placeholder="you@example.com" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span className="muted small">Message</span>
                <textarea name="message" required rows={4} placeholder="How can we help?" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", resize: "vertical" }} />
              </label>
              <button className="btn btn-primary" type="submit">Send message</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
