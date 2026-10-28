import { useEffect, useState } from "react";
import { SITE, getGithubOwner } from "../lib/site";

type ReleaseInfo = { tag: string; publishedAt: string | null; assets: { name: string; url: string; size?: number }[] } | null;

export function Download() {
  const [owner, setOwner] = useState<string | null>(null);
  const [release, setRelease] = useState<ReleaseInfo>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setOwner(getGithubOwner());
    // Try to fetch latest release if owner known and we're on github.io / can call api
    const ghOwner = getGithubOwner();
    if (!ghOwner) { setChecked(true); return; }
    // Repo name from base path: /dotx/ → dotx
    const base = (import.meta.env.BASE_URL as string) || "/dotx/";
    const repo = base.replaceAll("/", "") || "dotx";
    const url = `https://api.github.com/repos/${ghOwner}/${repo}/releases/latest`;
    fetch(url, { headers: { Accept: "application/vnd.github+json" } })
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (j && j.tag_name) {
          setRelease({
            tag: j.tag_name,
            publishedAt: j.published_at,
            assets: (j.assets || []).map((a: { name: string; browser_download_url: string; size: number }) => ({ name: a.name, url: a.browser_download_url, size: a.size })),
          });
        }
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  const repoName = ((import.meta.env.BASE_URL as string) || "/dotx/").replaceAll("/", "") || "dotx";
  const hasRelease = !!release && release.assets.length > 0;
  const releaseBase = owner ? `https://github.com/${owner}/${repoName}/releases` : `https://github.com/${repoName}`;

  return (
    <section className="section">
      <div className="container">
        <span className="badge">Download</span>
        <h2 style={{ marginTop: 10 }}>Get DOTX for <span>Windows</span></h2>
        <p className="lead">Installers are built on Windows runners and published to GitHub Releases with SHA-256 checksums. The website itself is static on GitHub Pages.</p>

        <div className="download-hero" style={{ marginTop: 20 }}>
          <div>
            <div className="release-card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span className="badge">Windows 10 / 11</span>
                <span className="muted small">WebView2 Runtime required (preinstalled on most Windows) · x64</span>
              </div>

              {!checked && <p className="muted">Checking for latest release…</p>}

              {checked && !hasRelease && (
                <div className="alert" style={{ marginTop: 12 }}>
                  <strong>Preview — no public installer yet.</strong>
                  <p className="muted small" style={{ margin: "6px 0 0" }}>
                    There is no published GitHub Release in this repository yet, so there is no binary to download. This is intentional until CI produces a verified installer.
                    When a release exists, buttons below will link to real assets like:
                  </p>
                  <div className="code" style={{ marginTop: 8, fontSize: 12 }}>
                    {owner ? `https://github.com/${owner}/${repoName}/releases/download/${SITE.latestVersion}/DOTX_${SITE.latestVersion}_x64.msi` : `https://github.com/<owner>/${repoName}/releases/download/v0.1.0/DOTX_0.1.0_x64.msi`}<br />
                    {owner ? `https://github.com/${owner}/${repoName}/releases/download/${SITE.latestVersion}/DOTX_${SITE.latestVersion}_x64.exe` : `https://github.com/<owner>/${repoName}/releases/download/v0.1.0/DOTX_0.1.0_x64.exe`}
                  </div>
                </div>
              )}

              {checked && hasRelease && release && (
                <>
                  <h3 style={{ marginTop: 12 }}>{release.tag} <span className="muted small">· {release.publishedAt ? new Date(release.publishedAt).toLocaleDateString() : ""}</span></h3>
                  <div className="download-list">
                    {release.assets.map(a => (
                      <div className="dl-row" key={a.name}>
                        <div>
                          <b>{a.name}</b><br />
                          <span>{a.size ? `${(a.size / 1024 / 1024).toFixed(1)} MB · ` : ""}SHA-256 in release notes</span>
                        </div>
                        <a className="btn btn-primary" href={a.url}>Download</a>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                <a className="btn btn-primary" href={releaseBase} target="_blank" rel="noreferrer">View all releases →</a>
                <a className="btn btn-ghost" href="#install">Install guide</a>
              </div>

              <p className="muted small" style={{ marginTop: 10 }}>
                Detected {owner ? <>owner <b>{owner}</b> · repo <b>{repoName}</b></> : <>repo <b>{repoName}</b> (owner not detected — configure <span className="kbd">VITE_GH_OWNER</span> for precise links)</>} · Base <span className="kbd">{(import.meta.env.BASE_URL as string) || "/dotx/"}</span>
              </p>
            </div>

            <div className="card" id="install" style={{ marginTop: 12 }}>
              <h3>Install instructions</h3>
              <ol className="muted" style={{ margin: 0, paddingLeft: 18 }}>
                <li>Download the <b>.msi</b> (recommended) or <b>.exe</b> installer from Releases.</li>
                <li>Run the installer and follow the Windows prompts.</li>
                <li>If WebView2 is missing, the bootstrapper will guide you to install Evergreen Runtime.</li>
                <li>Launch DOTX from Start Menu or desktop shortcut.</li>
              </ol>
              <div className="code" style={{ marginTop: 10 }}>
                # Verify checksum (PowerShell)<br />
                Get-FileHash DOTX_*.msi -Algorithm SHA256
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <h3>System requirements</h3>
              <ul className="muted small" style={{ margin: 0, paddingLeft: 18 }}>
                <li>Windows 10 1809+ or Windows 11 (x64)</li>
                <li>Microsoft Edge WebView2 Runtime (Evergreen)</li>
                <li>~120–180 MB installed (Tauri + WebView2 shared runtime)</li>
                <li>4 GB RAM recommended</li>
              </ul>
            </div>
            <div className="card" style={{ marginTop: 12 }}>
              <h3>Troubleshooting</h3>
              <ul className="muted small" style={{ margin: 0, paddingLeft: 18 }}>
                <li><b>SmartScreen warning:</b> Unsigned preview builds show a warning — click “More info → Run anyway” (publish signed builds via GitHub Secrets for production).</li>
                <li><b>WebView2 missing:</b> Install from <a href="https://developer.microsoft.com/en-us/microsoft-edge/webview2/" target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>microsoft.com/webview2</a>.</li>
                <li><b>Installer won’t start:</b> Ensure you have permission to install apps on this PC.</li>
              </ul>
            </div>
            <div className="card" style={{ marginTop: 12 }}>
              <h3>Versioning</h3>
              <p className="muted small">SemVer tags like <span className="kbd">v0.1.0</span>. The app, installer metadata, and release notes share the same version. Checksums are attached to each release.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
