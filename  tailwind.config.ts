// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0f1117",
        surface: "#1a1d23",
        border: "#2e3240",
        foreground: "#ffffff",
        muted: "#9ca3af",

        primary: "#3b82f6", // blue-500
        secondary: "#8b5cf6", // violet-500
        accent: "#22d3ee", // cyan-400
        success: "#10b981", // green-500
        danger: "#ef4444", // red-500
        warning: "#f59e0b", // amber-500
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 4px 16px rgba(0,0,0,0.25)",
        glow: "0 0 12px rgba(59, 130, 246, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
