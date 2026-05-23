import path from 'path';
import { defineConfig } from 'vite'

// Plugins
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/react-dom") || id.includes("/node_modules/react/")) {
            return "vendor-react";
          }
          if (id.includes("/node_modules/react-router")) {
            return "vendor-router";
          }
          if (id.includes("/node_modules/@reduxjs/") || id.includes("/node_modules/react-redux/")) {
            return "vendor-state";
          }
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      host: "localhost",
      port: 5173
    }
  }
})
