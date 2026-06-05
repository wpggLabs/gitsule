/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
        mono: ["Cascadia Code", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        github: "#2f81f7"
      }
    }
  },
  plugins: []
}
