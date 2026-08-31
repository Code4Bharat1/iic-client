/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: '#F6F7F9',
        ink: {
          900: '#101828',
          800: '#1D2939',
          700: '#344054',
          600: '#475467',
          500: '#667085',
          400: '#98A2B3',
          300: '#D0D5DD',
          200: '#E4E7EC',
          100: '#F2F4F7',
          50: '#F9FAFB',
        },
        brand: {
          950: '#0B2540',
          900: '#0F2F52',
          800: '#123A66',
          700: '#16497F',
          600: '#1C5A9C',
          500: '#256FBD',
          200: '#C7DDF3',
          100: '#E4EEF9',
          50: '#F1F6FC',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
        popover: '0 4px 12px -2px rgba(16, 24, 40, 0.12), 0 2px 4px -2px rgba(16, 24, 40, 0.06)',
      },
      borderRadius: {
        md: '8px',
        lg: '10px',
      },
    },
  },
  plugins: [],
};
