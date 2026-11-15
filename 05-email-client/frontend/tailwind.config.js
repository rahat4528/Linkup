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
        mail: {
          bg: '#f6f8fc',
          darkBg: '#111827',
          sidebar: '#f2f6fc',
          darkSidebar: '#1f2937',
          selected: '#d3e3fd',
          darkSelected: '#374151',
          primary: '#0b57d0'
        }
      }
    },
  },
  plugins: [],
};
