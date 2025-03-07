/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FC4A1A',
        secondary: {
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc7c7',
          300: '#ffa0a0',
          400: '#ff6b6b',
          500: '#fc4a1a',
          600: '#e12d2d',
          700: '#bd1f1f',
          800: '#9d1b1b',
          900: '#821c1c',
          950: '#460909',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      keyframes: {
        glow: {
          '0%': { transform: 'translateX(-100%) rotate(-45deg)' },
          '100%': { transform: 'translateX(100%) rotate(-45deg)' }
        }
      },
      animation: {
        glow: 'glow 3s linear infinite'
      }
    },
  },
  plugins: [],
};