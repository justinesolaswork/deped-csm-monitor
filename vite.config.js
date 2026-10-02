import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative paths, so the built site works from any folder, such as https://<user>.github.io/<repo>/.
  base: "./",
});
