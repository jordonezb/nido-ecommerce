/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        zoop: {
          50: '#fff5f4',
          100: '#ffe8e5',
          200: '#ffd5d0',
          300: '#ffaba1',
          400: '#ff7262',
          500: '#ff4b4b',
          600: '#fa3838',
          700: '#d92222',
          800: '#b31d1d',
          900: '#941e1e',
        },
        coral: {
          400: '#ff6452',
          500: '#ff4d3a',
          600: '#eb3b28',
        },
        nido: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      boxShadow: {
        'pill': '0 8px 24px -4px rgba(255, 75, 75, 0.35)',
        'pill-dark': '0 8px 24px -4px rgba(24, 24, 27, 0.25)',
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        'card-hover': '0 20px 30px -10px rgba(255, 75, 75, 0.15), 0 10px 15px -5px rgba(0, 0, 0, 0.04)',
        'clay': 'inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 10px 20px rgba(0, 0, 0, 0.06)',
        'phone': '0 25px 60px -15px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};
