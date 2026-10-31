/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1A120E',
        coal: '#231914',
        charcoal: '#4A4A46',
        bronze: '#A88462',
        ivory: '#D5C4AE',
        mute: '#9C9083',
      },
      fontFamily: {
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        label: '0.28em',
      },
    },
  },
  plugins: [],
};
