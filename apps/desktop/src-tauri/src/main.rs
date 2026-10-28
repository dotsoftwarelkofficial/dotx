// DOTX Desktop — Tauri 2 + Rust backend (v0.2.0 Real Browser)
// Security: privileged UI isolated, webviews are unprivileged, IPC narrow.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use url::Url;
use std::path::{Path, PathBuf};

// ── URL validation ──────────────────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize)]
pub struct ValidateResult {
    pub ok: bool,
    pub normalized: Option<String>,
    pub reason: Option<String>,
}

#[tauri::command]
fn validate_url(input: String) -> ValidateResult {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return ValidateResult { ok: false, normalized: None, reason: Some("empty input".into()) };
    }
    let lower = trimmed.to_lowercase();
    for blocked in ["javascript:", "data:", "file:", "vbscript:", "blob:"] {
        if lower.starts_with(blocked) {
            return ValidateResult { ok: false, normalized: None, reason: Some(format!("blocked scheme: {}", blocked.trim_end_matches(':'))) };
        }
    }
    if lower.starts_with("mailto:") || lower.starts_with("tel:") || lower.starts_with("ms-") {
        return ValidateResult { ok: false, normalized: None, reason: Some("external protocol requires confirmation".into()) };
    }
    let has_scheme = trimmed.contains("://") || trimmed.contains(':');
    if !has_scheme && trimmed.contains(' ') {
        return ValidateResult { ok: false, normalized: None, reason: Some("search query, not URL".into()) };
    }
    let candidate = if trimmed.contains("://") {
        trimmed.to_string()
    } else if has_scheme {
        return ValidateResult { ok: false, normalized: None, reason: Some("unsupported protocol".into()) };
    } else {
        format!("https://{}", trimmed)
    };
    match Url::parse(&candidate) {
        Ok(u) if matches!(u.scheme(), "http" | "https") => {
            if u.host_str().is_none() || u.host_str().unwrap().is_empty() {
                return ValidateResult { ok: false, normalized: None, reason: Some("missing host".into()) };
            }
            ValidateResult { ok: true, normalized: Some(u.to_string()), reason: None }
        },
        Ok(u) => ValidateResult { ok: false, normalized: None, reason: Some(format!("unsupported scheme: {}", u.scheme())) },
        Err(e) => ValidateResult { ok: false, normalized: None, reason: Some(format!("invalid url: {}", e)) },
    }
}

// ── Download path validation ───────────────────────────────────────────────
#[derive(Serialize, Deserialize)]
pub struct PathValidateResult {
    pub ok: bool,
    pub sanitized: Option<String>,
    pub reason: Option<String>,
}

#[tauri::command]
fn validate_download_path(file_name: String, download_dir: String) -> PathValidateResult {
    if file_name.contains('/') || file_name.contains('\\') || file_name.contains("..") {
        return PathValidateResult { ok: false, sanitized: None, reason: Some("path traversal detected in file name".into()) };
    }
    let trimmed = file_name.trim();
    if trimmed.is_empty() || trimmed.len() > 255 {
        return PathValidateResult { ok: false, sanitized: None, reason: Some("invalid file name length".into()) };
    }
    let dir = Path::new(&download_dir);
    if !dir.is_absolute() {
        return PathValidateResult { ok: false, sanitized: None, reason: Some("download directory must be absolute".into()) };
    }
    let sanitized = trimmed.chars().filter(|c| !c.is_control()).collect::<String>();
    if sanitized != trimmed {
        return PathValidateResult { ok: false, sanitized: Some(sanitized), reason: Some("control characters removed".into()) };
    }
    let full = dir.join(&sanitized);
    if !full.starts_with(dir) {
        return PathValidateResult { ok: false, sanitized: None, reason: Some("path escapes download directory".into()) };
    }
    PathValidateResult { ok: true, sanitized: Some(full.to_string_lossy().to_string()), reason: None }
}

// ── Tab lifecycle validation (for tests) ────────────────────────────────────
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TabMeta {
    pub id: String,
    pub url: String,
    pub title: String,
}

#[tauri::command]
fn validate_tab_create(url: String) -> ValidateResult {
    if url == "dotx://newtab" {
        return ValidateResult { ok: true, normalized: Some(url), reason: None };
    }
    validate_url(url)
}

#[tauri::command]
fn validate_tab_switch(tabs: Vec<TabMeta>, target_id: String) -> ValidateResult {
    if tabs.iter().any(|t| t.id == target_id) {
        ValidateResult { ok: true, normalized: Some(target_id), reason: None }
    } else {
        ValidateResult { ok: false, normalized: None, reason: Some(format!("tab {} not found", target_id)) }
    }
}

// ── Bookmark ────────────────────────────────────────────────────────────────
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Bookmark {
    pub id: String,
    pub title: String,
    pub url: String,
    pub folder: Option<String>,
    pub created_at: String,
}

#[tauri::command]
fn validate_bookmark(title: String, url: String) -> ValidateResult {
    if title.trim().is_empty() || title.len() > 200 {
        return ValidateResult { ok: false, normalized: None, reason: Some("title must be 1-200 chars".into()) };
    }
    validate_url(url)
}

// ── Settings ────────────────────────────────────────────────────────────────
#[derive(Serialize, Deserialize, Debug)]
pub struct Settings {
    pub theme: String,
    pub search_provider: String,
    pub homepage: String,
    pub download_dir: Option<String>,
}

#[tauri::command]
fn validate_settings(settings: Settings) -> ValidateResult {
    let allowed_themes = ["dark", "light", "system"];
    if !allowed_themes.contains(&settings.theme.as_str()) {
        return ValidateResult { ok: false, normalized: None, reason: Some(format!("invalid theme: {}", settings.theme)) };
    }
    let allowed_providers = ["duckduckgo", "google", "bing", "brave", "custom"];
    if !allowed_providers.contains(&settings.search_provider.as_str()) {
        return ValidateResult { ok: false, normalized: None, reason: Some(format!("invalid search provider: {}", settings.search_provider)) };
    }
    if !settings.homepage.is_empty() {
        let r = validate_url(settings.homepage.clone());
        if !r.ok {
            return ValidateResult { ok: false, normalized: None, reason: Some(format!("invalid homepage: {:?}", r.reason)) };
        }
    }
    if let Some(dir) = &settings.download_dir {
        let p = Path::new(dir);
        if !p.is_absolute() {
            return ValidateResult { ok: false, normalized: None, reason: Some("download_dir must be absolute".into()) };
        }
    }
    ValidateResult { ok: true, normalized: Some("settings valid".into()), reason: None }
}

#[tauri::command]
fn app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

// ── Download helpers ────────────────────────────────────────────────────────
#[derive(Serialize, Deserialize, Debug)]
pub struct DownloadValidate {
    pub url: String,
    pub filename: String,
}

#[tauri::command]
fn validate_download_request(url: String, filename: String) -> ValidateResult {
    let u = validate_url(url.clone());
    if !u.ok {
        return u;
    }
    let p = validate_download_path(filename.clone(), "/tmp".into());
    if !p.ok {
        return ValidateResult { ok: false, normalized: None, reason: p.reason };
    }
    ValidateResult { ok: true, normalized: Some(format!("{} -> {}", url, filename)), reason: None }
}

// ── Main ────────────────────────────────────────────────────────────────────
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            validate_url,
            validate_download_path,
            validate_bookmark,
            validate_settings,
            validate_tab_create,
            validate_tab_switch,
            validate_download_request,
            app_version,
            get_platform
        ])
        .run(tauri::generate_context!())
        .expect("failed to run DOTX");
}

// ── Tests ───────────────────────────────────────────────────────────────────
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_url_ok() {
        let r = validate_url("example.com".into());
        assert!(r.ok);
        assert_eq!(r.normalized.unwrap(), "https://example.com/");
        let r = validate_url("https://example.com/path?q=1".into());
        assert!(r.ok);
    }

    #[test]
    fn test_validate_url_blocks_javascript() {
        let r = validate_url("javascript:alert(1)".into());
        assert!(!r.ok);
        assert!(r.reason.unwrap().contains("blocked"));
        let r = validate_url("JaVaScRiPt:alert(1)".into());
        assert!(!r.ok);
    }

    #[test]
    fn test_validate_url_blocks_data_file() {
        assert!(!validate_url("data:text/html,hi".into()).ok);
        assert!(!validate_url("file:///etc/passwd".into()).ok);
        assert!(!validate_url("vbscript:msgbox".into()).ok);
    }

    #[test]
    fn test_validate_url_external_protocol() {
        let r = validate_url("mailto:test@example.com".into());
        assert!(!r.ok);
        assert!(r.reason.unwrap().contains("external protocol"));
    }

    #[test]
    fn test_validate_url_rejects_search_query() {
        let r = validate_url("hello world how are you".into());
        assert!(!r.ok);
    }

    #[test]
    fn test_validate_url_https_required() {
        assert!(validate_url("https://rust-lang.org".into()).ok);
        assert!(validate_url("http://example.com".into()).ok);
        assert!(!validate_url("ftp://example.com".into()).ok);
    }

    // ── Tab lifecycle ─────────────────────────────────────────────────────
    #[test]
    fn test_tab_create_newtab() {
        assert!(validate_tab_create("dotx://newtab".into()).ok);
        assert!(validate_tab_create("https://example.com".into()).ok);
        assert!(!validate_tab_create("javascript:alert(1)".into()).ok);
        assert!(!validate_tab_create("".into()).ok);
    }

    #[test]
    fn test_tab_switch_valid() {
        let tabs = vec![
            TabMeta { id: "a".into(), url: "https://a.com".into(), title: "A".into() },
            TabMeta { id: "b".into(), url: "https://b.com".into(), title: "B".into() },
        ];
        assert!(validate_tab_switch(tabs.clone(), "a".into()).ok);
        assert!(validate_tab_switch(tabs.clone(), "b".into()).ok);
        assert!(!validate_tab_switch(tabs, "missing".into()).ok);
    }

    #[test]
    fn test_tab_switch_empty() {
        let tabs: Vec<TabMeta> = vec![];
        assert!(!validate_tab_switch(tabs, "a".into()).ok);
    }

    // ── Downloads ──────────────────────────────────────────────────────────
    #[test]
    fn test_validate_download_request_ok() {
        let r = validate_download_request("https://example.com/file.pdf".into(), "file.pdf".into());
        assert!(r.ok);
    }

    #[test]
    fn test_validate_download_request_blocked_url() {
        let r = validate_download_request("javascript:alert(1)".into(), "file.pdf".into());
        assert!(!r.ok);
    }

    #[test]
    fn test_validate_download_request_bad_filename() {
        let r = validate_download_request("https://example.com/a.pdf".into(), "../evil.exe".into());
        assert!(!r.ok);
        assert!(r.reason.unwrap().contains("traversal") || r.reason.unwrap().contains("path"));
        let r2 = validate_download_request("https://example.com/a.pdf".into(), "".into());
        assert!(!r2.ok);
    }

    #[test]
    fn test_validate_download_path_ok() {
        let r = validate_download_path("report.pdf".into(), "C:\\Users\\Test\\Downloads".into());
        if cfg!(windows) {
            assert!(r.ok);
        } else {
            let r2 = validate_download_path("report.pdf".into(), "/tmp/downloads".into());
            assert!(r2.ok);
        }
    }

    #[test]
    fn test_validate_download_path_traversal() {
        let r = validate_download_path("../evil.exe".into(), "/tmp".into());
        assert!(!r.ok);
        let r = validate_download_path("a/b/c".into(), "/tmp".into());
        assert!(!r.ok);
    }

    #[test]
    fn test_validate_settings() {
        let s = Settings { theme: "dark".into(), search_provider: "duckduckgo".into(), homepage: "".into(), download_dir: None };
        assert!(validate_settings(s).ok);
        let s = Settings { theme: "neon".into(), search_provider: "duckduckgo".into(), homepage: "".into(), download_dir: None };
        assert!(!validate_settings(s).ok);
        let s = Settings { theme: "dark".into(), search_provider: "google".into(), homepage: "not a url with spaces".into(), download_dir: None };
        assert!(!validate_settings(s).ok);
    }
}
