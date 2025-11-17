/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          900: "#2B2118", // moka profondo
          800: "#3C2E22", // cacao
          700: "#4B3A2A", // nocciola scuro
        },
        ink: "#1C1814", // quasi nero ma caldo
        silver: {
          100: "#f2f4f7",
          200: "#e4e7ec",
          300: "#d0d5dd",
          400: "#98a2b3",
        },
        brand: {
          500: "#C69C72", // sabbia calda (accent principale)
          600: "#B18458", // caramello medio
          700: "#926E4B", // bronzo profondo
        },
        sand: {
          100: "#F6EFE9",
          200: "#E5D8C8",
          300: "#D2BFA6",
        },
      },
      borderRadius: {
        DEFAULT: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
      },
      boxShadow: {
        flat: "0 1px 0 rgba(0,0,0,0.06)",
      },
      letterSpacing: {
        wide2: "0.04em",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
