/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        aegis: {
          bg: "#0b1220",
          /** @deprecated use surface - kept for gradual migration */
          panel: "#111a2e",
          surface: "#111a2e",
          surface2: "#162033",
          border: "rgba(148, 163, 184, 0.08)",
          accent: "#3b82f6",
          muted: "#94a3b8",
          glow: "rgba(59, 130, 246, 0.06)",
        },
      },
      borderRadius: {
        card: "1rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.15)",
        glow: "0 0 20px rgba(59, 130, 246, 0.08)",
      },
    },
  },
  plugins: [],
};
