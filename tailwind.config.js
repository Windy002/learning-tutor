/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#f8f8f6',
        bubble: '#f0ede6',
        border: 'rgba(31, 31, 30, 0.15)',
        'border-light': 'rgba(31, 31, 30, 0.08)',
        'text-primary': '#373734',
        'text-secondary': '#6b6b66',
        'text-muted': '#9a9a94',
        brand: '#d97757',
        'brand-hover': '#c26a4a',
        'verdict-correct': '#16a34a',
        'verdict-wrong': '#dc2626',
        'card-bg': '#f8f6f0',
        'active-bg': '#efeeeb',
        'active-text': '#121212',
      },
      fontFamily: {
        sans: ['"Anthropic Sans"', 'system-ui', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'claude': '9px',
      },
    },
  },
  plugins: [],
};
