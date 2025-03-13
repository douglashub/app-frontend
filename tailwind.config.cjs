/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        screens: {
          '3xl': '1920px',
          '4xl': '2560px'
        },
        colors: {
          primary: '#1e40af',
          secondary: '#1d4ed8',
          success: '#16a34a',
          danger: '#dc2626'
        }
      },
    },
    plugins: [],
    safelist: [
      // Add dynamic classes that might be purged
      'bg-blue-100',
      'text-blue-500',
      'bg-green-100',
      'text-green-500',
      'bg-purple-100',
      'text-purple-500',
      'bg-yellow-100',
      'text-yellow-800',
      'bg-red-100',
      'text-red-800',
    ]
  }