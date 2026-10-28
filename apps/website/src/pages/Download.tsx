import { useEffect, useState } from 'react';
import { SITE, getGithubOwner } from '../lib/site';

type ReleaseInfo = { tag: string; publishedAt: string | null; assets: { name: string; url: string; size?: number }[] } | null;

export function Download() {
  const [owner, setOwner] = useState<string | null>(null);
  const [release, setRelease] = useState<ReleaseInfo>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setOwner(getGithubOwner());
    const ghOwner = getGithubOwner();
    if (!ghOwner) {
      setChecked(true);
      return;
    }
    const base = (import.meta.env.BASE_URL as string) || '/dotx/';
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

  const repoName = ((import.meta.env.BASE_URL as string) || '/dotx/').replaceAll('/', '') || 'dotx';
  const hasRelease = !!release && release.assets.length > 0;
  const releaseBase = owner ? `https://github.com/${owner}/${repoName}/releases` : `https://github.com/${repoName}`;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 960 }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <div className="section-label">Download</div>
          <h1 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', marginTop: 12 }}>Get DOTX for Windows</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>
            Installers are built on Windows runners and published to GitHub Releases with SHA-256 checksums. The site itself is static on GitHub Pages — we never link to fabricated binaries.
          </p>
        </div>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: 16 }} className="download-layout">
          <div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>Windows 10 / 11 • x64</span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>WebView2 Runtime required • MSI 2.9 MB • EXE 1.9 MB</span>
              </div>

              {!checked && <p style={{ color: 'var(--text-secondary)', marginTop: 16, fontSize: 14 }}>Checking for latest release…</p>}

              {checked && !hasRelease && (
                <div style={{ marginTop: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                  <strong style={{ fontSize: 14 }}>Preview — no public installer yet on GitHub Releases</strong>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>
                    There is no published GitHub Release in this repository yet, so there is no binary to download. This is intentional until CI produces a verified installer. When a release exists, real asset buttons will appear here and checksums will be attached to the release.
                  </p>
                  <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, color: 'var(--text-tertiary)', overflowX: 'auto' }}>
                    {owner ? `https://github.com/${owner}/${repoName}/releases/download/${SITE.latestVersion}/DOTX_${SITE.latestVersion}_x64.msi` : `https://github.com/<owner>/${repoName}/releases/download/v0.1.0/DOTX_0.1.0_x64.msi`}
                    <br />
                    {owner ? `https://github.com/${owner}/${repoName}/releases/download/${SITE.latestVersion}/DOTX_${SITE.latestVersion}_x64.exe` : `https://github.com/<owner>/${repoName}/releases/download/v0.1.0/DOTX_0.1.0_x64.exe`}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-tertiary)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '10px 12px', borderRadius: 8 }}>
                    <strong style={{ color: '#F59E0B' }}>Build note:</strong> Installer artifacts <em>do</em> exist from the latest successful CI run (MSI SHA-256 <span style={{ fontFamily: 'var(--font-mono)' }}>21AB6F5…</span> / EXE <span style={{ fontFamily: 'var(--font-mono)' }}>E1DD841…</span> on workflow 40639918198). They are attached as workflow artifacts and will be promoted to a draft prerelease — we publish only when checksums are listed in release notes.
                  </div>
                </div>
              )}

              {checked && hasRelease && release && (
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ fontSize: 16 }}>
                    {release.tag} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: 12 }}>· {release.publishedAt ? new Date(release.publishedAt).toLocaleDateString() : ''}</span>
                  </h3>
                  <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                    {release.assets.map((a) => (
                      <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '12px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{a.size ? `${(a.size / 1024 / 1024).toFixed(1)} MB · ` : ''}SHA-256 in release notes</div>
                        </div>
                        <a className="btn btn-primary btn-small" href={a.url}>
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <a className="btn btn-primary" href={releaseBase} target="_blank" rel="noreferrer">
                  View all releases →
                </a>
                <a className="btn btn-secondary" href="#install">
                  Install guide
                </a>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12 }}>
                Detected {owner ? <>owner <strong>{owner}</strong> · repo <strong>{repoName}</strong></> : <>repo <strong>{repoName}</strong> (configure <code>VITE_GH_OWNER</code> for precise links)</>} · Base <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>{(import.meta.env.BASE_URL as string) || '/dotx/'}</code>
              </p>
            </div>

            <div id="install" style={{ marginTop: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 15 }}>Install instructions</h3>
              <ol style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7 }}>
                <li>Download the <strong style={{ color: 'var(--text-primary)' }}>.msi</strong> (recommended) or <strong style={{ color: 'var(--text-primary)' }}>.exe</strong> from Releases.</li>
                <li>Run the installer and follow the Windows prompts.</li>
                <li>If WebView2 is missing, the bootstrapper will guide you to install Evergreen Runtime.</li>
                <li>Launch DOTX from Start Menu or desktop shortcut.</li>
              </ol>
              <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: 12, borderRadius: 8, color: 'var(--text-tertiary)' }}>
                # Verify checksum (PowerShell)
                <br />
                Get-FileHash DOTX_*.msi -Algorithm SHA256
                <br />
                # Compare with hash in release notes
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
              <h4 style={{ marginBottom: 8 }}>Troubleshooting</h4>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.7 }}>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>SmartScreen:</strong> Unsigned preview builds show a warning — “More info → Run anyway”. Signed builds require a cert in GitHub Secrets.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>WebView2 missing:</strong> Install from{' '}
                  <a href="https://developer.microsoft.com/microsoft-edge/webview2/" target="_blank" rel="noreferrer" style={{ color: 'var(--violet)', textDecoration: 'underline' }}>
                    microsoft.com/webview2
                  </a>
                  .
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Won’t start:</strong> Ensure you have permission to install apps on this PC.
                </li>
              </ul>
            </div>
            <div className="privacy-card">
              <h4 style={{ marginBottom: 8 }}>Versioning</h4>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>SemVer tags like <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>v0.1.0</code>. App, installer metadata and release notes share the same version. Checksums attached to each release.</p>
            </div>
          </div>
        </div>

        <style>{`@media(max-width:900px){.download-layout{grid-template-columns:1fr !important;}}`}</style>
      </div>
    </section>
  );
}
