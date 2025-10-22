module.exports = {
  content: [
    "./index.html",
    "./data/**/*.json"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Noto Sans KR", "sans-serif"]
      },
      colors: {
        brand: {
          primary: "#4f46e5" // indigo-600 (원하면 바꿔도 됨)
        }
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
