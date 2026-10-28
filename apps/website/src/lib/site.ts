export const SITE = {
  name: "DOTX",
  tagline: "Premium Windows Browser",
  description: "Fast. Private. Designed for Windows 10/11. Built with Tauri, Rust & WebView2.",
  // Canonical URL is only set when production domain is known. For GitHub Pages project site,
  // it will be https://<username>.github.io/dotx/ . We keep it configurable via env.
  canonical: (import.meta.env.VITE_CANONICAL_URL as string | undefined) ?? "",
  repo: "dotx", // assumed repo name; Vite base uses GITHUB_REPOSITORY when available
  // Release tracking — until a real GitHub Release exists, show Preview state.
  latestVersion: "v0.1.0-preview",
  releaseDate: "Coming soon",
  // When releases exist, these will be real URLs like:
  // https://github.com/<owner>/dotx/releases/download/v0.1.0/DOTX_0.1.0_x64.msi
  // We construct them dynamically in Download page based on detected owner.
};

export function getGithubOwner(): string | null {
  // Try to infer from canonical or GITHUB_REPOSITORY if exposed via build-time env
  // Fallback: check window location for github.io pattern
  if (typeof window !== "undefined") {
    const m = window.location.hostname.match(/^([a-z0-9-]+)\.github\.io$/i);
    if (m) return m[1];
    // For custom domains, owner can't be inferred — return null
  }
  const envOwner = (import.meta.env.VITE_GH_OWNER as string | undefined) ?? "";
  if (envOwner) return envOwner;
  return null;
}

export function getBasePath(): string {
  // import.meta.env.BASE_URL always ends with "/"
  const base = (import.meta.env.BASE_URL as string) || "/";
  return base;
}
