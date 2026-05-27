import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 5190;
const repoName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "warp-shader";
const isGitHubPages =
  process.env.GITHUB_ACTIONS === "true" ||
  process.env.GITHUB_PAGES === "true";

export default defineConfig({
  base: isGitHubPages ? `/${repoName}/` : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: PORT,
    strictPort: true,
  },
  preview: {
    port: PORT,
    strictPort: true,
  },
});
