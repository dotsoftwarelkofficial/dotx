import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
function resolveBase() {
    var _a;
    var explicit = process.env.VITE_BASE;
    if (explicit)
        return explicit.endsWith("/") ? explicit : explicit + "/";
    var ghRepo = process.env.GITHUB_REPOSITORY;
    if (ghRepo) {
        var repoName = (_a = ghRepo.split("/")[1]) !== null && _a !== void 0 ? _a : "";
        if (repoName.endsWith(".github.io"))
            return "/";
        return "/".concat(repoName, "/");
    }
    if (process.env.NODE_ENV === "production")
        return "/dotx/";
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
