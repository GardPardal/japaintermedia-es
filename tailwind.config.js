/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        japa: {
          red: '#E50914',
          redDark: '#B80710',
          black: '#101010',
          white: '#FFFFFF',
          bg: '#F7F7F7',
          border: '#E5E7EB',
          muted: '#5F6368',
          dark: '#101010',
          card: '#FFFFFF',
          cardHover: '#FAFAFA'
        },
        brenza: {
          red: '#E50914',
          redHover: '#B80710',
          dark: '#101010',
          card: '#FFFFFF',
          border: '#E5E7EB',
          muted: '#5F6368'
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Manrope"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Inter"', '"Manrope"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card-subtle': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 12px 28px rgba(0, 0, 0, 0.12)',
        'header': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'search': '0 10px 30px rgba(0, 0, 0, 0.08)'
      }
    },
  },
  plugins: [],
}
