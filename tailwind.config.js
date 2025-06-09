/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#a5b4fc',
          DEFAULT: '#6366f1',
          dark: '#4338ca',
        },
        secondary: {
          light: '#bae6fd',
          DEFAULT: '#0ea5e9',
          dark: '#0369a1',
        },
        neutral: {
          light: '#f3f4f6',
          DEFAULT: '#9ca3af',
          dark: '#1f2937',
        }
      },
      animation: {
        'breathe': 'breathe 8s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(0.8)' },
          '50%': { transform: 'scale(1.2)' },
        }
      }
    },
  },
  plugins: [],
}
