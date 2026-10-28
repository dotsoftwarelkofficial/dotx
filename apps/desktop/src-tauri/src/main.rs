// DOTX Desktop — Tauri + Rust backend
// Security-critical: privileged UI is isolated from untrusted web content.
// Web content loads in a separate WebView2 child surface; this process
// validates all navigation and never exposes fs/shell to pages.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use url::Url;

#[derive(Debug, thiserror::Error)]
enum NavError {
  #[error("blocked scheme: {0}")]
  BlockedScheme(String),
  #[error("invalid url: {0}")]
  InvalidUrl(String),
}

#[derive(Serialize, Deserialize, Debug)]
struct ValidateResult {
  ok: bool,
  normalized: Option<String>,
  reason: Option<String>,
}

#[tauri::command]
fn validate_url(input: String) -> ValidateResult {
  let trimmed = input.trim();
  if trimmed.is_empty() {
    return ValidateResult { ok: false, normalized: None, reason: Some("empty".into()) };
  }
  let lower = trimmed.to_lowercase();
  if lower.starts_with("javascript:") || lower.starts_with("data:") || lower.starts_with("file:") || lower.starts_with("vbscript:") {
    return ValidateResult { ok: false, normalized: None, reason: Some(format!("blocked scheme in {:?}", &trimmed[..trimmed.len().min(20)])) };
  }
  // Allow search queries — frontend decides search vs navigate; here we just validate http/https
  let has_scheme = trimmed.contains("://");
  let candidate = if has_scheme { trimmed.to_string() } else { format!("https://{trimmed}") };
  match Url::parse(&candidate) {
    Ok(u) if u.scheme() == "http" || u.scheme() == "https" => ValidateResult { ok: true, normalized: Some(u.to_string()), reason: None },
    Ok(u) => ValidateResult { ok: false, normalized: None, reason: Some(format!("unsupported scheme: {}", u.scheme())) },
    Err(e) => ValidateResult { ok: false, normalized: None, reason: Some(format!("invalid url: {e}")) },
  }
}

#[tauri::command]
fn app_version() -> String {
  env!("CARGO_PKG_VERSION").to_string()
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![validate_url, app_version])
    .run(tauri::generate_context!())
    .expect("failed to run DOTX");
}
