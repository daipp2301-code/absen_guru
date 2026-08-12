import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import path from "path";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    netlify(),
    react(),
    tailwindcss(),
  ],

  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },

  server: {
    port: 3000,
    host: true,
  },
});