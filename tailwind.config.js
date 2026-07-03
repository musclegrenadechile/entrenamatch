/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./public/landing.html",
    "./public/landing-en.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/landing/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        'fit-dark': '#0D0D10',
        'fit-card': '#1C1C20',
        'fit-card2': '#25252A',
        'fit-accent': '#FF671F', // Dunkin' energetic orange - primary CTA, motivation
        'fit-accent2': '#FF4F79', // vibrant pink - fun, social matching
        'fit-health': '#00C4B4', // healthy teal-green accent
        'fit-text': '#F8F8F8',
        'fit-muted': '#9CA3AF',
        'fit-border': '#2F2F35',
        'fit-success': '#10B981',
        'fit-danger': '#EF4444',
        'fit-highlight': '#FBBF24',
      }
    },
  },
  plugins: [],
}