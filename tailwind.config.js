/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zyno: {
          dark: '#0B1E28',
          deep: '#0F384C',
          teal: '#13505B',
          cyan: '#00C8EB',
          brightCyan: '#00F0FF',
          accentStar: '#FFD166',
          card: '#162A36',
          border: '#214255'
        }
      },
      backgroundImage: {
        'zyno-gradient': 'linear-gradient(135deg, #0F384C 0%, #13505B 50%, #00C8EB 100%)',
        'zyno-hero': 'linear-gradient(180deg, #0B1E28 0%, #0F384C 100%)',
        'zyno-cyan-glow': 'linear-gradient(135deg, #00C8EB 0%, #00F0FF 100%)'
      }
    },
  },
  plugins: [],
}
