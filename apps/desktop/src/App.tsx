import { useEffect, useState, useMemo, useRef } from "react";
import { safeUrl, toSearchUrl, validateDownloadFileName, exportBookmarksHtml, DEFAULT_SETTINGS } from "./lib";
import type { Tab, Bookmark, HistoryEntry, AppSettings } from "./lib";

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
  useEffect(() => { setAddressInput(activeTab?.url ?? ""); setNavError(null); }, [activeId, activeTab?.url]);

  const navigate = async (raw: string, opts?: { newTab?: boolean }) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    // If dotx://newtab, just show newtab
    if (trimmed === "dotx://newtab") {
      updateTab(activeId, { url: "dotx://newtab", title: "New Tab" });
      return;
    }
    // Try URL validation
    const res = await tauriValidateUrl(trimmed);
    let target = "";
    let title = "";
    if (res.ok && res.normalized) {
      target = res.normalized;
      title = new URL(target).hostname;
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
      const nt: Tab = { id, title, url: target, history: [target], historyIndex: 0 };
      setTabs(t => [...t, nt]); setActiveId(id); addHistory(title, target);
    } else {
      updateTab(activeId, { url: target, title, history: [...(activeTab?.history.slice(0, (activeTab?.historyIndex ?? 0) + 1) ?? []), target], historyIndex: (activeTab?.historyIndex ?? 0) + 1 });
      addHistory(title, target);
    }
  };

  function updateTab(id: string, patch: Partial<Tab>) {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }
  function closeTab(id: string) {
    if (tabs.length === 1) {
      // Don't close last tab, reset to newtab
      updateTab(id, { url: "dotx://newtab", title: "New Tab", history: ["dotx://newtab"], historyIndex: 0 });
      return;
    }
    const idx = tabs.findIndex(t => t.id === id);
    setTabs(prev => prev.filter(t => t.id !== id));
    if (activeId === id) {
      const next = tabs[idx - 1] ?? tabs[idx + 1] ?? tabs[0];
      if (next) setActiveId(next.id);
    }
  }
  function newTab() {
    const id = `tab-${uid()}`;
    const nt: Tab = { id, title: "New Tab", url: "dotx://newtab", history: ["dotx://newtab"], historyIndex: 0 };
    setTabs(t => [...t, nt]); setActiveId(id);
  }
  function duplicateTab(id: string) {
    const src = tabs.find(t => t.id === id); if (!src) return;
    const nid = `tab-${uid()}`;
    setTabs(t => [...t, { ...src, id: nid, title: src.title + " (copy)" }]); setActiveId(nid);
  }
  function goBack() {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const ni = activeTab.historyIndex - 1;
    updateTab(activeTab.id, { historyIndex: ni, url: activeTab.history[ni], title: activeTab.history[ni].includes("://") ? new URL(activeTab.history[ni]).hostname : "New Tab" });
  }
  function goForward() {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
    const ni = activeTab.historyIndex + 1;
    updateTab(activeTab.id, { historyIndex: ni, url: activeTab.history[ni] });
  }
  function reloadTab() {
    if (!activeTab) return;
    updateTab(activeTab.id, { isLoading: true });
    setTimeout(() => updateTab(activeTab.id, { isLoading: false }), 600);
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
        // Try JSON first, then HTML
        let imported: Bookmark[] = [];
        if (text.trim().startsWith("[")) {
          const j = JSON.parse(text);
          if (Array.isArray(j)) imported = j.filter(x => x.url && x.title).map(x => ({ id: uid(), title: String(x.title).slice(0, 200), url: String(x.url), createdAt: new Date().toISOString() }));
        } else {
          // Simple HTML parse for <A HREF="...">
          const re = /<A\s+HREF="([^"]+)"[^>]*>([^<]+)<\/A>/gi;
          let m: RegExpExecArray | null;
          while ((m = re.exec(text))) {
            imported.push({ id: uid(), title: m[2].slice(0, 200), url: m[1], createdAt: new Date().toISOString() });
          }
        }
        // Validate each
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

  // ── Downloads (mock with validation) ─────────────────────────────────────
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

  const canBack = (activeTab?.historyIndex ?? 0) > 0;
  const canForward = (activeTab?.historyIndex ?? 0) < (activeTab?.history.length ?? 1) - 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#080A12", color: "#EDEEF5", fontFamily: "Inter, system-ui, sans-serif", fontSize: 13 }}>
      {/* Custom titlebar */}
      <div data-tauri-drag-region style={{ height: 36, display: "flex", alignItems: "center", padding: "0 10px", background: "#11131F", borderBottom: "1px solid rgba(255,255,255,0.08)", userSelect: "none" }}>
        <span style={{ width: 24, height: 24, borderRadius: 8, background: "linear-gradient(135deg,#7C5CFF,#2EE6E6)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 11 }}>◈</span>
        <b style={{ marginLeft: 8, fontSize: 12, letterSpacing: 0.2 }}>DOTX</b>
        <span style={{ marginLeft: 8, fontSize: 10, color: "#9AA0B8", letterSpacing: 0.6, textTransform: "uppercase" }}>v0.1.0 Preview</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 6, fontSize: 11, opacity: 0.7 }}>— □ ×</span>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", background: "#0F1220", borderBottom: "1px solid rgba(255,255,255,0.08)", overflowX: "auto" }}>
        {tabs.map(t => (
          <div key={t.id} onClick={() => setActiveId(t.id)} draggable onDragOver={e => e.preventDefault()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: activeId === t.id ? "#1A1E33" : "transparent", color: activeId === t.id ? "#EDEEF5" : "#9AA0B8", cursor: "pointer", minWidth: 140, maxWidth: 220 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: t.url.startsWith("dotx://") ? "#1A1E33" : "#7C5CFF", display: "grid", placeItems: "center", fontSize: 8, color: "white" }}>{t.isLoading ? "◐" : "◈"}</span>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600, fontSize: 12 }}>{t.title}</span>
            <button onClick={e => { e.stopPropagation(); duplicateTab(t.id); }} title="Duplicate" style={iconBtn}>⧉</button>
            <button onClick={e => { e.stopPropagation(); closeTab(t.id); }} title="Close" style={iconBtn}>×</button>
          </div>
        ))}
        <button onClick={newTab} title="New Tab (Ctrl+T)" style={{ ...iconBtn, width: 28, height: 28, borderRadius: 8, background: "#11131F", border: "1px solid rgba(255,255,255,0.08)" }}>＋</button>
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button onClick={() => setPanel(panel === "bookmarks" ? null : "bookmarks")} style={pillBtn(panel === "bookmarks")}>☆ Bookmarks</button>
          <button onClick={() => setPanel(panel === "history" ? null : "history")} style={pillBtn(panel === "history")}>◷ History</button>
          <button onClick={() => setPanel(panel === "downloads" ? null : "downloads")} style={pillBtn(panel === "downloads")}>⬇ Downloads</button>
          <button onClick={() => setPanel(panel === "settings" ? null : "settings")} style={pillBtn(panel === "settings")}>⚙ Settings</button>
        </span>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 6, padding: "8px 10px", background: "#080A12", borderBottom: "1px solid rgba(255,255,255,0.08)", alignItems: "center" }}>
        <button disabled={!canBack} onClick={goBack} title="Back (Alt+←)" style={toolBtn(!canBack)}>←</button>
        <button disabled={!canForward} onClick={goForward} title="Forward (Alt+→)" style={toolBtn(!canForward)}>→</button>
        <button onClick={reloadTab} title="Reload (F5)" style={toolBtn(false)}>↻</button>
        <button onClick={() => navigate("dotx://newtab")} title="Home" style={toolBtn(false)}>⌂</button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#11131F", border: `1px solid ${navError ? "#FF5A52" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: "7px 10px" }}>
          <span style={{ color: "#6B7280", fontSize: 12 }}>{activeTab?.url.startsWith("https") ? "🔒" : activeTab?.url.startsWith("dotx://") ? "◈" : "⚠"}</span>
          <input ref={inputRef} value={addressInput} onChange={e => setAddressInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") navigate(addressInput); }} placeholder="Search or enter address (Ctrl+K)" style={{ flex: 1, background: "transparent", border: 0, outline: 0, color: "#EDEEF5", fontSize: 13 }} />
          {navError && <span title={navError} style={{ color: "#FF5A52", fontSize: 11, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{navError}</span>}
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, background: "#161A2B", border: "1px solid rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 6, color: "#9AA0B8" }}>Ctrl+K</span>
        </div>
        <button onClick={addBookmark} title="Bookmark this tab" style={toolBtn(false)}>☆</button>
        <button onClick={mockDownload} title="Test download validation" style={toolBtn(false)}>⬇</button>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Bookmarks toolbar */}
        {bookmarks.length > 0 && (
          <div style={{ position: "absolute", top: 106, left: 10, right: 10, display: "flex", gap: 6, padding: "4px 0", overflowX: "auto", zIndex: 1 }}>
            {bookmarks.slice(0, 8).map(b => (
              <button key={b.id} onClick={() => navigate(b.url)} title={b.url} style={{ padding: "4px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "#11131F", color: "#9AA0B8", fontSize: 11, whiteSpace: "nowrap", cursor: "pointer" }}>☆ {b.title}</button>
            ))}
          </div>
        )}

        {/* Content placeholder — where WebView2 isolated surface would be */}
        <div style={{ flex: 1, overflow: "auto", padding: 16, paddingTop: bookmarks.length ? 32 : 16, background: "radial-gradient(800px 500px at 50% 0%, rgba(124,92,255,0.12), transparent), #080A12" }}>
          {activeTab?.url === "dotx://newtab" ? (
            <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 12 }}>
              <div style={{ background: "#11131F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7C5CFF,#2EE6E6)", display: "grid", placeItems: "center", color: "white", fontWeight: 800 }}>◈</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>Welcome to DOTX</div>
                    <div style={{ color: "#9AA0B8", fontSize: 12 }}>Fast. Private. Windows-native. — v0.1.0 Preview (isolated WebView2 surface)</div>
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
                  <h3 style={h3}>How tabs work</h3>
                  <p style={p}>Each tab keeps its own history stack. In the full build, each tab is a separate <b>WebView2 child surface</b> — a crashed page never crashes the window. Current MVP uses validated React state + Rust `validate_url` to enforce allow-list (`http/https` only, blocks `javascript:/data:/file:`).</p>
                  <div style={kbdStyle}>Ctrl+T new · Ctrl+W close · Ctrl+K focus</div>
                </div>
                <div style={cardStyle}>
                  <h3 style={h3}>Security boundary</h3>
                  <p style={p}>Privileged UI (this React window) <b>never</b> navigates to the open web. All navigation goes through Rust `validate_url`/`validate_download_path`. No `fs`/`shell` exposed to web content. CSP: `default-src 'self'`.</p>
                  <div style={{ marginTop: 8, padding: 8, borderRadius: 8, background: "#0F1220", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace", fontSize: 11 }}>Blocked: javascript:, data:, file:, vbscript:</div>
                </div>
              </div>

              <div style={{ background: "#11131F", border: "1px solid rgba(124,92,255,0.22)", borderRadius: 12, padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ padding: "4px 8px", borderRadius: 999, background: "rgba(124,92,255,0.14)", border: "1px solid rgba(124,92,255,0.22)", color: "#7C5CFF", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6 }}>Preview</span>
                <span style={{ color: "#9AA0B8", fontSize: 12 }}>Real WebView2 surfaces are scaffolded but require Windows WebView2 runtime testing. This MVP validates all navigation locally before any content load.</span>
                <button onClick={() => setPanel("settings")} style={{ marginLeft: "auto", padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#EDEEF5", cursor: "pointer" }}>Open Settings →</button>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 900, margin: "0 auto", background: "#11131F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#9AA0B8", fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: activeTab?.isLoading ? "#FFB020" : "#2EE6E6", display: "inline-block" }} />
                <span>{activeTab?.isLoading ? "Loading…" : "Isolated surface"}</span>
                <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 11 }}>{activeTab?.url}</span>
              </div>
              <div style={{ marginTop: 12, height: 420, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "#0A0C14", display: "grid", placeItems: "center", padding: 20, textAlign: "center" }}>
                <div>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#7C5CFF,#2EE6E6)", display: "grid", placeItems: "center", margin: "0 auto", color: "white", fontWeight: 800 }}>◈</div>
                  <h3 style={{ margin: "12px 0 6px" }}>{activeTab?.title}</h3>
                  <p style={{ color: "#9AA0B8", maxWidth: 560, margin: "0 auto" }}>
                    In production, this area is a <b>dedicated WebView2 surface</b> (unprivileged) that loads <code style={{ background: "#161A2B", padding: "2px 4px", borderRadius: 4 }}>{activeTab?.url}</code> isolated from the privileged UI.
                    The privileged React window validated the URL via Rust <code>validate_url</code> (allow-list `http/https`) before creating the surface.
                    On this Linux preview build, content is simulated — verify on Windows with WebView2 runtime.
                  </p>
                  <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
                    <button onClick={() => window.open(activeTab?.url, "_blank")} style={primaryBtn}>Open in system browser</button>
                    <button onClick={() => navigate("dotx://newtab")} style={ghostBtn}>Back to New Tab</button>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 11, color: "#6B7280" }}>Security: no <code>javascript:</code> / <code>data:</code> / <code>file:</code> allowed · External protocols require confirmation · Downloads path-traversal blocked</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        {panel && (
          <div style={{ width: 360, borderLeft: "1px solid rgba(255,255,255,0.08)", background: "#0F1220", display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
                  <div style={{ color: "#9AA0B8", fontSize: 11 }}>Downloads are validated via Rust `validate_download_path` (no traversal, absolute dir, sanitized names).</div>
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
                    <div style={{ color: "#9AA0B8", fontSize: 11, marginTop: 4 }}>DOTX v0.1.0 Preview — Tauri 2 + Rust + WebView2 (Windows 10/11). Privileged UI never hosts untrusted content. Updates only via signed GitHub Releases.</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                      <button onClick={() => { localStorage.clear(); location.reload(); }} style={ghostBtn}>Reset all data</button>
                      <button onClick={() => alert("Version 0.1.0 — check GitHub Releases for updates")} style={ghostBtn}>Check for updates</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bookmarks folder export hint */}
      <div style={{ padding: "6px 10px", background: "#0F1220", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8, fontSize: 11, color: "#6B7280" }}>
        <span>WebView2: {(navigator as any).userAgent?.includes("Edg") ? "Evergreen" : "Runtime check on Windows"} · </span>
        <span>Tabs: {tabs.length} · Bookmarks: {bookmarks.length} · History: {history.length}</span>
        <span style={{ marginLeft: "auto" }}>Secure contexts only — <span style={{ color: "#2EE6E6" }}>no privileged IPC exposed to pages</span></span>
      </div>
    </div>
  );
}

// ── styles ──────────────────────────────────────────────────────────────────
const iconBtn: React.CSSProperties = { width: 22, height: 22, borderRadius: 6, border: "1px solid transparent", background: "transparent", color: "#9AA0B8", cursor: "pointer", display: "grid", placeItems: "center", fontSize: 12 };
const pillBtn = (active?: boolean): React.CSSProperties => ({ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.08)", background: active ? "#1A1E33" : "#11131F", color: active ? "#EDEEF5" : "#9AA0B8", cursor: "pointer", fontSize: 12, fontWeight: 600 });
const toolBtn = (disabled?: boolean): React.CSSProperties => ({ width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: disabled ? "#0F1220" : "#11131F", color: disabled ? "#6B7280" : "#EDEEF5", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 });
const primaryBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "#7C5CFF", color: "white", fontWeight: 700, cursor: "pointer" };
const ghostBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#EDEEF5", cursor: "pointer" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "#080A12", color: "#EDEEF5", outline: 0 };
const labelStyle: React.CSSProperties = { display: "grid", gap: 4, fontSize: 12, fontWeight: 600 };
const rowStyle: React.CSSProperties = { display: "flex", gap: 8, alignItems: "center", padding: 8, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "#080A12" };
const emptyStyle: React.CSSProperties = { padding: 12, borderRadius: 10, border: "1px dashed rgba(255,255,255,0.08)", color: "#9AA0B8", textAlign: "center", fontSize: 12 };
const cardStyle: React.CSSProperties = { background: "#0F1220", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12 };
const h3: React.CSSProperties = { margin: "0 0 6px", fontSize: 13 };
const p: React.CSSProperties = { margin: 0, color: "#9AA0B8", fontSize: 12, lineHeight: 1.6 };
const kbdStyle: React.CSSProperties = { marginTop: 8, fontFamily: "JetBrains Mono, monospace", fontSize: 10, background: "#080A12", border: "1px solid rgba(255,255,255,0.08)", padding: "4px 6px", borderRadius: 6, color: "#6B7280" };
