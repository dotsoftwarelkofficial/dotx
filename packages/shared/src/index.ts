/**
 * DOTX Shared — design tokens, types and utilities
 * Used by both website and desktop apps.
 */

export const BRAND = {
  name: "DOTX",
  tagline: "Premium Windows Browser",
  description: "Fast. Private. Designed for Windows.",
  colors: {
    bg: "#080A12",
    bgElevated: "#11131F",
    bgSoft: "#161A2B",
    violet: "#7C5CFF",
    violetHover: "#6B4AE6",
    cyan: "#2EE6E6",
    cyanSoft: "#B8FFFE",
    text: "#EDEEF5",
    textMuted: "#9AA0B8",
    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.14)",
  },
} as const;

export type Theme = "dark" | "light" | "system";

export const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Privacy", href: "/privacy" },
  { label: "Security", href: "/security" },
  { label: "Download", href: "/download" },
  { label: "Support", href: "/support" },
  { label: "Releases", href: "/releases" },
] as const;

export const FEATURES = [
  {
    title: "True Tab Isolation",
    desc: "Each tab runs in its own isolated WebView2 surface. A crashed page never crashes your browser.",
    icon: "layers",
  },
  {
    title: "Instant Search",
    desc: "Address bar with smart URL detection, search provider switching, and Unicode domain safety.",
    icon: "search",
  },
  {
    title: "Bookmarks that persist",
    desc: "Folders, toolbar, search, import/export. Your data survives corrupt storage gracefully.",
    icon: "bookmark",
  },
  {
    title: "Real Downloads",
    desc: "Progress, validation, path-traversal protection, duplicate-safe saving. No fake progress bars.",
    icon: "download",
  },
  {
    title: "Private by design",
    desc: "No telemetry by default. Private windows are genuinely isolated, not just a dark theme.",
    icon: "shield",
  },
  {
    title: "Windows-native",
    desc: "Custom titlebar, high-DPI, drag regions, jump lists — built for Windows 10/11 with Tauri + Rust.",
    icon: "monitor",
  },
] as const;

export function getRepoBase(): string {
  // For Vite base path. On GitHub Pages project sites we need /<repo>/.
  // This helper mirrors the Vite config logic for runtime links.
  if (typeof import.meta !== "undefined") {
    const env = (import.meta as unknown as { env?: Record<string, string> }).env;
    if (env?.BASE_URL) return env.BASE_URL;
  }
  return "/";
}

export function safeUrl(input: string): { ok: boolean; url?: URL; reason?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, reason: "empty" };
  // Block dangerous schemes explicitly
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:")) return { ok: false, reason: "javascript scheme blocked" };
  if (lower.startsWith("data:")) return { ok: false, reason: "data scheme blocked" };
  if (lower.startsWith("file:")) return { ok: false, reason: "file scheme blocked" };
  if (lower.startsWith("vbscript:")) return { ok: false, reason: "blocked scheme" };
  try {
    // If looks like search query, treat separately elsewhere; here we validate URLs
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
    const toParse = hasScheme ? trimmed : `https://${trimmed}`;
    const url = new URL(toParse);
    if (!["http:", "https:"].includes(url.protocol)) return { ok: false, reason: "unsupported protocol" };
    return { ok: true, url };
  } catch {
    return { ok: false, reason: "invalid url" };
  }
}
