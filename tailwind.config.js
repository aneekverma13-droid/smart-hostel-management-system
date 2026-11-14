/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#fdfcf8',
          100: '#faf6ec',
          200: '#f3ecd6',
          300: '#eadcb4',
        },
        ivory: {
          50: '#fefefb',
          100: '#fbfaf3',
        },
        mint: {
          50: '#effbf4',
          100: '#d7f5e3',
          200: '#b0e9c8',
          300: '#7dd6a6',
          400: '#4abd84',
          500: '#2aa36a',
          600: '#1e8756',
          700: '#1a6c48',
        },
        teal: {
          50: '#eefbfb',
          100: '#d0f2f3',
          200: '#a6e6e8',
          300: '#6dd2d6',
          400: '#3bb6bc',
          500: '#25969d',
          600: '#1d7a80',
          700: '#1a6368',
        },
        sky: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#bcdcff',
          300: '#8ec5ff',
          400: '#59a6ff',
          500: '#3385f5',
          600: '#1f66db',
          700: '#1a52b0',
        },
        peach: {
          50: '#fff5ef',
          100: '#ffe6d6',
          200: '#ffcfb0',
          300: '#ffb088',
          400: '#ff8c5e',
          500: '#f56c3a',
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(42, 163, 106, 0.08)',
        card: '0 4px 24px rgba(31, 102, 219, 0.06)',
        soft: '0 2px 12px rgba(0,0,0,0.04)',
      },
      backgroundImage: {
        'mesh-light':
          'radial-gradient(at 0% 0%, rgba(125,214,166,0.25) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(61,198,201,0.18) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(89,166,255,0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(255,176,136,0.18) 0px, transparent 50%)',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
