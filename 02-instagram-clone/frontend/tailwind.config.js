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
        instagram: {
          pink: '#E1306C',
          purple: '#C13584',
          orange: '#F77737',
          yellow: '#FCAF45',
        },
      },
    },
  },
  plugins: [],
};
