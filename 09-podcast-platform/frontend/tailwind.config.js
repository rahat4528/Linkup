/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0c0e14',
        surface: '#141824',
        primary: '#8b5cf6',
        accent: '#ec4899',
        muted: '#94a3b8',
      },
    },
  },
  plugins: [],
};
