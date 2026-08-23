/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        likora: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          primary: '#6366f1',
          accent: '#38bdf8',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
