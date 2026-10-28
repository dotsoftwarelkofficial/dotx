import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function resolveBase(): string {
  const explicit = process.env.VITE_BASE;
  if (explicit) return explicit.endsWith("/") ? explicit : explicit + "/";
  const ghRepo = process.env.GITHUB_REPOSITORY;
  if (ghRepo) {
    const repoName = ghRepo.split("/")[1] ?? "";
    if (repoName.endsWith(".github.io")) return "/";
    return `/${repoName}/`;
  }
  if (process.env.NODE_ENV === "production") return "/dotx/";
  return "/";
}

export default defineConfig({
  plugins: [react()],
  base: resolveBase(),
  build: { outDir: "dist", assetsDir: "assets", sourcemap: false },
  server: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: true,
    cors: true,
  },
  preview: {
    port: 4173,
    host: "0.0.0.0",
    allowedHosts: true,
    cors: true,
    headers: { "Access-Control-Allow-Origin": "*" },
  },
});
