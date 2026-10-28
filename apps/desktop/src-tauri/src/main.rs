// DOTX Desktop — Tauri 2 + Rust backend
// Security: privileged UI is isolated from untrusted web content.
// This module implements narrow, validated IPC only.

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
    // Block dangerous schemes explicitly (xss, file exfil, js execution)
    for blocked in ["javascript:", "data:", "file:", "vbscript:", "blob:"] {
        if lower.starts_with(blocked) {
            return ValidateResult { ok: false, normalized: None, reason: Some(format!("blocked scheme: {}", blocked.trim_end_matches(':'))) };
        }
    }
    // Detect external protocols that need confirmation (mailto, etc.)
    if lower.starts_with("mailto:") || lower.starts_with("tel:") || lower.starts_with("ms-") {
        return ValidateResult { ok: false, normalized: None, reason: Some("external protocol requires confirmation".into()) };
    }
    // Heuristic: if no scheme, treat as search or https
    let has_scheme = trimmed.contains("://") || trimmed.contains(':');
    // If contains spaces and no scheme, it's likely a search query → not a URL
    if !has_scheme && trimmed.contains(' ') {
        return ValidateResult { ok: false, normalized: None, reason: Some("search query, not URL".into()) };
    }
    let candidate = if trimmed.contains("://") {
        trimmed.to_string()
    } else if has_scheme {
        // Has colon but no // → might be custom protocol, block unless http/https
        return ValidateResult { ok: false, normalized: None, reason: Some("unsupported protocol".into()) };
    } else {
        format!("https://{}", trimmed)
    };
    match Url::parse(&candidate) {
        Ok(u) if matches!(u.scheme(), "http" | "https") => {
            // Validate host exists
            if u.host_str().is_none() || u.host_str().unwrap().is_empty() {
                return ValidateResult { ok: false, normalized: None, reason: Some("missing host".into()) };
            }
            // Reject localhost/private IP in privileged context? Allow but warn (future: block by setting)
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
    // Prevent path traversal: file_name must not contain path separators or ..
    if file_name.contains('/') || file_name.contains('\\') || file_name.contains("..") {
        return PathValidateResult { ok: false, sanitized: None, reason: Some("path traversal detected in file name".into()) };
    }
    // File name should be reasonable length and not empty
    let trimmed = file_name.trim();
    if trimmed.is_empty() || trimmed.len() > 255 {
        return PathValidateResult { ok: false, sanitized: None, reason: Some("invalid file name length".into()) };
    }
    // Download dir must be absolute and exist (or parent exists) — basic check
    let dir = Path::new(&download_dir);
    if !dir.is_absolute() {
        return PathValidateResult { ok: false, sanitized: None, reason: Some("download directory must be absolute".into()) };
    }
    // Sanitize: remove control chars
    let sanitized = trimmed.chars().filter(|c| !c.is_control()).collect::<String>();
    if sanitized != trimmed {
        return PathValidateResult { ok: false, sanitized: Some(sanitized), reason: Some("control characters removed".into()) };
    }
    // Construct full path and ensure it stays within download_dir (no traversal)
    let full = dir.join(&sanitized);
    if !full.starts_with(dir) {
        return PathValidateResult { ok: false, sanitized: None, reason: Some("path escapes download directory".into()) };
    }
    PathValidateResult { ok: true, sanitized: Some(full.to_string_lossy().to_string()), reason: None }
}

// ── Bookmark types (for future persistence) ─────────────────────────────────
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

// ── Settings validation ─────────────────────────────────────────────────────
#[derive(Serialize, Deserialize, Debug)]
pub struct Settings {
    pub theme: String, // dark | light | system
    pub search_provider: String, // duckduckgo | google | bing | brave
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

// ── Main ────────────────────────────────────────────────────────────────────
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            validate_url,
            validate_download_path,
            validate_bookmark,
            validate_settings,
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
    fn test_validate_download_path_ok() {
        let r = validate_download_path("report.pdf".into(), "C:\\Users\\Test\\Downloads".into());
        if cfg!(windows) {
            assert!(r.ok);
        } else {
            // On linux runner, absolute check for C:\ will fail — test unix path
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
