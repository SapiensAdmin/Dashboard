/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#f5f6f8',
        ink: '#1a1a1a',
        muted: '#6b7280',
        sapiens: '#1f4ea8',
        positive: '#15803d',
        negative: '#b91c1c',
        live: '#10b981',
        stale: '#9ca3af',
        line: '#e5e7eb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
