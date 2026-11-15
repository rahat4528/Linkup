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
        chat: {
          bg: '#0f172a',
          sidebar: '#1e293b',
          bubbleSelf: '#0284c7',
          bubbleOther: '#334155',
          border: '#334155',
          input: '#1e293b'
        }
      }
    },
  },
  plugins: [],
};
