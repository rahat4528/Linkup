/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        twitter: {
          blue: '#1d9bf0',
          hover: '#1a8cd8',
          dark: '#0f1419',
          border: '#eff3f4',
          darkBorder: '#2f3336',
          darkBg: '#000000',
          darkCard: '#16181c'
        }
      }
    },
  },
  plugins: [],
};
