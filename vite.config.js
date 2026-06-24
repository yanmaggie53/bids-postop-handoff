import { defineConfig } from "vite";

// `base` must match the GitHub repo name so asset paths resolve on GitHub Pages
// (served from https://<user>.github.io/bids-postop-handoff/).
export default defineConfig({
  base: "/bids-postop-handoff/",
  build: {
    outDir: "dist",
  },
});
