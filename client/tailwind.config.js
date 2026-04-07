/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c2d4ff',
          300: '#93b0ff',
          400: '#5c82ff',
          500: '#3b5bdb',
          600: '#2c44c9',
          700: '#2235a3',
          800: '#1a2882',
          900: '#0f1a5e',
          950: '#0a1040',
        },
      },
    },
  },
  plugins: [],
};
