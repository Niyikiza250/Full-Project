/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sda: {
          blue: '#003087',
          gold: '#C5B358',
          'blue-dark': '#002261',
          'gold-light': '#D4C67A',
        },
        primary: {
          DEFAULT: '#003087',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#C5B358',
          foreground: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
