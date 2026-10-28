# DOTX — Premium Windows Browser

> Fast. Private. Designed for Windows 10/11.  
> Website → **GitHub Pages** · Browser installers → **GitHub Releases**

![DOTX](https://img.shields.io/badge/DOTX-Windows%20Browser-7C5CFF?style=for-the-badge) ![GitHub Pages](https://img.shields.io/badge/Website-GitHub%20Pages-11131F) ![Tauri](https://img.shields.io/badge/Tauri-2.x-2EE6E6)

---

## ✨ What is this?

- **DOTX Website** (`apps/website`) — React + TypeScript + Vite static site with premium design (midnight/violet/cyan), deployed to GitHub Pages.
- **DOTX Desktop** (`apps/desktop`) — Tauri 2 + Rust + WebView2 Windows browser with real tabs, navigation, bookmarks, history, downloads and settings.
- **Shared** (`packages/shared`) — design tokens and utilities.

```
dotx/
├── apps/
│   ├── desktop/        # Tauri + Rust + React Windows app
│   │   └── src-tauri/  # Rust backend, tauri.conf.json
│   └── website/        # React + Vite site → GitHub Pages
├── packages/shared/    # Brand tokens, helpers
├── .github/workflows/  # deploy-pages.yml, ci.yml, release-windows.yml
└── docs/
```

---

## 🌐 Website — GitHub Pages

### Live URL
After first deploy, Pages URL is:

- **Project site**: `https://<USERNAME>.github.io/dotx/`  (most common — repo named `dotx`)
- **User site**: `https://<USERNAME>.github.io/` if your repo is `<USERNAME>.github.io`
- **Custom domain**: your domain if configured in Pages settings

The workflow auto-derives `base` from `GITHUB_REPOSITORY`. No hard-coded username needed.

### One-time GitHub setup (required)
1. Push this repo to GitHub (default branch `main` or `master` — workflow listens to both + `develop`).
2. In GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
   - Do NOT use legacy `gh-pages` branch publishing.
3. Push to `main` (or trigger **Actions → Deploy DOTX Website to GitHub Pages → Run workflow**).
4. Wait for the workflow to finish — the Pages URL appears in the deploy job summary and in **Settings → Pages**.
5. Open the URL and check: navigation, refresh on deep links (e.g. `/dotx/features`), assets, favicon, sitemap.

### Local development
```bash
npm install
npm run dev:website      # http://localhost:5173
npm run build:website    # production build (base auto → /dotx/ in CI)
npm run preview:website  # preview production dist
```

### GitHub Pages details
- **Vite base**: `apps/website/vite.config.ts` resolves it from `GITHUB_REPOSITORY` → `/<repo>/` or `/` for `.github.io` repos. Override with `VITE_BASE=/custom/`.
- **SPA refresh**: `deploy-pages.yml` copies `dist/index.html` → `dist/404.html` and adds `.nojekyll`.
- **SEO**: `public/sitemap.xml` + `robots.txt` + Open Graph; `VITE_CANONICAL_URL` only when your prod domain is known.
- **Download links**: the Download page fetches the latest GitHub Release via API and links to real `.msi`/`.exe` assets. Until a release exists it shows a Preview state — no fake binaries.

### Troubleshooting
- **404 on refresh**: ensure Pages source is *GitHub Actions* and `404.html` exists in the artifact (workflow creates it).
- **White page / broken assets**: check that base is `/dotx/` for a project site. Inspect `dist/index.html` — asset URLs should start with `/dotx/assets/`.
- **Still showing old site**: hard-refresh, check Actions logs, confirm you pushed to the branch the workflow watches.
- **Want pretty links on custom domain**: keep base `/`; set `VITE_BASE=/` and `VITE_CANONICAL_URL=https://your.domain`.

---

## 🖥️ Desktop — Windows

### Prerequisites (Windows dev)
- Node.js 20, Rust stable, WebView2 SDK (Tauri prereqs: https://v2.tauri.app/start/prerequisites/)
- `npm install` then `npm run dev:desktop`

### Build installer
```bash
npm run build:desktop
# or via Tauri CLI in apps/desktop: npx tauri build
# Outputs: src-tauri/target/release/bundle/msi/*.msi, .../nsis/*.exe
```

CI builds Windows installers on `windows-latest` runners tagged `v*` → draft GitHub Release with checksums.

---

## 🔒 Security

See `SECURITY.md` and `docs/SECURITY.md`. Privileged UI is isolated from web content; IPC is narrow and validated; downloads are path-safe.

---

## 🔑 Environment

Copy `.env.example` → `.env` for local overrides. Never commit secrets. Code-signing keys belong in GitHub Secrets.

---

## ⚠️ Token hygiene

If you pasted a GitHub Personal Access Token in a prompt or file, **revoke it immediately** at GitHub → Settings → Developer settings → Personal access tokens, then generate a new fine-grained token if needed.

---

## 📄 License

MIT — see `LICENSE` when added.
