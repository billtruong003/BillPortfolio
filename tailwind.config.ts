import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        background: "#050505",
        surface: "#0A0A0A",
        surfaceHighlight: "#121212",
        primary: "#FFB84D",
        secondary: "#888888",
      },
      keyframes: {
        'hero-in': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'hero-in': 'hero-in 0.5s ease-out both',
        'spin-slow': 'spin 20s linear infinite',
        'glitch': 'glitch 1s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;