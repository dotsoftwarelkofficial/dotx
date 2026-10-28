// tauriWebview.ts — DOTX real browser surfaces via Tauri 2 multi-webview (unstable)
// Isolated per-tab WebView2 surfaces. Privileged UI (React) never hosts untrusted content.
// Each tab is a child Webview with validate_url gating in Rust. No FS/shell exposure.

export type Bounds = { x: number; y: number; width: number; height: number };

type WebviewCtor = new (win: any, label: string, opts: any) => any;

let currentWindow: any | null = null;
let WebviewClass: WebviewCtor | null = null;
let initializing: Promise<void> | null = null;
let initError: string | null = null;

// registry: label -> webview instance
const registry = new Map<string, any>();

async function ensureTauri(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  // Tauri globals only inside Tauri runtime
  const w = window as any;
  if (!w.__TAURI__ && !(w as any).__TAURI_INTERNALS__) {
    // Try dynamic import to detect without crashing in browser preview
    try {
      // Vite dev server may not have tauri globals
      if (navigator.userAgent.includes("Tauri")) return true;
    } catch {}
    return false;
  }
  return true;
}

async function loadTauriModules(): Promise<void> {
  if (currentWindow && WebviewClass) return;
  if (initializing) return initializing;
  initializing = (async () => {
    try {
      const winMod = await import("@tauri-apps/api/window");
      const webMod = await import("@tauri-apps/api/webview");
      currentWindow = (winMod.getCurrentWindow as any)?.() ?? null;
      // Fallback: Window class
      if (!currentWindow && (winMod as any).Window) {
        try { currentWindow = new (winMod as any).Window("main"); } catch {}
      }
      WebviewClass = (webMod as any).Webview;
      if (!currentWindow) initError = "No Tauri window available";
      if (!WebviewClass) initError = "Webview class unavailable (tauri unstable feature may be missing)";
    } catch (e: any) {
      initError = e?.message ?? String(e);
    }
  })();
  return initializing;
}

export function isTauriRuntime(): boolean {
  try {
    const w = window as any;
    return !!(w.__TAURI__ || w.__TAURI_INTERNALS__ || navigator.userAgent.includes("Tauri"));
  } catch { return false; }
}

export function getTauriInitError(): string | null { return initError; }

async function getOrInit(): Promise<{ win: any; Webview: WebviewCtor } | null> {
  if (!isTauriRuntime()) return null;
  await loadTauriModules();
  if (!currentWindow || !WebviewClass) return null;
  return { win: currentWindow, Webview: WebviewClass };
}

function sanitizeLabel(id: string): string {
  // Tauri labels: a-zA-Z0-9-/_:
  return "tab-" + id.replace(/[^a-zA-Z0-9-_\/:]/g, "-");
}

export async function createTabWebview(tabId: string, url: string, bounds: Bounds): Promise<{ ok: boolean; reason?: string }> {
  const ctx = await getOrInit();
  if (!ctx) return { ok: false, reason: "Not in Tauri runtime" };
  const label = sanitizeLabel(tabId);
  // If exists, hide all others and show existing, or update via recreate
  const existing = registry.get(label);
  if (existing) {
    // If URL differs, we need to navigate — try navigate method, else recreate
    try {
      // Attempt native navigate if available (WebviewWindow style)
      if (typeof existing.navigate === "function") {
        await existing.navigate(url);
        await existing.show?.();
        return { ok: true };
      }
      // Fallback: close and recreate
      try { await existing.close(); } catch {}
      registry.delete(label);
    } catch {}
  }
  try {
    const { win, Webview } = ctx;
    const wv = new Webview(win, label, {
      url,
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
      incognito: false,
      transparent: false,
      focus: true,
    });
    // Wait for creation
    await new Promise<void>((resolve, reject) => {
      let done = false;
      const to = setTimeout(() => { if (!done) { done = true; resolve(); } }, 3000);
      try {
        wv.once?.("tauri://created", () => { if (!done) { done = true; clearTimeout(to); resolve(); } });
        wv.once?.("tauri://error", (e: any) => {
          if (!done) {
            done = true; clearTimeout(to);
            const msg = e?.payload ?? e?.message ?? String(e);
            reject(new Error(String(msg)));
          }
        });
        // Safety: if no events, resolve after timeout
      } catch { clearTimeout(to); resolve(); }
    });
    registry.set(label, wv);
    // Apply auto-resize? Not available without permission, we handle manually
    return { ok: true };
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    // Detect unstable feature not supported
    if (msg.includes("unstable feature") || msg.includes("unstable")) {
      return { ok: false, reason: "unstable feature not supported — rebuild with tauri.features=['unstable'] (see capabilities)" };
    }
    return { ok: false, reason: msg };
  }
}

export async function showTabWebview(tabId: string): Promise<void> {
  const label = sanitizeLabel(tabId);
  const wv = registry.get(label);
  if (!wv) return;
  try { await wv.show?.(); await wv.setFocus?.(); } catch {}
}

export async function hideAllWebviews(): Promise<void> {
  for (const [, wv] of registry) {
    try { await wv.hide?.(); } catch {}
  }
}

export async function hideTabWebview(tabId: string): Promise<void> {
  const wv = registry.get(sanitizeLabel(tabId));
  if (wv) try { await wv.hide?.(); } catch {}
}

export async function closeTabWebview(tabId: string): Promise<void> {
  const label = sanitizeLabel(tabId);
  const wv = registry.get(label);
  if (!wv) return;
  try { await wv.close?.(); } catch { try { await (wv as any).close(); } catch {} }
  registry.delete(label);
}

export async function navigateTabWebview(tabId: string, url: string, bounds: Bounds): Promise<{ ok: boolean; reason?: string }> {
  // Prefer native navigate, else recreate
  const label = sanitizeLabel(tabId);
  const wv = registry.get(label);
  if (wv && typeof wv.navigate === "function") {
    try { await wv.navigate(url); await wv.show?.(); return { ok: true }; } catch (e: any) { /* fall through to recreate */ }
  }
  // Recreate
  if (wv) {
    try { await wv.close(); } catch {}
    registry.delete(label);
  }
  return createTabWebview(tabId, url, bounds);
}

export async function updateBounds(tabId: string, bounds: Bounds): Promise<void> {
  const wv = registry.get(sanitizeLabel(tabId));
  if (!wv) return;
  try {
    const { LogicalPosition, LogicalSize } = await import("@tauri-apps/api/dpi");
    await wv.setPosition?.(new LogicalPosition(Math.round(bounds.x), Math.round(bounds.y)));
    await wv.setSize?.(new LogicalSize(Math.round(bounds.width), Math.round(bounds.height)));
  } catch {
    // Fallback: try physical
    try { await wv.setPosition?.({ x: Math.round(bounds.x), y: Math.round(bounds.y) } as any); } catch {}
    try { await wv.setSize?.({ width: Math.round(bounds.width), height: Math.round(bounds.height) } as any); } catch {}
  }
}

export async function updateAllBounds(boundsMap: Map<string, Bounds>): Promise<void> {
  // Only visible tab needs accurate bounds, but update all to keep in sync
  for (const [tabId, b] of boundsMap) {
    if (registry.has(sanitizeLabel(tabId))) await updateBounds(tabId, b);
  }
}

export async function backTabWebview(tabId: string): Promise<boolean> {
  const wv = registry.get(sanitizeLabel(tabId));
  if (!wv) return false;
  // Try native back
  try {
    if (typeof wv.goBack === "function") { await wv.goBack(); return true; }
    if (typeof wv.back === "function") { await wv.back(); return true; }
    // Fallback via JS eval
    if (typeof wv.eval === "function") { await wv.eval("history.back()"); return true; }
    if (typeof wv.execute === "function") { await wv.execute("history.back()"); return true; }
  } catch {}
  return false;
}

export async function forwardTabWebview(tabId: string): Promise<boolean> {
  const wv = registry.get(sanitizeLabel(tabId));
  if (!wv) return false;
  try {
    if (typeof wv.goForward === "function") { await wv.goForward(); return true; }
    if (typeof wv.forward === "function") { await wv.forward(); return true; }
    if (typeof wv.eval === "function") { await wv.eval("history.forward()"); return true; }
  } catch {}
  return false;
}

export async function reloadTabWebview(tabId: string): Promise<boolean> {
  const wv = registry.get(sanitizeLabel(tabId));
  if (!wv) return false;
  try {
    if (typeof wv.reload === "function") { await wv.reload(); return true; }
    if (typeof wv.eval === "function") { await wv.eval("location.reload()"); return true; }
  } catch {}
  return false;
}

// Helper to compute bounds from DOM element relative to window
export function getElementBounds(el: HTMLElement): Bounds | null {
  const r = el.getBoundingClientRect();
  // getBoundingClientRect gives viewport coords; webview coords are window-local logical pixels
  // Titlebar is part of window, so we can use rect directly
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}
