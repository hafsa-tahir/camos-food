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
        cream: {
          50: "#FDFAF5",
          100: "#F8F2E6",
          200: "#F5F0E8",
          300: "#EDE5D4",
          400: "#E5DDD0",
          500: "#D4C9B5",
        },
        sage: {
          50: "#EEF4EF",
          100: "#D4E5D7",
          200: "#AACAB1",
          300: "#85B08E",
          400: "#6B8F71",
          500: "#4A6B50",
          600: "#3A5440",
          700: "#2C3F30",
        },
        terracotta: {
          50: "#FDF1EB",
          100: "#FADDD0",
          200: "#F4B99E",
          300: "#EE956C",
          400: "#E8743A",
          500: "#C95E25",
          600: "#A04A1C",
        },
        olive: {
          50: "#F5F5EE",
          100: "#E8E8D8",
          200: "#C8C89A",
          300: "#A8A86A",
          400: "#888845",
          500: "#666630",
        },
      },
      fontFamily: {
        sans: ["'Roboto Slab'", "serif", "system-ui"],
        serif: ["'Roboto Slab'", "serif", "system-ui"],
        robotoSlab: ["'Roboto Slab'", "serif"],
      },
      backgroundImage: {
        "hero-pattern":
          "radial-gradient(ellipse at 70% 50%, rgba(107,143,113,0.12) 0%, transparent 60%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,240,232,0.7) 100%)",
      },
      boxShadow: {
        soft: "0 2px 20px rgba(74, 107, 80, 0.08)",
        card: "0 4px 24px rgba(44, 44, 44, 0.06)",
        "card-hover": "0 8px 40px rgba(44, 44, 44, 0.12)",
        terracotta: "0 4px 20px rgba(232, 116, 58, 0.25)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
