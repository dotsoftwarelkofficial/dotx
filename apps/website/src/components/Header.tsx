import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { NAV_LINKS } from "@dotx/shared";

export function Header() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const loc = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    const saved = localStorage.getItem("dotx-theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("dotx-theme", next);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="DOTX home">
          <span className="brand-mark" aria-hidden>
            <span>◈</span>
          </span>
          <span>
            <span className="brand-name">DOTX</span>
            <div className="brand-sub">Windows Browser</div>
          </span>
        </Link>

        <nav className="nav" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.href} to={l.href} className="nav-link">
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <button className="btn btn-ghost" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
            {theme === "dark" ? "☀︎" : "☾"}
          </button>
          <Link to="/download" className="btn btn-primary">Download for Windows</Link>
          <button className="mobile-toggle" onClick={() => setOpen((v) => !v)} aria-label="Open menu" aria-expanded={open}>
            <span />
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <div className="container">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} to={l.href}>{l.label}</Link>
          ))}
          <div style={{ marginTop: 12 }}>
            <Link to="/download" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Download</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
