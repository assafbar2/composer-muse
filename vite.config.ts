import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project site: https://assafbar2.github.io/composer-muse/
export default defineConfig({
  plugins: [react()],
  base: "/composer-muse/",
});
