/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '18': '4.5rem',
      },
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
      ringWidth: {
        '3': '3px',
      },
      colors: {
        brand: {
          50: '#fff8f3',
          100: '#fff1e6',
          200: '#ffd4b0',
          300: '#ffb57a',
          400: '#ff7a1a', // exact hero bright orange
          500: '#f26a07',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        slateTeal: {
          50: '#f5f6f8',
          100: '#e6e8ee',
          200: '#cdd1dd',
          300: '#a8afc3',
          400: '#7b849e',
          500: '#5b637c',
          600: '#464d63',
          700: '#353a4c',
          800: '#2a2e39',
          900: '#181a20', // obsidian charcoal contrast
          950: '#111318',
        },
        canvas: '#f4f6f8',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(15, 23, 42, 0.03)',
        'xs': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'soft': '0 10px 30px -5px rgba(0, 0, 0, 0.03), 0 4px 10px -2px rgba(0, 0, 0, 0.02)',
        'soft-lg': '0 20px 40px -10px rgba(0, 0, 0, 0.05), 0 8px 16px -4px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
