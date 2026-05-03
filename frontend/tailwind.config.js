/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Thêm các màu mới vào theme của Tailwind
        'lc-purple': 'var(--lc-purple)',
        'lc-dark-blue': 'var(--lc-dark-blue)',
        'lc-light-blue': 'var(--lc-light-blue)',
        'lc-dark-green': 'var(--lc-dark-green)',
        'lc-light-green': 'var(--lc-light-green)',
        'lc-yellow': 'var(--lc-yellow)',
        'lc-light-orange': 'var(--lc-light-orange)',
        'lc-orange': 'var(--lc-orange)',
        'lc-dark-pink': 'var(--lc-dark-pink)',
        'lc-red': 'var(--lc-red)',
        'lc-pastel-purple': 'var(--lc-pastel-purple)',
        'lc-medium-purple': 'var(--lc-medium-purple)',
        'lc-bg-dark': 'var(--lc-bg-dark)',
      },
      // Giữ lại các animation cũ
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}