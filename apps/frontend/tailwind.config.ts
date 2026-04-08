import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f7f4ed',
          100: '#ebe2d1',
          500: '#7c9a45',
          700: '#42572b',
          900: '#1f2718'
        }
      }
    }
  },
  plugins: []
};

export default config;
