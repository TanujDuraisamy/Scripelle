/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        'garamond': ['EB Garamond', 'serif'],
      },
      letterSpacing: {
        'tightest': '-0.2rem',
      },
      backgroundColor: {
        'header-opacity': '#313131bf',
      },
    },
  },
  plugins: [],
}
