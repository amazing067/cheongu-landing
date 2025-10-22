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
          // 트렌디한 보랏빛 계열 (차분하고 선명)
          primary: "#7c3aed",   // violet-600
          primaryHover: "#6d28d9", // violet-700
          ring: "#a78bfa"       // violet-300
        }
      },
      boxShadow: {
        card: "0 6px 24px -8px rgba(2,6,23,.12), 0 2px 6px -2px rgba(2,6,23,.08)"
      },
      borderRadius: {
        xl2: "1.25rem" // 살짝 더 둥글게 옵션
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
