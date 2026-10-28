# DOTX Architecture

## Overview
DOTX is two products in one repo:
- **Website** (`apps/website`): React + TypeScript + Vite static site → GitHub Pages.
- **Desktop** (`apps/desktop`): Tauri 2 + Rust + WebView2 Windows browser → GitHub Releases.

Shared design tokens live in `packages/shared`.

## Website Hosting — GitHub Pages
- Vite `base` is derived from `GITHUB_REPOSITORY` at build time.
  - Project site `owner/dotx` → base `/dotx/`
  - User site `owner/owner.github.io` → base `/`
  - Override with `VITE_BASE=/custom/`
- All asset URLs use `import.meta.env.BASE_URL` / Vite base — no root-relative `/assets/...` that breaks under subpath.
- SPA fallback: `deploy-pages.yml` copies `dist/index.html` → `dist/404.html` so BrowserRouter deep links refresh correctly. Also adds `.nojekyll`.
- SEO: `sitemap.xml` and `robots.txt` under base; canonical only when `VITE_CANONICAL_URL` is set.
- Downloads link to **real** GitHub Releases assets. Until a release exists the Download page shows a Preview state.

## Desktop Architecture
```
Privileged UI (Tauri webview: React)  ←→  Rust IPC (validated, narrow)
        │
        └── Isolated WebView2 child surface(s) for untrusted web content
```
- Privileged UI never navigates to arbitrary https URLs. Navigation goes through Rust `validate_url` and a dedicated unprivileged surface.
- Blocked schemes: `javascript:`, `data:`, `file:`, `vbscript:`; allow-list `http:`/`https:` only (plus search → URL transformation in frontend).
- Tabs each map to an independent surface with session restore & crash recovery.

## Trade-offs
| Option | Pros | Cons |
|--------|------|------|
| Tauri + WebView2 | Small bundle, native runtime, fast | Advanced browser features (fine-grained network blocking) need extra work |
| CEF | More browser control | Large bundle, more maintenance |

We start with Tauri + WebView2 and document unsupported features honestly.

## Security
See `SECURITY.md` and `docs/SECURITY.md`.
