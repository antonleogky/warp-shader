import { defineConfig } from "vite";

const PORT = 5190;
const repoName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "warp-shader";
const isGitHubPages =
  process.env.GITHUB_ACTIONS === "true" ||
  process.env.GITHUB_PAGES === "true";

export default defineConfig({
  base: isGitHubPages ? `/${repoName}/` : "/",
  server: {
    port: PORT,
    strictPort: true,
  },
  preview: {
    port: PORT,
    strictPort: true,
  },
});
