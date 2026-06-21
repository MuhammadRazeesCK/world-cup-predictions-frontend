/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#020c1f',
        surface: '#071428',
        'surface-2': '#0d1f3c',
        'surface-3': '#132a50',
        border: '#1a3a6b',
        accent: '#f5b800',
        'accent-dim': '#c49200',
        success: '#16a34a',
        'success-dim': '#15803d',
        danger: '#dc2626',
        warning: '#f59e0b',
        'text-primary': '#eef2ff',
        'text-secondary': '#6b89b4',
        'text-muted': '#3d5a80',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 20px rgba(245,184,0,0.15)',
        'gold-sm': '0 0 8px rgba(245,184,0,0.2)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
