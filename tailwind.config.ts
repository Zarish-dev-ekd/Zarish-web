import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      colors: {
        'zarish-bg': '#FAF6F0',
        'zarish-surface': '#F5EDE3',
        'zarish-surface-soft': '#F0E4D8',
        'zarish-surface-blush': '#F3E8E0',
        'zarish-espresso': '#2C1D13',
        'zarish-brown': '#3D2B1F',
        'zarish-camel': '#7B5B3A',
        'zarish-primary-dark': '#5C3D2E',
        'zarish-primary-light': '#A07D5C',
        'zarish-accent': '#8B4E5A',
        'zarish-accent-light': '#C4917B',
        'zarish-accent-rose': '#B87E6A',
        'zarish-muted': '#6B5744',
        'zarish-subtle': '#8C7B6B',
        'zarish-border': '#E2D5C7',
        'zarish-border-light': '#EDE4DA',
      },
      fontFamily: {
        display: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        script: ['Alex Brush', 'cursive'],
      },
      letterSpacing: {
        luxury: '0.25em',
        widest: '0.2em',
      },
      boxShadow: {
        'hero-btn': '0 4px 16px rgba(61, 43, 31, 0.22)',
        'hero-btn-hover': '0 6px 22px rgba(61, 43, 31, 0.32)',
        'luxury-card': '0 8px 30px rgba(44, 29, 19, 0.06)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
