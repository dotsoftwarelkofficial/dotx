import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '@dotx/shared';

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const loc = useLocation();

  useEffect(() => setOpen(false), [loc.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('dotx-theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
      return;
    }
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dotx-theme', next);
  };

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="DOTX home">
          <span className="brand-mark" aria-hidden>
            ◈
          </span>
          <span className="brand-wordmark">
            <strong>DOTX</strong>
            <span>for Windows</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.href}
              to={l.href}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
          {/* Extra links handled via /about privacy etc but keep nav-links as source ; add fallback */}
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            About
          </NavLink>
        </nav>

        <div className="header-actions">
          <button
            className="btn btn-ghost"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'}`}
            style={{ width: 36, height: 36, padding: 0 }}
          >
            <span aria-hidden style={{ fontSize: 14 }}>{theme === 'dark' ? '☀︎' : '☾'}</span>
          </button>
          <button
            onClick={() => {
              const a = document.createElement('a');
              a.href = `${import.meta.env.BASE_URL}downloads/DOTX_0.1.0_x64_en-US.msi`;
              a.download = 'DOTX_0.1.0_x64_en-US.msi';
              document.body.appendChild(a);
              a.click();
              a.remove();
            }}
            className="btn btn-primary"
            style={{ padding: '9px 14px', fontSize: 13 }}
            title="Download directly from this site — no GitHub redirect"
          >
            Download
            <span aria-hidden style={{ fontSize: 12 }}>↓</span>
          </button>
          <button
            className="mobile-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span
              aria-hidden
              style={{
                display: 'block',
                width: 14,
                height: 1.5,
                background: 'currentColor',
                boxShadow: open ? 'none' : '0 5px 0 currentColor, 0 -5px 0 currentColor',
                transform: open ? 'rotate(45deg)' : 'none',
                position: 'relative',
              }}
            >
              {open && (
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'currentColor',
                    transform: 'rotate(90deg)',
                  }}
                />
              )}
            </span>
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="container">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} to={l.href}>
              {l.label}
            </Link>
          ))}
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = `${import.meta.env.BASE_URL}downloads/DOTX_0.1.0_x64_en-US.msi`;
                a.download = 'DOTX_0.1.0_x64_en-US.msi';
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
              className="btn btn-primary"
              style={{ justifyContent: 'center', width: '100%' }}
            >
              Download for Windows ↓
            </button>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)' }}>Preview build • 2.8 MB MSI • Direct from this site</div>
          </div>
        </div>
      </div>
    </header>
  );
}
