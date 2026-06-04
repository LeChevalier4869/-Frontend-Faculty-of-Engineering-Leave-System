/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        kanit: ["Kanit", "sans-serif"],
      },
      colors: {
        // สีประจำคณะวิศวกรรมศาสตร์ — เลือดหมู (maroon) ใช้เป็นแบรนด์หลัก (ตรงกับอีเมล)
        brand: {
          50: "#fdf3f3",
          100: "#fbe4e6",
          200: "#f6c9cd",
          300: "#e59aa2",
          400: "#cf5c67",
          500: "#b23a47",
          600: "#7A1B22", // primary
          700: "#631620",
          800: "#561016",
          900: "#3d0c11",
          DEFAULT: "#7A1B22",
        },
        // สีทอง — ใช้เป็น accent คู่กับเลือดหมู
        gold: {
          light: "#e0c585",
          DEFAULT: "#C9A24A",
          dark: "#a8842f",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "fade-out": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "splash-bar": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in .5s ease-out forwards",
        "fade-out": "fade-out .5s ease-in forwards",
        "splash-bar": "splash-bar 1.1s ease-in-out infinite",
      },
    },
  },
  plugins: [daisyui],
};
