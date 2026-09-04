/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0faff',
          100: '#dff4fc',
          200: '#bde7f7',
          300: '#8bd1ed',
          400: '#5bb5dc',
          500: '#2998c8',
          600: '#1489bc',
          700: '#116f9c',
          800: '#125b7e',
          900: '#134c68',
        },
        ink: {
          50: '#f6f8fb',
          100: '#e9eef4',
          200: '#d3dce7',
          500: '#5c6b7d',
          700: '#2f4054',
          900: '#182536',
        },
      },
      boxShadow: {
        panel: '0 12px 32px rgba(27, 80, 112, 0.08)',
        'panel-lg': '0 20px 60px rgba(27, 80, 112, 0.14)',
      },
    },
  },
  plugins: [],
}
