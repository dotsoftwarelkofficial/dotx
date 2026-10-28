import { Link } from "react-router-dom";
export function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 700, textAlign: "center" }}>
        <span className="badge">404</span>
        <h2 style={{ marginTop: 10 }}>Page not found</h2>
        <p className="muted">The link may be outdated or moved. Head back home or explore the docs.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
          <Link to="/" className="btn btn-primary">Back to home</Link>
          <Link to="/support" className="btn btn-ghost">Support</Link>
        </div>
      </div>
    </section>
  );
}
