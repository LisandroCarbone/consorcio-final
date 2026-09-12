import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.3s ease-out",
      },
      colors: {
        brand: {
          50: "#eff6ff",
          100: "var(--brand-100)",
          200: "var(--brand-200)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          800: "var(--brand-800)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
