import { useEffect, useState } from 'react';
import { SITE, getGithubOwner } from '../lib/site';

type ReleaseInfo = { tag: string; publishedAt: string | null; assets: { name: string; url: string; size?: number }[] } | null;

export function Download() {
  const [owner, setOwner] = useState<string | null>(null);
  const [release, setRelease] = useState<ReleaseInfo>(null);
  const [checked, setChecked] = useState(false);
  const base = (import.meta.env.BASE_URL as string) || '/dotx/';
  const repoName = base.replaceAll('/', '') || 'dotx';

  useEffect(() => {
    setOwner(getGithubOwner());
    const ghOwner = getGithubOwner();
    if (!ghOwner) {
      setChecked(true);
      return;
    }
    const repo = base.replaceAll('/', '') || 'dotx';
    const url = `https://api.github.com/repos/${ghOwner}/${repo}/releases/latest`;
    fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && j.tag_name) {
          setRelease({
            tag: j.tag_name,
            publishedAt: j.published_at,
            assets: (j.assets || []).map((a: { name: string; browser_download_url: string; size: number }) => ({
              name: a.name,
              url: a.browser_download_url,
              size: a.size,
            })),
          });
        }
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  const hasRelease = !!release && release.assets.length > 0;
  const releaseBase = owner ? `https://github.com/${owner}/${repoName}/releases` : `https://github.com/${repoName}`;

  // Direct web downloads — hosted on GitHub Pages static (no external navigation)
  const msiUrl = `${base}downloads/DOTX_0.1.0_x64_en-US.msi`;
  const exeUrl = `${base}downloads/DOTX_0.1.0_x64-setup.exe`;
  const checksumsUrl = `${base}downloads/checksums-SHA256.txt`;

  const handleDirectDownload = (url: string, filename: string) => {
    // Trigger download directly from web (same-origin) — stays on site, no redirect
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 960 }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <div className="section-label">Download</div>
          <h1 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', marginTop: 12 }}>Get DOTX for Windows</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>
            Click to download instantly — hosted right here on{' '}
            <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>dotsoftwarelkofficial.github.io/dotx</code>. No GitHub redirect.
          </p>
        </div>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: 16 }} className="download-layout">
          <div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>Windows 10 / 11 • x64</span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>WebView2 Runtime required • MSI 2.8 MB • EXE 1.9 MB</span>
              </div>

              {/* Direct web downloads — PRIMARY */}
              <div style={{ marginTop: 16, background: 'linear-gradient(135deg, rgba(109,93,247,0.08), transparent)', border: '1px solid var(--violet-border)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: '#10B981', boxShadow: '0 0 8px rgba(16,185,129,0.6)' }} />
                  <strong style={{ fontSize: 13 }}>Download directly from dotx.app</strong>
                  <span style={{ marginLeft: 'auto', fontSize: 11, background: 'var(--violet-soft)', color: 'var(--violet)', padding: '3px 8px', borderRadius: 999, border: '1px solid var(--violet-border)', fontWeight: 600 }}>ONE CLICK</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0' }}>Files are on this website — clicking starts download immediately, no new tab.</p>

                <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>DOTX_0.1.0_x64_en-US.msi</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>2.8 MB • MSI • Recommended • SHA256: F80BA3AA...</div>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleDirectDownload(msiUrl, 'DOTX_0.1.0_x64_en-US.msi')}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Download MSI ↓
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>DOTX_0.1.0_x64-setup.exe</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>1.9 MB • NSIS Setup • SHA256: F7DF90EE...</div>
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDirectDownload(exeUrl, 'DOTX_0.1.0_x64-setup.exe')}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Download EXE ↓
                    </button>
                  </div>

                  <a href={checksumsUrl} download="checksums-SHA256.txt" style={{ fontSize: 12, color: 'var(--violet)', textDecoration: 'underline', textAlign: 'center' }}>
                    Verify → checksums-SHA256.txt (download)
                  </a>
                </div>
              </div>

              {/* GitHub releases — secondary */}
              <div style={{ marginTop: 16 }}>
                {!checked && <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Checking GitHub Releases for newer version…</p>}
                {checked && hasRelease && release && (
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.06, color: 'var(--text-tertiary)', marginBottom: 6 }}>Also available on GitHub Releases</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{release.tag} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: 12 }}>· {release.publishedAt ? new Date(release.publishedAt).toLocaleDateString() : ''}</span></div>
                    <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                      {release.assets.map((a) => (
                        <a key={a.name} href={a.url} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}>
                          <span style={{ fontWeight: 600 }}>{a.name}</span>
                          <span style={{ color: 'var(--text-tertiary)' }}>{a.size ? `${(a.size / 1024 / 1024).toFixed(1)} MB` : ''}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {checked && !hasRelease && (
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: 8 }}>
                    No published GitHub Release yet — direct downloads above are from this website&apos;s verified CI build. GitHub Releases will appear after <code>v0.1.0</code> tag.
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <a className="btn btn-ghost" href={releaseBase} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
                  View all releases on GitHub →
                </a>
                <a className="btn btn-ghost" href="#install" style={{ fontSize: 12 }}>
                  Install guide
                </a>
              </div>

              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 10, textAlign: 'center' }}>
                Downloads served from <strong>this site</strong> ({base}downloads/) — no redirect, no tracking.
              </p>
            </div>

            <div id="install" style={{ marginTop: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 15 }}>Install instructions</h3>
              <ol style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7 }}>
                <li>Click <strong style={{ color: 'var(--text-primary)' }}>Download MSI</strong> above — file saves directly from this website.</li>
                <li>Run the installer and follow Windows prompts.</li>
                <li>If WebView2 missing, bootstrapper installs Evergreen Runtime.</li>
                <li>Launch DOTX from Start Menu.</li>
              </ol>
              <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: 12, borderRadius: 8, color: 'var(--text-tertiary)' }}>
                # Verify checksum (PowerShell) — compare with{' '}
                <a href={checksumsUrl} download style={{ color: 'var(--violet)', textDecoration: 'underline' }}>
                  checksums-SHA256.txt
                </a>
                <br />
                Get-FileHash .\DOTX_0.1.0_x64_en-US.msi -Algorithm SHA256
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
            <div className="privacy-card">
              <h4 style={{ marginBottom: 8 }}>System requirements</h4>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.7 }}>
                <li>Windows 10 1809+ or Windows 11 (x64)</li>
                <li>Microsoft Edge WebView2 Runtime (Evergreen)</li>
                <li>~120–180 MB installed</li>
                <li>4 GB RAM recommended</li>
              </ul>
            </div>
            <div className="privacy-card">
              <h4 style={{ marginBottom: 8 }}>What happens on click?</h4>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Your browser downloads <strong style={{ color: 'var(--text-primary)' }}>directly from dotx.app</strong> — same domain, no GitHub popup. Progress shows in your browser&apos;s download bar.
              </p>
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.7 }}>
                <li>Instant start — no external site</li>
                <li>Works even if GitHub is slow</li>
                <li>SHA256 included for verification</li>
              </ul>
            </div>
            <div className="privacy-card">
              <h4 style={{ marginBottom: 8 }}>Versioning</h4>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Current: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>v0.1.0</code> ({SITE.latestVersion}). MSI 2.8 MB / EXE 1.9 MB hosted here. Future releases also appear here + GitHub.
              </p>
            </div>
          </div>
        </div>

        <style>{`@media(max-width:900px){.download-layout{grid-template-columns:1fr !important;}}`}</style>
      </div>
    </section>
  );
}
