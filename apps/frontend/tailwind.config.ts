import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#2f7f3f',
          700: '#1f5a2b'
        }
      }
    }
  },
  plugins: []
};

export default config;
