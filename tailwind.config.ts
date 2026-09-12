import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FC5C03",
          bright: "#FE7113",
          deep: "#EC4001",
          soft: "#FFF2E8",
          lightBg: "#FFF9F5",
          dark: "#1A1D26",
          body: "#4B5563",
          muted: "#7A8190",
          border: "#E8E8EE",
          white: "#FFFFFF",
          footer: "#15171E",
        },
      },
      maxWidth: {
        site: "1500px",
      },
      spacing: {
        /** Minimum touch target size (44px) */
        "touch": "44px",
        /** Bottom nav height */
        "bottom-nav": "56px",
        /** Safe area bottom (used as CSS var fallback) */
        "safe-b": "env(safe-area-inset-bottom, 0px)",
      },
      minHeight: {
        "touch": "44px",
      },
      minWidth: {
        "touch": "44px",
      },
      boxShadow: {
        subtle: "0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)",
        card: "0 4px 20px -2px rgba(252, 92, 3, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        cardHover: "0 12px 28px -4px rgba(252, 92, 3, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)",
        glow: "0 0 25px rgba(254, 113, 19, 0.25)",
        "up-sm": "0 -2px 8px -2px rgba(0, 0, 0, 0.06)",
        "up-md": "0 -4px 12px rgba(0, 0, 0, 0.08)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 0.2s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      fontFamily: {
        sans: [
          "var(--font-plus-jakarta)",
          "var(--font-hind-siliguri)",
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
