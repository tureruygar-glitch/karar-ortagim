/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",
        secondary: "#4A44E8",
        accent: "#FF6584",
        background: "#0F0F1A",
        surface: "#1A1A2E",
        card: "#222240",
        text: "#EAEAEA",
        muted: "#8888A0",
      },
    },
  },
  plugins: [],
};
