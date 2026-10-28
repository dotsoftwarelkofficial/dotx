import { useState } from "react";

export function App() {
  const [url, setUrl] = useState("https://example.com");
  const [tabs, setTabs] = useState([{ id: "1", title: "New Tab", url: "dotx://newtab" }]);
  const [active, setActive] = useState("1");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0A0C14", color: "#EDEEF5", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Titlebar */}
      <div style={{ height: 36, display: "flex", alignItems: "center", padding: "0 12px", background: "#11131F", borderBottom: "1px solid rgba(255,255,255,0.08)", WebkitAppRegion: "drag" as unknown as string }}>
        <span style={{ width: 22, height: 22, borderRadius: 7, background: "linear-gradient(135deg,#7C5CFF,#2EE6E6)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800 }}>◈</span>
        <span style={{ marginLeft: 8, fontWeight: 700, fontSize: 13 }}>DOTX</span>
        <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.6 }}>— □ ×</span>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, padding: "8px 10px", background: "#0F1220", borderBottom: "1px solid rgba(255,255,255,0.08)", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} style={{ padding: "6px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: active === t.id ? "#1A1E33" : "transparent", color: "#EDEEF5", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {t.title}
          </button>
        ))}
        <button onClick={() => { const id = Date.now().toString(); setTabs([...tabs, { id, title: "New Tab", url: "dotx://newtab" }]); setActive(id); }} style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#9AA0B8", cursor: "pointer" }}>＋</button>
      </div>

      {/* Address bar */}
      <div style={{ display: "flex", gap: 8, padding: 10, background: "#0A0C14", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button style={btnStyle}>←</button>
        <button style={btnStyle}>→</button>
        <button style={btnStyle}>↻</button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#11131F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 12px" }}>
          <span style={{ color: "#6B7280" }}>🔒</span>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Search or enter address" style={{ flex: 1, background: "transparent", border: 0, outline: 0, color: "#EDEEF5", fontSize: 13 }} />
          <span style={{ fontFamily: "monospace", fontSize: 11, background: "#161A2B", border: "1px solid rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 6 }}>Ctrl+K</span>
        </div>
      </div>

      {/* Content surface — WebView2 isolated surface would host real web content here */}
      <div style={{ flex: 1, padding: 24, overflow: "auto", background: "radial-gradient(600px 400px at 50% 0%, rgba(124,92,255,0.12), transparent), #080A12" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", background: "#11131F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>DOTX Desktop — MVP Shell</h2>
          <p style={{ color: "#9AA0B8", fontSize: 13, lineHeight: 1.6 }}>
            This React shell runs inside the privileged Tauri window. Real web content loads in a separate, isolated WebView2 child surface
            (configured in <code>src-tauri/tauri.conf.json</code>). The privileged UI never navigates directly to the open web.
          </p>
          <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: "#0F1220", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace", fontSize: 12 }}>
            Rust backend: src-tauri/src/main.rs<br />
            IPC commands: nav::validate_url, tabs::create, bookmarks::add<br />
            Security: allowlist http/https, block javascript:/data:/file:
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button style={{ ...btnPrimary }}>Open example.com in isolated view</button>
            <button style={btnGhost}>Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = { width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "#11131F", color: "#EDEEF5", cursor: "pointer" };
const btnPrimary: React.CSSProperties = { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "#7C5CFF", color: "white", fontWeight: 600, cursor: "pointer" };
const btnGhost: React.CSSProperties = { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#EDEEF5", fontWeight: 600, cursor: "pointer" };
