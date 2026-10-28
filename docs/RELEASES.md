# Releases

Versioning: SemVer `vMAJOR.MINOR.PATCH`. Tag → Windows build → draft GitHub Release.

## Artifact naming
- `DOTX_<version>_x64.msi` (recommended)
- `DOTX_<version>_x64.exe` (NSIS)

Each release includes SHA-256 checksums.

## How to publish (maintainer)
1. Ensure `main` is green (CI passes, website builds).
2. Bump versions in `apps/desktop/src-tauri/tauri.conf.json` + `Cargo.toml` + `package.json`.
3. Tag: `git tag v0.1.0 && git push origin v0.1.0`
4. Watch `Release Windows` workflow — it builds MSI/EXE and creates a draft release.
5. Verify checksums, test install on clean Windows VM, then publish the draft release.
6. Website Download page will automatically show the new release via GitHub API.
