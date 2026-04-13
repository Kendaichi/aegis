/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aegis: {
          bg: "#0b1220",
          panel: "#111a2e",
          accent: "#f97316",
          muted: "#94a3b8",
        },
      },
    },
  },
  plugins: [],
};
