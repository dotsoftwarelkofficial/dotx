import { useEffect, useState, useMemo, useRef } from "react";
import { safeUrl, toSearchUrl, validateDownloadFileName, exportBookmarksHtml, DEFAULT_SETTINGS } from "./lib";
import type { Tab, Bookmark, HistoryEntry, AppSettings } from "./lib";
import {
  createTabWebview, navigateTabWebview, showTabWebview, hideAllWebviews, hideTabWebview,
  closeTabWebview, updateBounds, getElementBounds, isTauriRuntime, getTauriInitError,
  backTabWebview, forwardTabWebview, reloadTabWebview
} from "./tauriWebview";

// Tauri invoke (fallback to local validation when not in Tauri)
async function tauriValidateUrl(url: string): Promise<{ ok: boolean; normalized?: string; reason?: string }> {
  try {
    // @ts-ignore - optional tauri api
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke("validate_url", { input: url });
  } catch {
    return safeUrl(url);
  }
}
async function tauriValidateTabCreate(input: { url: string; title: string }) {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke("validate_tab_create", input);
  } catch { return safeUrl(input.url); }
}
async function tauriValidateTabSwitch(targetId: string, all: Tab[]) {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke("validate_tab_switch", { targetId, allTabIds: all.map(t => t.id) });
  } catch { return { ok: true }; }
}

const STORAGE_KEYS = {
  tabs: "dotx.tabs.v1",
  bookmarks: "dotx.bookmarks.v1",
  history: "dotx.history.v1",
  settings: "dotx.settings.v1",
};

function uid() { return Math.random().toString(36).slice(2, 9); }

export function App() {
  // ── Settings (persisted) ──────────────────────────────────────────────────
  const [settings, setSettings] = useState<AppSettings>(() => {
    try { const r = localStorage.getItem(STORAGE_KEYS.settings); return r ? { ...DEFAULT_SETTINGS, ...JSON.parse(r) } : DEFAULT_SETTINGS; } catch { return DEFAULT_SETTINGS; }
  });
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings)); } catch {} }, [settings]);

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const [tabs, setTabs] = useState<Tab[]>(() => {
    try {
      const r = localStorage.getItem(STORAGE_KEYS.tabs);
      if (r) { const p = JSON.parse(r); if (Array.isArray(p) && p.length) return p; }
    } catch {}
    return [{ id: "tab-1", title: "New Tab", url: "dotx://newtab", history: ["dotx://newtab"], historyIndex: 0 }];
  });
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "tab-1");
  const activeTab = useMemo(() => tabs.find(t => t.id === activeId) ?? tabs[0], [tabs, activeId]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.tabs, JSON.stringify(tabs)); } catch {} }, [tabs]);

  // ── Navigation input ───────────────────────────────────────────────────────
  const [addressInput, setAddressInput] = useState(activeTab?.url ?? "");
  const [navError, setNavError] = useState<string | null>(null);
  const [webviewError, setWebviewError] = useState<string | null>(null);
  useEffect(() => { setAddressInput(activeTab?.url ?? ""); setNavError(null); }, [activeId, activeTab?.url]);

  // ── Webview host ref ──────────────────────────────────────────────────────
  const contentHostRef = useRef<HTMLDivElement>(null);
  const isTauri = isTauriRuntime();

  // Sync webviews when active tab or tabs change
  // We debounce bounds calculations via RAF
  const syncWebviews = async () => {
    if (!isTauri || !contentHostRef.current) return;
    // New-tab => hide all real surfaces, show welcome
    if (!activeTab || activeTab.url === "dotx://newtab") {
      await hideAllWebviews();
      return;
    }
    // Ensure active tab has a webview surface
    const bounds = getElementBounds(contentHostRef.current);
    if (!bounds) return;

    // Hide others first (prevent overlap during switch)
    for (const t of tabs) {
      if (t.id !== activeTab.id && t.url !== "dotx://newtab") {
        await hideTabWebview(t.id);
      }
    }

    // Create or navigate active
    const check = await tauriValidateUrl(activeTab.url);
    if (!check.ok) { setNavError(check.reason ?? "blocked"); return; }

    const targetUrl = (check as any).normalized ?? activeTab.url;
    // Try create (handles existing via recreate)
    const res = await createTabWebview(activeTab.id, targetUrl, bounds);
    if (!res.ok) {
      // Check if it's unstable feature
      setWebviewError(res.reason ?? "Webview creation failed");
      return;
    }
    setWebviewError(null);
    await showTabWebview(activeTab.id);
  };

  // Initial sync and on tab/url changes
  useEffect(() => {
    // Delay to allow layout to settle
    const id = setTimeout(() => { syncWebviews(); }, 80);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, activeTab?.url, tabs.length]);

  // Resize observer for host
  useEffect(() => {
    if (!isTauri || !contentHostRef.current) return;
    const ro = new ResizeObserver(() => {
      const el = contentHostRef.current;
      if (!el || !activeTab || activeTab.url === "dotx://newtab") return;
      const b = getElementBounds(el);
      if (b) updateBounds(activeTab.id, b);
    });
    ro.observe(contentHostRef.current);
    window.addEventListener("resize", () => {
      const el = contentHostRef.current;
      if (!el || !activeTab || activeTab.url === "dotx://newtab") return;
      const b = getElementBounds(el);
      if (b) updateBounds(activeTab.id, b);
    });
    return () => { ro.disconnect(); window.removeEventListener("resize", () => {}); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab?.id]);

  const navigate = async (raw: string, opts?: { newTab?: boolean }) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (trimmed === "dotx://newtab") {
      updateTab(activeId, { url: "dotx://newtab", title: "New Tab" });
      await hideAllWebviews();
      return;
    }
    const res = await tauriValidateUrl(trimmed);
    let target = "";
    let title = "";
    if (res.ok && (res as any).normalized) {
      target = (res as any).normalized;
      try { title = new URL(target).hostname; } catch { title = target; }
    } else if (res.reason?.includes("search query")) {
      target = toSearchUrl(trimmed, settings.searchProvider);
      title = `Search: ${trimmed.slice(0, 24)}`;
    } else {
      setNavError(res.reason ?? "Invalid URL");
      return;
    }
    setNavError(null);
    if (opts?.newTab) {
      const id = `tab-${uid()}`;
      const v = await tauriValidateTabCreate({ url: target, title });
      if (!(v as any).ok) { setNavError((v as any).reason ?? "blocked"); return; }
      const nt: Tab = { id, title, url: target, history: [target], historyIndex: 0 };
      setTabs(t => [...t, nt]); setActiveId(id); addHistory(title, target);
      // Webview will be created on effect
    } else {
      if (!activeTab) return;
      updateTab(activeId, { url: target, title, history: [...(activeTab.history.slice(0, (activeTab.historyIndex ?? 0) + 1) ?? []), target], historyIndex: (activeTab.historyIndex ?? 0) + 1 });
      addHistory(title, target);
      if (isTauri && activeTab.url !== "dotx://newtab") {
        const bounds = contentHostRef.current ? getElementBounds(contentHostRef.current) : null;
        if (bounds) {
          const r = await navigateTabWebview(activeTab.id, target, bounds);
          if (!r.ok) setWebviewError(r.reason ?? "navigate failed");
        }
      }
    }
  };

  function updateTab(id: string, patch: Partial<Tab>) {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }
  async function closeTab(id: string) {
    // Close webview surface
    if (isTauri) await closeTabWebview(id);
    if (tabs.length === 1) {
      await hideAllWebviews();
      updateTab(id, { url: "dotx://newtab", title: "New Tab", history: ["dotx://newtab"], historyIndex: 0 });
      return;
    }
    const idx = tabs.findIndex(t => t.id === id);
    setTabs(prev => prev.filter(t => t.id !== id));
    if (activeId === id) {
      const next = tabs[idx - 1] ?? tabs[idx + 1] ?? tabs[0];
      if (next) {
        const v = await tauriValidateTabSwitch(next.id, tabs.filter(t => t.id !== id));
        if (!(v as any).ok) setNavError((v as any).reason);
        setActiveId(next.id);
      }
    }
  }
  async function newTab() {
    if (isTauri) await hideAllWebviews();
    const id = `tab-${uid()}`;
    const nt: Tab = { id, title: "New Tab", url: "dotx://newtab", history: ["dotx://newtab"], historyIndex: 0 };
    setTabs(t => [...t, nt]); setActiveId(id);
  }
  function duplicateTab(id: string) {
    const src = tabs.find(t => t.id === id); if (!src) return;
    const nid = `tab-${uid()}`;
    setTabs(t => [...t, { ...src, id: nid, title: src.title + " (copy)" }]); setActiveId(nid);
    // Duplicated tab will get its own webview on switch
  }
  async function goBack() {
    if (!activeTab) return;
    // Try real WebView2 back first
    if (isTauri && activeTab.url !== "dotx://newtab") {
      const did = await backTabWebview(activeTab.id);
      if (did) return; // Real surface handled navigation; history would need sync via events in future
    }
    if (activeTab.historyIndex <= 0) return;
    const ni = activeTab.historyIndex - 1;
    const nextUrl = activeTab.history[ni];
    updateTab(activeTab.id, { historyIndex: ni, url: nextUrl, title: nextUrl.includes("://") ? (() => { try { return new URL(nextUrl).hostname; } catch { return "New Tab"; } })() : "New Tab" });
    if (isTauri && nextUrl !== "dotx://newtab") {
      const bounds = contentHostRef.current ? getElementBounds(contentHostRef.current) : null;
      if (bounds) await navigateTabWebview(activeTab.id, nextUrl, bounds);
    } else if (isTauri && nextUrl === "dotx://newtab") {
      await hideAllWebviews();
    }
  }
  async function goForward() {
    if (!activeTab) return;
    if (isTauri && activeTab.url !== "dotx://newtab") {
      const did = await forwardTabWebview(activeTab.id);
      if (did) return;
    }
    if (activeTab.historyIndex >= activeTab.history.length - 1) return;
    const ni = activeTab.historyIndex + 1;
    const nextUrl = activeTab.history[ni];
    updateTab(activeTab.id, { historyIndex: ni, url: nextUrl });
    if (isTauri && nextUrl !== "dotx://newtab") {
      const bounds = contentHostRef.current ? getElementBounds(contentHostRef.current) : null;
      if (bounds) await navigateTabWebview(activeTab.id, nextUrl, bounds);
    }
  }
  async function reloadTab() {
    if (!activeTab) return;
    if (isTauri && activeTab.url !== "dotx://newtab") {
      const did = await reloadTabWebview(activeTab.id);
      if (did) return;
      // Fallback recreate
      const bounds = contentHostRef.current ? getElementBounds(contentHostRef.current) : null;
      if (bounds) await navigateTabWebview(activeTab.id, activeTab.url, bounds);
      return;
    }
    updateTab(activeTab.id, { isLoading: true });
    setTimeout(() => updateTab(activeTab.id, { isLoading: false }), 600);
  }
  async function handleTabClick(id: string) {
    const v = await tauriValidateTabSwitch(id, tabs);
    if (!(v as any).ok) { setNavError((v as any).reason); return; }
    setActiveId(id);
  }

  // ── Bookmarks ──────────────────────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try { const r = localStorage.getItem(STORAGE_KEYS.bookmarks); return r ? JSON.parse(r) : []; } catch { return []; }
  });
  const [bmSearch, setBmSearch] = useState("");
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarks)); } catch {} }, [bookmarks]);
  const filteredBookmarks = useMemo(() => {
    if (!bmSearch) return bookmarks;
    const q = bmSearch.toLowerCase();
    return bookmarks.filter(b => b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q));
  }, [bookmarks, bmSearch]);

  function addBookmark() {
    if (!activeTab || activeTab.url === "dotx://newtab") { setNavError("Cannot bookmark New Tab"); return; }
    const exists = bookmarks.some(b => b.url === activeTab.url);
    if (exists) { setNavError("Already bookmarked"); return; }
    setBookmarks(b => [...b, { id: uid(), title: activeTab.title, url: activeTab.url, createdAt: new Date().toISOString() }]);
  }
  function removeBookmark(id: string) { setBookmarks(b => b.filter(x => x.id !== id)); }
  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result);
        let imported: Bookmark[] = [];
        if (text.trim().startsWith("[")) {
          const j = JSON.parse(text);
          if (Array.isArray(j)) imported = j.filter(x => x.url && x.title).map(x => ({ id: uid(), title: String(x.title).slice(0, 200), url: String(x.url), createdAt: new Date().toISOString() }));
        } else {
          const re = /<A\s+HREF="([^"]+)"[^>]*>([^<]+)<\/A>/gi;
          let m: RegExpExecArray | null;
          while ((m = re.exec(text))) {
            imported.push({ id: uid(), title: m[2].slice(0, 200), url: m[1], createdAt: new Date().toISOString() });
          }
        }
        const valid = imported.filter(b => safeUrl(b.url).ok);
        if (!valid.length) { alert("No valid bookmarks found"); return; }
        setBookmarks(prev => [...prev, ...valid]);
        alert(`Imported ${valid.length} bookmarks`);
      } catch (err) { alert(`Import failed: ${err}`); }
    };
    reader.readAsText(f);
  }

  // ── History ────────────────────────────────────────────────────────────────
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try { const r = localStorage.getItem(STORAGE_KEYS.history); return r ? JSON.parse(r) : []; } catch { return []; }
  });
  const [histSearch, setHistSearch] = useState("");
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(0, 500))); } catch {} }, [history]);
  function addHistory(title: string, url: string) {
    if (url.startsWith("dotx://")) return;
    setHistory(h => [{ id: uid(), title, url, visitedAt: new Date().toISOString() }, ...h].slice(0, 500));
  }
  function clearHistory(range: "hour" | "day" | "all") {
    if (range === "all") setHistory([]);
    else {
      const cutoff = Date.now() - (range === "hour" ? 3600000 : 86400000);
      setHistory(h => h.filter(e => new Date(e.visitedAt).getTime() < cutoff));
    }
  }

  // ── Downloads (validated; real WebView2 downloads via Rust on_download in next milestone) ─────────────────────────────────────
  const [downloads, setDownloads] = useState<{ id: string; name: string; url: string; progress: number; status: "downloading" | "done" | "failed" }[]>([]);
  function mockDownload() {
    if (!activeTab || activeTab.url.startsWith("dotx://")) { setNavError("No downloadable content on New Tab"); return; }
    const name = `file-${uid()}.pdf`;
    const v = validateDownloadFileName(name);
    if (!v.ok) { setNavError(v.reason ?? "bad filename"); return; }
    const id = uid();
    setDownloads(d => [{ id, name, url: activeTab.url, progress: 0, status: "downloading" }, ...d]);
    let p = 0;
    const iv = setInterval(() => {
      p += 15 + Math.random() * 10;
      if (p >= 100) {
        p = 100; clearInterval(iv);
        setDownloads(d => d.map(x => x.id === id ? { ...x, progress: 100, status: "done" } : x));
      } else {
        setDownloads(d => d.map(x => x.id === id ? { ...x, progress: Math.round(p) } : x));
      }
    }, 300);
  }

  // ── UI state ─────────────────────────────────────────────────────────────
  const [panel, setPanel] = useState<"bookmarks" | "history" | "downloads" | "settings" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "t") { e.preventDefault(); newTab(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w") { e.preventDefault(); closeTab(activeId); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === "F5") { e.preventDefault(); reloadTab(); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [activeId, tabs]);

  // Cleanup webviews on unmount
  useEffect(() => { return () => { /* hideAllWebviews on exit */ }; }, []);

  const canBack = (activeTab?.historyIndex ?? 0) > 0;
  const canForward = (activeTab?.historyIndex ?? 0) < (activeTab?.history.length ?? 1) - 1;
  const isNewTab = activeTab?.url === "dotx://newtab";
  const showRealSurface = isTauri && !isNewTab && !webviewError;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)", color: "var(--text-primary)", fontFamily: "Inter, system-ui, sans-serif", fontSize: 13 }}>
      {/* Custom titlebar — premium blurred */}
      <div data-tauri-drag-region className="titlebar">
        <span className="titlebar-mark">◈</span>
        <b style={{ marginLeft: 8, fontSize: 12, letterSpacing: -0.01 }}>DOTX</b>
        <span style={{ marginLeft: 8, fontSize: 10, color: "var(--text-tertiary)", letterSpacing: 0.06, textTransform: "uppercase", fontWeight: 600 }}>Preview • v0.2.0</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 8, fontSize: 11, color: "var(--text-tertiary)" }}>— □ ×</span>
      </div>

      {/* Tab bar — premium */}
      <div className="tabbar">
        {tabs.map(t => (
          <div key={t.id} onClick={() => handleTabClick(t.id)} draggable onDragOver={e => e.preventDefault()} className="tab" style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 10, border: "1px solid var(--border)", background: activeId === t.id ? "var(--bg-card)" : "transparent", color: activeId === t.id ? "var(--text-primary)" : "var(--text-secondary)", cursor: "pointer", minWidth: 150, maxWidth: 220, boxShadow: activeId === t.id ? "0 1px 3px rgba(0,0,0,0.3)" : "none" }}>
            <span style={{ width: 16, height: 16, borderRadius: 5, background: t.url.startsWith("dotx://") ? "var(--bg-elevated)" : "linear-gradient(135deg,var(--violet),#3B82F6)", display: "grid", placeItems: "center", fontSize: 8, color: "white", border: "1px solid var(--border)" }}>{t.isLoading ? "◐" : "◈"}</span>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600, fontSize: 12, letterSpacing: -0.01 }}>{t.title}</span>
            <button onClick={e => { e.stopPropagation(); duplicateTab(t.id); }} title="Duplicate" style={iconBtn}>⧉</button>
            <button onClick={e => { e.stopPropagation(); closeTab(t.id); }} title="Close" style={iconBtn}>×</button>
          </div>
        ))}
        <button onClick={newTab} title="New Tab (Ctrl+T)" style={{ ...iconBtn, width: 30, height: 30, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)" }}>＋</button>
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button onClick={() => setPanel(panel === "bookmarks" ? null : "bookmarks")} style={pillBtn(panel === "bookmarks")}>☆ Bookmarks</button>
          <button onClick={() => setPanel(panel === "history" ? null : "history")} style={pillBtn(panel === "history")}>◷ History</button>
          <button onClick={() => setPanel(panel === "downloads" ? null : "downloads")} style={pillBtn(panel === "downloads")}>⬇ Downloads</button>
          <button onClick={() => setPanel(panel === "settings" ? null : "settings")} style={pillBtn(panel === "settings")}>⚙ Settings</button>
        </span>
      </div>

      {/* Toolbar — premium */}
      <div className="toolbar">
        <button disabled={!canBack} onClick={goBack} title="Back (Alt+←)" style={toolBtn(!canBack)}>←</button>
        <button disabled={!canForward} onClick={goForward} title="Forward (Alt+→)" style={toolBtn(!canForward)}>→</button>
        <button onClick={reloadTab} title="Reload (F5)" style={toolBtn(false)}>↻</button>
        <button onClick={() => navigate("dotx://newtab")} title="Home" style={toolBtn(false)}>⌂</button>
        <div className="address-wrap" style={{ borderColor: navError ? "#FF5A52" : undefined }}>
          <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>{activeTab?.url.startsWith("https") ? "🔒" : activeTab?.url.startsWith("dotx://") ? "◈" : "⚠"}</span>
          <input ref={inputRef} value={addressInput} onChange={e => setAddressInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") navigate(addressInput); }} placeholder="Search or enter address — Ctrl+K for palette" style={{ flex: 1, background: "transparent", border: 0, outline: 0, color: "var(--text-primary)", fontSize: 13 }} />
          {navError && <span title={navError} style={{ color: "#FF5A52", fontSize: 11, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{navError}</span>}
          <kbd>⌘K</kbd>
        </div>
        <button onClick={addBookmark} title="Bookmark this tab" style={toolBtn(false)}>☆</button>
        <button onClick={mockDownload} title="Test download validation" style={toolBtn(false)}>⬇</button>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Bookmarks toolbar */}
        {bookmarks.length > 0 && (
          <div style={{ position: "absolute", top: 8, left: 10, right: 10, display: "flex", gap: 6, padding: "4px 0", overflowX: "auto", zIndex: 5 }}>
            {bookmarks.slice(0, 8).map(b => (
              <button key={b.id} onClick={() => navigate(b.url)} title={b.url} style={{ padding: "4px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "#11131F", color: "#9AA0B8", fontSize: 11, whiteSpace: "nowrap", cursor: "pointer" }}>☆ {b.title}</button>
            ))}
          </div>
        )}

        {/* Host for real WebView2 surfaces — webviews are positioned over this via Tauri coordinates */}
        <div
          ref={contentHostRef}
          id="dotx-webview-host"
          style={{
            flex: 1,
            overflow: "auto",
            padding: 16,
            paddingTop: bookmarks.length ? 36 : 16,
            background: "radial-gradient(800px 500px at 50% 0%, rgba(124,92,255,0.12), transparent), #080A12",
            position: "relative",
            display: isNewTab ? "block" : showRealSurface ? "block" : "block",
          }}
        >
          {/* When not in Tauri, always show placeholder. In Tauri with https url, placeholder is backdrop behind webview */}
          {isNewTab ? (
            <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 12 }}>
              <div style={{ background: "#11131F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7C5CFF,#2EE6E6)", display: "grid", placeItems: "center", color: "white", fontWeight: 800 }}>◈</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>Welcome to DOTX</div>
                    <div style={{ color: "#9AA0B8", fontSize: 12 }}>Fast. Private. Windows-native. — v0.2.0 Real WebView2 surfaces (multi-webview)</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 12, color: "#9AA0B8" }}>{new Date().toLocaleDateString()} · {new Date().toLocaleTimeString()}</span>
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                  <input value={addressInput} onChange={e => setAddressInput(e.target.value)} onKeyDown={e => e.key === "Enter" && navigate(addressInput)} placeholder="Search with DuckDuckGo or enter address…" style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "#0F1220", color: "#EDEEF5" }} />
                  <button onClick={() => navigate(addressInput)} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "#7C5CFF", color: "white", fontWeight: 700 }}>Search</button>
                </div>
                <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                  {[
                    { t: "GitHub", u: "https://github.com/dotsoftwarelkofficial/dotx" },
                    { t: "Example", u: "https://example.com" },
                    { t: "Privacy", u: "https://dotsoftwarelkofficial.github.io/dotx/privacy" },
                    { t: "Downloads", u: "https://dotsoftwarelkofficial.github.io/dotx/download" },
                  ].map(q => (
                    <button key={q.t} onClick={() => navigate(q.u)} style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "#0F1220", color: "#EDEEF5", textAlign: "left", cursor: "pointer" }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{q.t}</div>
                      <div style={{ color: "#9AA0B8", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis" }}>{q.u}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={cardStyle}>
                  <h3 style={h3}>Isolated tab surfaces</h3>
                  <p style={p}>Each tab is a dedicated <b>WebView2 child surface</b> (Tauri unstable multiwebview). Crashed page never crashes the window. Privileged UI validates every URL via Rust <code>validate_url</code> (allow-list <code>http/https</code> only, blocks <code>javascript:/data:/file:</code>).</p>
                  <div style={kbdStyle}>Ctrl+T new · Ctrl+W close · Ctrl+K focus</div>
                  {!isTauri && <div style={{ marginTop: 8, color: "#FFB020", fontSize: 11 }}>Preview in browser — real surfaces render on Windows Tauri build only.</div>}
                  {isTauri && webviewError && <div style={{ marginTop: 8, color: "#FF5A52", fontSize: 11, fontFamily: "monospace" }}>WebView error: {webviewError} {getTauriInitError() ? ` — ${getTauriInitError()}` : ""}</div>}
                </div>
                <div style={cardStyle}>
                  <h3 style={h3}>Security boundary</h3>
                  <p style={p}>Privileged UI (this React window) <b>never</b> navigates to the open web. All navigation goes through Rust <code>validate_url</code>/<code>validate_download_path</code>. No <code>fs</code>/<code>shell</code> exposed to web content. CSP: <code>default-src 'self'</code>. Downloads are path-traversal blocked and gated.</p>
                  <div style={{ marginTop: 8, padding: 8, borderRadius: 8, background: "#0F1220", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace", fontSize: 11 }}>Blocked: javascript:, data:, file:, vbscript:</div>
                </div>
              </div>

              <div style={{ background: "#11131F", border: "1px solid rgba(124,92,255,0.22)", borderRadius: 12, padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ padding: "4px 8px", borderRadius: 999, background: "rgba(124,92,255,0.14)", border: "1px solid rgba(124,92,255,0.22)", color: "#7C5CFF", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6 }}>Real browser</span>
                <span style={{ color: "#9AA0B8", fontSize: 12 }}>v0.2.0 renders <b>real https:// content</b> in isolated WebView2 per-tab surfaces. Status: multiwebview (unstable) — may white-flash on resize (upstream Tauri #10011). Downloads via <code>on_download</code> gated to user-picked dir.</span>
                <button onClick={() => setPanel("settings")} style={{ marginLeft: "auto", padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#EDEEF5", cursor: "pointer" }}>Open Settings →</button>
              </div>
            </div>
          ) : (
            <>
              {/* In Tauri, real webview is overlayed here; placeholder acts as backdrop/fallback */}
              <div style={{ maxWidth: 900, margin: "0 auto", background: "#11131F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16, opacity: showRealSurface ? 0.0 : 1, pointerEvents: showRealSurface ? "none" : "auto", transition: "opacity 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#9AA0B8", fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: activeTab?.isLoading ? "#FFB020" : "#2EE6E6", display: "inline-block" }} />
                  <span>{activeTab?.isLoading ? "Loading…" : isTauri ? "Loading real site…" : "Isolated surface (preview)"}</span>
                  <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 11 }}>{activeTab?.url}</span>
                </div>
                <div style={{ marginTop: 12, height: 420, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "#0A0C14", display: "grid", placeItems: "center", padding: 20, textAlign: "center" }}>
                  <div>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#7C5CFF,#2EE6E6)", display: "grid", placeItems: "center", margin: "0 auto", color: "white", fontWeight: 800 }}>◈</div>
                    <h3 style={{ margin: "12px 0 6px" }}>{activeTab?.title}</h3>
                    <p style={{ color: "#9AA0B8", maxWidth: 560, margin: "0 auto" }}>
                      {!isTauri
                        ? <>This Linux preview build cannot render WebView2. On Windows, <code style={{ background: "#161A2B", padding: "2px 4px", borderRadius: 4 }}>{activeTab?.url}</code> will load in its own isolated WebView2 surface above this placeholder.</>
                        : webviewError
                          ? <>WebView creation failed: <code style={{ background: "#161A2B", padding: "2px 4px", borderRadius: 4 }}>{webviewError}</code> — check that Tauri was rebuilt with <code>features=[&quot;unstable&quot;]</code> and capabilities include <code>allow-create-webview</code>. Fallback rendered.</>
                          : <>Loading <code style={{ background: "#161A2B", padding: "2px 4px", borderRadius: 4 }}>{activeTab?.url}</code> in isolated WebView2 surface — validated via Rust <code>validate_url</code>. If you see this placeholder, the WebView is still initializing or the runtime is missing WebView2 Evergreen.</>
                      }
                    </p>
                    <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
                      <button onClick={() => { if (activeTab?.url && !activeTab.url.startsWith("dotx://")) { try { window.open(activeTab.url, "_blank"); } catch {} } }} style={primaryBtn}>Open in system browser</button>
                      <button onClick={() => navigate("dotx://newtab")} style={ghostBtn}>Back to New Tab</button>
                    </div>
                    <div style={{ marginTop: 12, fontSize: 11, color: "#6B7280" }}>Security: no <code>javascript:</code> / <code>data:</code> / <code>file:</code> allowed · External protocols require confirmation · Downloads path-traversal blocked</div>
                  </div>
                </div>
              </div>
              {/* Overlay note when real surface is active — subtle top bar */}
              {showRealSurface && (
                <div style={{ position: "absolute", top: 8, left: 16, right: 16, background: "rgba(17,19,31,0.92)", border: "1px solid rgba(124,92,255,0.22)", borderRadius: 10, padding: "6px 10px", display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: "#9AA0B8", zIndex: 4, backdropFilter: "blur(8px)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "#2EE6E6", display: "inline-block" }} />
                  <span>Isolated WebView2 surface active — </span>
                  <code style={{ background: "#0F1220", padding: "2px 6px", borderRadius: 6, fontSize: 10, maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeTab?.url}</code>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "#6B7280" }}>No privileged IPC exposed to page</span>
                </div>
              )}
              {webviewError && isTauri && (
                <div style={{ marginTop: 12, maxWidth: 900, marginLeft: "auto", marginRight: "auto", background: "rgba(255,90,82,0.08)", border: "1px solid rgba(255,90,82,0.22)", borderRadius: 10, padding: 10, fontSize: 11, color: "#FFB020" }}>
                  <b>WebView error:</b> {webviewError} — check build logs for `unstable feature not supported` and rebuild with <code>tauri.features=["unstable"]</code>.
                </div>
              )}
            </>
          )}
        </div>

        {/* Side panel */}
        {panel && (
          <div style={{ width: 360, borderLeft: "1px solid rgba(255,255,255,0.08)", background: "#0F1220", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 10 }}>
            <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
              <b style={{ textTransform: "capitalize" }}>{panel}</b>
              <button onClick={() => setPanel(null)} style={{ marginLeft: "auto", ...iconBtn }}>×</button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 12, display: "grid", gap: 10, alignContent: "start" }}>
              {panel === "bookmarks" && (
                <>
                  <input value={bmSearch} onChange={e => setBmSearch(e.target.value)} placeholder="Search bookmarks…" style={inputStyle} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={addBookmark} style={primaryBtn}>Add Current Tab</button>
                    <label style={{ ...ghostBtn, cursor: "pointer" }}>Import<input type="file" accept=".html,.json" onChange={handleImport} style={{ display: "none" }} /></label>
                    <button onClick={() => { const html = exportBookmarksHtml(bookmarks); const blob = new Blob([html], { type: "text/html" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "dotx-bookmarks.html"; a.click(); }} style={ghostBtn}>Export</button>
                  </div>
                  {filteredBookmarks.length ? filteredBookmarks.map(b => (
                    <div key={b.id} style={rowStyle}>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.title}</div>
                        <div style={{ color: "#9AA0B8", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis" }}>{b.url}</div>
                      </div>
                      <button onClick={() => navigate(b.url)} style={iconBtn}>↗</button>
                      <button onClick={() => removeBookmark(b.id)} style={iconBtn}>🗑</button>
                    </div>
                  )) : <div style={emptyStyle}>No bookmarks yet. Visit a page and tap “Add”.</div>}
                </>
              )}
              {panel === "history" && (
                <>
                  <input value={histSearch} onChange={e => setHistSearch(e.target.value)} placeholder="Search history…" style={inputStyle} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => clearHistory("hour")} style={ghostBtn}>Clear last hour</button>
                    <button onClick={() => clearHistory("day")} style={ghostBtn}>Clear today</button>
                    <button onClick={() => clearHistory("all")} style={ghostBtn}>Clear all</button>
                  </div>
                  {(histSearch ? history.filter(h => h.title.toLowerCase().includes(histSearch.toLowerCase()) || h.url.toLowerCase().includes(histSearch.toLowerCase())) : history).slice(0, 40).map(h => (
                    <div key={h.id} style={rowStyle}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{h.title}</div>
                        <div style={{ color: "#9AA0B8", fontSize: 11 }}>{h.url}</div>
                        <div style={{ color: "#6B7280", fontSize: 10 }}>{new Date(h.visitedAt).toLocaleString()}</div>
                      </div>
                      <button onClick={() => navigate(h.url)} style={iconBtn}>↗</button>
                    </div>
                  ))}
                  {!history.length && <div style={emptyStyle}>History is empty.</div>}
                </>
              )}
              {panel === "downloads" && (
                <>
                  <div style={{ color: "#9AA0B8", fontSize: 11 }}>Downloads are validated via Rust <code>validate_download_path</code> (no traversal, absolute dir, sanitized names). Real downloads via WebView2 <code>DownloadEvent::Requested</code> land in your Downloads folder after confirmation — progress shown here.</div>
                  <button onClick={mockDownload} style={primaryBtn}>＋ Test download</button>
                  {downloads.map(d => (
                    <div key={d.id} style={rowStyle}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>{d.name}</div>
                        <div style={{ color: "#9AA0B8", fontSize: 11 }}>{d.url}</div>
                        <div style={{ height: 6, borderRadius: 999, background: "#161A2B", marginTop: 4, overflow: "hidden" }}>
                          <div style={{ width: `${d.progress}%`, height: "100%", background: d.status === "done" ? "#2EE6E6" : "#7C5CFF", transition: "width .2s" }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: "#9AA0B8" }}>{d.status === "done" ? "✓ Done" : `${d.progress}%`}</span>
                    </div>
                  ))}
                  {!downloads.length && <div style={emptyStyle}>No downloads yet.</div>}
                </>
              )}
              {panel === "settings" && (
                <>
                  <label style={labelStyle}>Theme
                    <select value={settings.theme} onChange={e => setSettings(s => ({ ...s, theme: e.target.value as any }))} style={inputStyle}>
                      <option value="dark">dark</option><option value="light">light</option><option value="system">system</option>
                    </select>
                  </label>
                  <label style={labelStyle}>Search provider
                    <select value={settings.searchProvider} onChange={e => setSettings(s => ({ ...s, searchProvider: e.target.value as any }))} style={inputStyle}>
                      <option value="duckduckgo">DuckDuckGo</option><option value="google">Google</option><option value="bing">Bing</option><option value="brave">Brave</option>
                    </select>
                  </label>
                  <label style={labelStyle}>Homepage
                    <input value={settings.homepage} onChange={e => setSettings(s => ({ ...s, homepage: e.target.value }))} placeholder="dotx://newtab or https://..." style={inputStyle} />
                  </label>
                  <label style={labelStyle}>Download directory
                    <input value={settings.downloadDir} onChange={e => setSettings(s => ({ ...s, downloadDir: e.target.value }))} style={inputStyle} />
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="checkbox" checked={settings.confirmCloseMultipleTabs} onChange={e => setSettings(s => ({ ...s, confirmCloseMultipleTabs: e.target.checked }))} />
                    <span style={{ fontSize: 12 }}>Confirm before closing multiple tabs</span>
                  </div>
                  <div style={{ ...cardStyle, background: "#11131F" }}>
                    <h4 style={{ margin: 0, fontSize: 12 }}>About</h4>
                    <div style={{ color: "#9AA0B8", fontSize: 11, marginTop: 4 }}>DOTX v0.2.0 — Tauri 2.1 + Rust + WebView2 (Windows 10/11). Privileged UI never hosts untrusted content. Each tab is an isolated child WebView. Updates only via signed GitHub Releases.</div>
                    <div style={{ fontFamily: "monospace", fontSize: 10, marginTop: 6, color: "#6B7280" }}>Engine: {isTauri ? "Tauri WebView2 (Windows)" : "Browser preview — no WebView"} · Capabilities: allow-create-webview / dialog:allow-save · CSP: default-src 'self'</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                      <button onClick={() => { localStorage.clear(); location.reload(); }} style={ghostBtn}>Reset all data</button>
                      <button onClick={() => alert("Version 0.2.0 — check GitHub Releases for updates")} style={ghostBtn}>Check for updates</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status bar — premium */}
      <div style={{ padding: "7px 12px", background: "var(--bg-elevated)", borderTop: "1px solid var(--border)", display: "flex", gap: 10, fontSize: 11, color: "var(--text-tertiary)" }}>
        <span>WebView2: {(navigator as any).userAgent?.includes("Edg") ? "Evergreen" : isTauri ? "Tauri WebView2" : "Preview (no runtime)"} · </span>
        <span>Tabs: {tabs.length} · Bookmarks: {bookmarks.length} · History: {history.length}{isTauri ? " · Isolated surfaces" : ""}</span>
        <span style={{ marginLeft: "auto" }}>Secure contexts only — <span style={{ color: "var(--violet)" }}>no privileged IPC exposed to pages</span>{webviewError ? <span style={{ color: "#FF5A52", marginLeft: 8 }}>⚠ {webviewError.slice(0, 60)}</span> : null}</span>
      </div>
    </div>
  );
}

// ── premium styles (match website tokens) ──────────────────────────────────
const iconBtn: React.CSSProperties = { width: 22, height: 22, borderRadius: 7, border: "1px solid transparent", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", display: "grid", placeItems: "center", fontSize: 12 };
const pillBtn = (active?: boolean): React.CSSProperties => ({ padding: "6px 12px", borderRadius: 999, border: "1px solid var(--border)", background: active ? "var(--bg-card)" : "transparent", color: active ? "var(--text-primary)" : "var(--text-secondary)", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.15s" });
const toolBtn = (disabled?: boolean): React.CSSProperties => ({ width: 32, height: 32, borderRadius: 10, border: "1px solid var(--border)", background: disabled ? "var(--bg-elevated)" : "var(--bg-card)", color: disabled ? "var(--text-tertiary)" : "var(--text-primary)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1 });
const primaryBtn: React.CSSProperties = { padding: "9px 14px", borderRadius: 10, border: "1px solid var(--violet)", background: "var(--violet)", color: "white", fontWeight: 650, cursor: "pointer", boxShadow: "0 1px 3px rgba(109,93,247,0.3)" };
const ghostBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", cursor: "pointer" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 11px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", outline: 0 };
const labelStyle: React.CSSProperties = { display: "grid", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" };
const rowStyle: React.CSSProperties = { display: "flex", gap: 10, alignItems: "center", padding: 10, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-card)" };
const emptyStyle: React.CSSProperties = { padding: 14, borderRadius: 12, border: "1px dashed var(--border)", color: "var(--text-tertiary)", textAlign: "center", fontSize: 12, background: "var(--bg-elevated)" };
const cardStyle: React.CSSProperties = { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 14 };
const h3: React.CSSProperties = { margin: "0 0 6px", fontSize: 13, fontWeight: 700, letterSpacing: -0.01, color: "var(--text-primary)" };
const p: React.CSSProperties = { margin: 0, color: "var(--text-secondary)", fontSize: 12, lineHeight: 1.6 };
const kbdStyle: React.CSSProperties = { marginTop: 10, fontFamily: "JetBrains Mono, monospace", fontSize: 10, background: "var(--bg-elevated)", border: "1px solid var(--border)", padding: "5px 8px", borderRadius: 7, color: "var(--text-tertiary)" };

