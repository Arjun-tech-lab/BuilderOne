/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8f6",
          100: "#d5efe9",
          200: "#aee0d4",
          300: "#7ac9b8",
          400: "#4aab97",
          500: "#0f7668",
          600: "#0d5f54",
          700: "#0c4c44",
          800: "#0b3d38",
          900: "#09332f",
        },
        ink: {
          50: "#f7f7f6",
          100: "#ececeb",
          200: "#d9d9d6",
          300: "#b8b8b3",
          400: "#8f8f88",
          500: "#6f6f68",
          600: "#575751",
          700: "#454541",
          800: "#2c2c29",
          900: "#171715",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(23, 23, 21, 0.06)",
        card: "0 1px 2px rgba(23,23,21,0.04), 0 8px 24px rgba(23,23,21,0.06)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "fade-up-delay": "fade-up 0.6s ease-out 0.12s both",
        shimmer: "shimmer 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
