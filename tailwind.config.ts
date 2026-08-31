import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        dancing: ['var(--font-dancing-script)'],
      },
      colors: {
        // Your Brand Colors
        primary: {
          DEFAULT: "#01063B", // Navy
          hover: "#0a1050",   // Slightly lighter for button hovers
        },
        accent: {
          DEFAULT: "#2aabb0", // Teal
          muted: "rgba(42,171,176,0.5)", // For focus rings
        },
        // Standardized Surface & Borders from your grep
        surface: {
          DEFAULT: "#fcfcfc",
          muted: "#f8f9fa",
        },
        border: {
          DEFAULT: "#eaeaea",
        }
      },
    },
  },
  plugins: [],
};
export default config;
