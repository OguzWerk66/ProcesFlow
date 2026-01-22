/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vgn-blue': '#1e3a5f',
        'vgn-light': '#f0f4f8',
        'vgn-accent': '#3b82f6',
      }
    },
  },
  plugins: [],
}
