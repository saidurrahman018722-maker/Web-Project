/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2fbf5',
          100: '#e1f6e8',
          200: '#c4ecd2',
          300: '#97dcb1',
          400: '#64c38a',
          500: '#3fa66c',
          600: '#2e8755',
          700: '#276b45',
          800: '#23553a',
          900: '#1e4731',
          950: '#0b2619',
        }
      }
    },
  },
  plugins: [],
}
