/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        vazir: ["Vazirmatn", "sans-serif"],
      },
      colors: {
        // Primary brand colors (blue) - keeping your existing palette
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        // Secondary brand colors (emerald/teal for variety)
        secondary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        // Success colors (green) - complete palette
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        // Success colors optimized for dark mode
        "success-dark": {
          50: "#14532d", // Dark mode light success text
          100: "#166534", // Dark mode success accent
          200: "#15803d", // Dark mode success primary
          300: "#16a34a", // Dark mode success bright
          400: "#22c55e", // Dark mode success very bright
          500: "#4ade80", // Dark mode success highlight
          600: "#86efac", // Dark mode success soft
          700: "#bbf7d0", // Dark mode success very soft
          800: "#dcfce7", // Dark mode success background
          900: "#f0fdf4", // Dark mode success lightest background
        },
        // Warning colors (amber/yellow) - complete palette
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Error/Danger colors (red) - complete palette
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        // Neutral colors for better dark mode support
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
        // Dark mode specific colors - slate-based palette
        slate: {
          50: "#f8fafc", // Very light slate for text on dark
          100: "#f1f5f9", // Light slate
          200: "#e2e8f0", // Borders on dark backgrounds
          300: "#cbd5e1", // Muted text on dark
          400: "#94a3b8", // Secondary text on dark
          500: "#64748b", // Primary text on dark
          600: "#475569", // Dark surface elevated
          700: "#334155", // Dark surface
          800: "#1e293b", // Dark background elevated
          900: "#0f172a", // Dark background primary
          950: "#020617", // Deepest dark background
        },
      },
      // Add useful spacing for RTL layouts
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      // Add better box shadows for cards
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        medium:
          "0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.05)",
      },
      // Add animation for better UX
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
