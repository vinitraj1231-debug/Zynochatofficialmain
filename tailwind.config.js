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
          dark: '#071A24',
          teal: '#0B2B38',
          card: '#0F384A',
          cyan: '#00E5FF',
          brightCyan: '#00C9A7',
          gold: '#FFD700',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
        }
      },
      backgroundImage: {
        'zyno-gradient': 'linear-gradient(135deg, #0B2B38 0%, #004D61 50%, #00E5FF 100%)',
        'zyno-btn': 'linear-gradient(90deg, #00C9A7 0%, #00E5FF 100%)',
        'zyno-glow': 'radial-gradient(circle at center, rgba(0, 229, 255, 0.15) 0%, transparent 70%)',
      }
    },
  },
  plugins: [],
}
