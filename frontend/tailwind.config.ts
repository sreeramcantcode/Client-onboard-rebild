import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-outfit)", "sans-serif"],
        sans: ["var(--font-jakarta)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        brand: {
          DEFAULT: "#F77418",
          50: "#FFF4EB",
          100: "#FFE5CC",
          200: "#FFC999",
          300: "#FFAC66",
          400: "#FF9033",
          500: "#F77418",
          600: "#D85F0E",
          700: "#A8480B",
          800: "#7A3308",
          900: "#4D2005",
        },
        shell: {
          DEFAULT: "#0A0A0A",
          900: "#0A0A0A",
          800: "#111114",
          700: "#18181B",
          600: "#27272A",
          500: "#3F3F46",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        fadeRise: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        spinSlow: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        "fade-rise": "fadeRise 0.5s ease both",
        "spin-slow": "spinSlow 1s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
