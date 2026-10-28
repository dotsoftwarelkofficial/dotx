# DOTX Security

Release-blocking requirements.

- **Isolation**: Privileged UI separated from untrusted page content. No fs/shell/IPC exposed to pages.
- **IPC**: Narrow Tauri commands with argument validation (`validate_url`). All args sanitized.
- **Navigation**: Allow-list http/https; dangerous schemes rejected; external protocols require confirmation.
- **Downloads**: Path traversal prevented, duplicate-safe names, permission errors handled, executable confirmation.
- **TLS**: Never silently disable validation; certificate errors surfaced.
- **Permissions**: Camera/mic/location/notifications behind consent.
- **Secrets**: Never committed. `.env.example` only placeholders. Signing keys via GitHub Secrets.
- **Storage**: Settings/bookmarks/history with versioning + migration + corrupt-data recovery.

## Reporting
Use `SECURITY.md` at repo root or open a private Security Advisory on GitHub.
