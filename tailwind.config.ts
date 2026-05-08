import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f3d0fe',
          300: '#e9a8fd',
          400: '#d97cf9',
          500: '#c04def',
          600: '#a42fd4',
          700: '#8b26b0',
          800: '#72208f',
          900: '#5e1d74',
        },
        surface: {
          DEFAULT: '#fafafa',
          card:    '#ffffff',
          muted:   '#f4f4f5',
        },
      },
      fontFamily: {
        sans:    ['var(--font-geist-sans)', 'sans-serif'],
        mono:    ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-display)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
