/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        editor: {
          bg: '#1e1e1e',
          panel: '#252526',
          border: '#3c3c3c',
          hover: '#2a2d2e',
          active: '#37373d',
          accent: '#0e639c',
          text: '#cccccc',
          muted: '#858585',
          highlight: '#264f78',
        },
      },
      fontFamily: {
        mono: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
