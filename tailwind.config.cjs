/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'navy-950': '#0b0d0f',
        'navy-900': '#111418',
        'navy-800': '#161a1f',
        'navy-700': '#1d222a',
        'navy-600': '#2a313b',
        'neon-cyan': '#24d3bc',
        'neon-blue': '#3aa7ff',
        'neon-green': '#1fae7a',
        'neon-yellow': '#f6c945',
        'neon-orange': '#f59e0b',
        'neon-red': '#ef4444',
        'neon-purple': '#8b5cf6',
        'neon-pink': '#ec4899',
      },
      fontFamily: {
        sans: ['Sora', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
