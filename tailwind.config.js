/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#FF5C1A',
          50:  '#FFF2ED',
          100: '#FFE4D6',
          200: '#FFC9AD',
          600: '#E54A0D',
          700: '#C23D08',
        },
        marine: {
          DEFAULT: '#0D1B2A',
          700: '#1a3148',
          900: '#080f18',
        },
        cream: {
          DEFAULT: '#F8F5F0',
          200: '#EDE9E4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

