/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          100: '#f5f0e1', // Couleur de fond
          200: '#e4dccf',
          300: '#d3c9bd',
        },
        orange: {
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        amber: {
          500: '#f59e0b',
          600: '#d97706',
        },
        rose: {
          500: '#f43f5e',
          600: '#e11d48',
        },
        emerald: {
          600: '#059669',
        },
      },
    },
  },
  plugins: [],
}