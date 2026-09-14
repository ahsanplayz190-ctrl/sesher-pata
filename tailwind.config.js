/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        bengali: ['var(--font-noto-sans-bengali)', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        bookstore: {
          dark: '#211E15',
          darker: '#1B1910',
          darkest: '#14120B',
          gold: '#E5A913',
          goldHover: '#D99600',
          goldLight: '#FEF9EC',
          cream: '#FAF8F4',
          creamDark: '#F3EFE6',
          card: '#FFFFFF',
          textDark: '#1E1B13',
          textMuted: '#6B6555',
          borderLight: '#E8E3D5',
        },
      },
    },
  },
  plugins: [],
};
