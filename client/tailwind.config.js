/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: '#111726',
        surfaceLight: '#1b2438',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: {
          DEFAULT: '#00f2fe',
          glow: '#4facfe',
          violet: '#8a2be2',
          emerald: '#10b981',
          rose: '#f43f5e'
        }
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(0, 242, 254, 0.3)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
