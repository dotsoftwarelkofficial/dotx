export const SITE = {
  name: "DOTX",
  tagline: "Premium Windows Browser",
  description: "Fast. Private. Designed for Windows 10/11. Built with Tauri, Rust & WebView2.",
  canonical: (import.meta.env.VITE_CANONICAL_URL as string | undefined) ?? "",
  repo: "dotx",
  latestVersion: "v0.2.0",
  releaseDate: "2026-10-28",
};
export function getGithubOwner(): string | null {
  if (typeof window !== "undefined") {
    const m = window.location.hostname.match(/^([a-z0-9-]+)\.github\.io$/i);
    if (m) return m[1];
  }
  const envOwner = (import.meta.env.VITE_GH_OWNER as string | undefined) ?? "";
  if (envOwner) return envOwner;
  return null;
}
export function getBasePath(): string {
  const base = (import.meta.env.BASE_URL as string) || "/";
  return base;
}
