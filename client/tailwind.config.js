export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#07111f',
        aurora: '#0bd3b6',
        sun: '#f7b955',
        coral: '#f5826b',
        cloud: '#f3f7fb'
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui'],
        display: ['Space Grotesk', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        panel: '0 24px 60px rgba(4, 10, 20, 0.28)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -20px, 0)' }
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translate3d(0, 16px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' }
        }
      },
      animation: {
        float: 'float 9s ease-in-out infinite',
        'fade-up': 'fade-up 700ms ease-out both'
      }
    }
  },
  plugins: []
};
