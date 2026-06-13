/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        foundation: {
          ink: "#17201b",
          green: "#0f8a5f",
          teal: "#0e7490",
          gold: "#c47f17",
          surface: "#f7faf8",
        },
      },
      boxShadow: {
        panel: "0 16px 48px rgba(23, 32, 27, 0.08)",
      },
    },
  },
  plugins: [],
};
