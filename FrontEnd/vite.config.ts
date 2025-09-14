import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/static/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          react: ["react", "react-dom"],
          // React Router
          router: ["react-router-dom"],
          // UI and form libraries
          ui: [
            "@headlessui/react",
            "react-hook-form",
            "@hookform/resolvers",
            "react-hot-toast",
          ],
          // Data fetching
          query: ["@tanstack/react-query", "axios"],
          // State management and utilities
          utils: ["zustand", "zod", "clsx", "tailwind-merge"],
          // Icons and other libraries
          icons: ["lucide-react"],
          // QR/Barcode scanning
          scanner: ["@zxing/library"],
        },
      },
    },
    // Increase chunk size warning limit to 1000kb since we're splitting chunks
    chunkSizeWarningLimit: 1000,
  },
});
