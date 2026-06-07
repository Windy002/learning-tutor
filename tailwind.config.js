/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#f8f8f6',
        bubble: '#f0ede6',
        border: '#e8e3dc',
        'text-primary': '#3d3929',
        'text-secondary': '#6b6252',
        'text-muted': '#8b7e6a',
        brand: '#d97706',
        'verdict-correct': '#16a34a',
        'verdict-wrong': '#dc2626',
        'card-bg': '#f8f6f0',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
