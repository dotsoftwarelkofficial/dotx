// DOTX Desktop — helpers shared between UI and tests
export type Theme = "dark" | "light" | "system";
export type SearchProvider = "duckduckgo" | "google" | "bing" | "brave";

export interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  history: string[];
  historyIndex: number;
  isPinned?: boolean;
  isLoading?: boolean;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  folder?: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  title: string;
  url: string;
  visitedAt: string;
}

export interface AppSettings {
  theme: Theme;
  searchProvider: SearchProvider;
  homepage: string;
  downloadDir: string;
  clearOnExit: boolean;
  confirmCloseMultipleTabs: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  searchProvider: "duckduckgo",
  homepage: "dotx://newtab",
  downloadDir: "C:\\Users\\%USERNAME%\\Downloads",
  clearOnExit: false,
  confirmCloseMultipleTabs: true,
};

export function safeUrl(input: string): { ok: boolean; normalized?: string; reason?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, reason: "empty" };
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:")) return { ok: false, reason: "blocked: javascript:" };
  if (lower.startsWith("data:")) return { ok: false, reason: "blocked: data:" };
  if (lower.startsWith("file:")) return { ok: false, reason: "blocked: file:" };
  if (lower.startsWith("vbscript:")) return { ok: false, reason: "blocked: vbscript:" };
  if (lower.startsWith("mailto:") || lower.startsWith("tel:")) return { ok: false, reason: "external protocol requires confirmation" };
  if (trimmed.includes(" ") && !trimmed.includes("://")) return { ok: false, reason: "search query, not URL" };
  try {
    const hasScheme = trimmed.includes("://");
    const candidate = hasScheme ? trimmed : `https://${trimmed}`;
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol)) return { ok: false, reason: `unsupported: ${url.protocol}` };
    if (!url.hostname) return { ok: false, reason: "missing host" };
    return { ok: true, normalized: url.toString() };
  } catch (e) {
    return { ok: false, reason: `invalid: ${e}` };
  }
}

export function toSearchUrl(query: string, provider: SearchProvider = "duckduckgo"): string {
  const q = encodeURIComponent(query);
  switch (provider) {
    case "google": return `https://www.google.com/search?q=${q}`;
    case "bing": return `https://www.bing.com/search?q=${q}`;
    case "brave": return `https://search.brave.com/search?q=${q}`;
    default: return `https://duckduckgo.com/?q=${q}`;
  }
}

export function validateDownloadFileName(name: string): { ok: boolean; reason?: string } {
  if (!name || name.length > 255) return { ok: false, reason: "length 1-255 required" };
  if (name.includes("/") || name.includes("\\") || name.includes("..")) return { ok: false, reason: "path traversal" };
  if (/[\x00-\x1F]/.test(name)) return { ok: false, reason: "control chars" };
  return { ok: true };
}

export function exportBookmarksHtml(bookmarks: Bookmark[]): string {
  const rows = bookmarks.map(b => `<DT><A HREF="${b.url}" ADD_DATE="${Date.parse(b.createdAt)/1000}">${escapeHtml(b.title)}</A>`).join("\n");
  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>DOTX Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n${rows}\n</DL><p>`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
