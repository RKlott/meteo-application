/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      fontFamily: {
        notoSansKr: ["Noto Sans KR", "sans-serif"],
      }
    },
  },
  plugins: [],
}
