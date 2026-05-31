/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fit-dark': '#0a0b0f',
        'fit-card': '#121418',
        'fit-accent': '#14b8a6', // teal energetic
        'fit-accent2': '#f97316', // orange
        'fit-text': '#f1f5f9',
        'fit-muted': '#94a3b8',
      }
    },
  },
  plugins: [],
}