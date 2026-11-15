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
        music: {
          green: '#1db954',
          hoverGreen: '#1ed760',
          dark: '#121212',
          black: '#000000',
          card: '#181818',
          cardHover: '#282828',
          subtext: '#b3b3b3'
        }
      }
    },
  },
  plugins: [],
};
