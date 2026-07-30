import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Node environment (no DOM) + globals so tests read like the app's:
    // plain describe / it / expect with no imports.
    environment: "node",
    globals: true,
  },
  // Same `@` → src alias the app uses, so test imports read the same.
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
