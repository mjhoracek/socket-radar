/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#B5F561",
        appBg: "#0A0A0A",
        veloColor: "#FFB03A",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
  variants: {
    extend: {},
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui"],
      segment: ["segment", "sans-serif"],
    },
  },
};
