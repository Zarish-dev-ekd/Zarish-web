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
        'zarish-espresso': '#2C1D13',
        'zarish-brown': '#3D2B1F',
        'zarish-camel': '#7B5B3A',
        'zarish-muted': '#6B5744',
        'zarish-subtle': '#7B6858',
        'zarish-border': '#E2D5C7',
      },
      fontFamily: {
        display: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        script: ['Alex Brush', 'cursive'],
      },
      letterSpacing: {
        'luxury': '0.25em',
      },
      boxShadow: {
        'hero-btn': '0 4px 16px rgba(61, 43, 31, 0.22)',
        'hero-btn-hover': '0 6px 22px rgba(61, 43, 31, 0.32)',
      },
    },
  },
  plugins: [],
};

export default config;
