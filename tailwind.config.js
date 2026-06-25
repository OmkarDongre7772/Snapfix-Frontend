/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',   // toggled via <html class="dark">
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Semantic colors backed by CSS variables (auto-swap on theme change)
        bg:      "var(--color-bg)",
        surface: "var(--color-surface)",
        border:  "var(--color-border)",
        ring:    "#E8552E",

        text: {
          DEFAULT: "var(--color-text)",
          muted:   "var(--color-text-muted)",
          subtle:  "var(--color-text-subtle)",
        },

        // ── Accent — terracotta (same in both themes)
        accent: {
          DEFAULT: "#E8552E",
          hover:   "#D44B26",
          light:   "var(--color-accent-light)",
        },

        // ── Semantic status colors
        success: {
          DEFAULT: "#2E7D5B",
          light:   "var(--color-success-light)",
        },
        warning: {
          DEFAULT: "#D9A02B",
          light:   "var(--color-warning-light)",
        },
        danger: {
          DEFAULT: "#DC2626",
          light:   "var(--color-danger-light)",
        },

        // ── Fixed Tailwind overrides for status badges (theme-aware via vars)
        muted: {
          bg:   "var(--color-muted-bg)",
          text: "var(--color-muted-text)",
        },
      },

      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },

      borderRadius: {
        DEFAULT: "6px",
        sm:   "4px",
        md:   "6px",
        lg:   "8px",
        xl:   "12px",
        full: "9999px",
      },

      spacing: {
        1: "4px", 2: "8px", 3: "12px", 4: "16px",
        6: "24px", 8: "32px", 10: "40px", 12: "48px", 16: "64px",
      },

      boxShadow: {
        sm:      "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)",
        md:      "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)",
        lg:      "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
        // Darker shadows for dark mode — used via dark:shadow-dark-md etc.
        "dark-sm": "0 1px 2px 0 rgb(0 0 0 / 0.3)",
        "dark-md": "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)",
      },

      animation: {
        "spin-slow": "spin 1.5s linear infinite",
        "fade-in":   "fadeIn 0.2s ease-out",
        "slide-up":  "slideUp 0.25s ease-out",
        "slide-in":  "slideIn 0.2s ease-out",
      },

      keyframes: {
        fadeIn:  { "0%": { opacity: 0 },                               "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(8px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        slideIn: { "0%": { opacity: 0, transform: "translateY(-6px)" },"100%": { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
