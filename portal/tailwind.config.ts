import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          600: "#1a3c5e",
          700: "#152f4a",
          800: "#0f2236",
        },
      },
    },
  },
  plugins: [],
};

export default config;
