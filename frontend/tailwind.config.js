/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B1120",
          900: "#101828",
          800: "#16213A",
          700: "#202C47",
          600: "#2E3C5C",
        },
        paper: {
          50: "#F6F5F1",
          100: "#ECEAE3",
          200: "#DDDACF",
        },
        amber: {
          400: "#F0B860",
          500: "#E8A33D",
          600: "#C9822A",
        },
        teal: {
          500: "#14958A",
          600: "#0F766E",
          700: "#0B5A54",
        },
        danger: {
          400: "#E56B60",
          500: "#DC4C3F",
          600: "#B93B30",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        soft: "0 4px 20px -4px rgba(11, 17, 32, 0.25)",
        "soft-lg": "0 12px 40px -8px rgba(11, 17, 32, 0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "toast-in": {
          "0%": { opacity: 0, transform: "translateY(-8px) scale(0.98)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out",
        "toast-in": "toast-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
