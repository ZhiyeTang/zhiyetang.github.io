/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary: warm amber/tan — signature accent
        primary: '#B8864A',
        // Secondary: natural sage green — secondary accents, tags
        secondary: '#7A9A6B',
        // Accent: deeper forest green — used sparingly
        accent: '#3D6B3A',
        // Backgrounds — light warm cream theme
        'bg-dark': '#F0EDE6',
        'bg-card': '#FAFAF7',
        // Extended warm palette
        'amber': {
          50:  '#fdf8f0',
          100: '#f7edda',
          200: '#edd9b0',
          300: '#e0c080',
          400: '#C9A97A',
          500: '#B8864A',
          600: '#9A6E38',
          700: '#7A5428',
          800: '#5A3C1C',
          900: '#3A2610',
        },
        'sage': {
          50:  '#f4f7f2',
          100: '#e4ede0',
          200: '#c6d9be',
          300: '#a0be96',
          400: '#8DB86A',
          500: '#7A9A6B',
          600: '#6A8C52',
          700: '#527040',
          800: '#3D6B3A',
          900: '#2A4A28',
        },
        'warm-gray': {
          50:  '#F8F6F2',
          100: '#F0EDE6',
          200: '#EDE8DC',
          300: '#D8D2C8',
          400: '#C0B8AC',
          500: '#A09A90',
          600: '#7A7468',
          700: '#565048',
          800: '#3A3630',
          900: '#2E2E2A',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Source Serif 4', 'Georgia', 'serif'],
      },
      letterSpacing: {
        'widest-xl': '0.25em',
      },
    },
  },
  plugins: [],
}
