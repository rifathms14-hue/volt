import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#09090B",
        input: "#09090B",
        ring: "#CFFF04",
        background: "#FFFFFF",
        foreground: "#09090B",
        primary: {
          DEFAULT: "#CFFF04",
          foreground: "#09090B",
        },
        secondary: {
          DEFAULT: "#F5F5F5",
          foreground: "#09090B",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#71717A",
        },
        accent: {
          DEFAULT: "#CFFF04",
          foreground: "#09090B",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#09090B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#09090B",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["'Funnel Display'", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(207, 255, 4, 0.5), 0 0 10px rgba(207, 255, 4, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 10px rgba(207, 255, 4, 0.8), 0 0 20px rgba(207, 255, 4, 0.5), 0 0 30px rgba(207, 255, 4, 0.3)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

