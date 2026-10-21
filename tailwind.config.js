/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF8F5",
        raspberry: {
          DEFAULT: "#D92E67",
          dark: "#B82456",
          soft: "#FCE7EF",
        },
        blush: "#F17CA2",
        ink: "#242124",
        muted: "#767076",
      },
      fontFamily: {
        // Playfair Display thay cho DM Serif Display: DM Serif Display không có
        // subset "vietnamese" trên Google Fonts, nên các ký tự riêng của tiếng
        // Việt (ế, ầ, ộ, ữ…) rơi sang font dự phòng, metric lệch nhau và hở ra
        // khe giữa chữ. Playfair Display cùng kiểu high-contrast và có subset đó.
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ["Inter", "Nunito", "Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(217, 46, 103, 0.25)",
        card: "0 4px 20px -6px rgba(36, 33, 36, 0.12)",
        "card-hover": "0 12px 32px -8px rgba(36, 33, 36, 0.18)",
      },
    },
  },
  plugins: [],
};
