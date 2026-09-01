/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        surface: '#FAF8F4',
        // Warm-tinted neutral scale (stone/graphite, not the generic cool-slate
        // "Untitled UI" gray) — pairs with the cream surface for a paper-like feel.
        ink: {
          950: '#161311',
          900: '#211C18',
          800: '#332B25',
          700: '#4A3F37',
          600: '#635649',
          500: '#7D6F60',
          400: '#A2937F',
          300: '#C6B9A8',
          200: '#DFD4C4',
          150: '#E9E0D3',
          100: '#F0E9DD',
          50: '#F7F2EA',
        },
        // Deep forest/petrol accent — the institutional signature color.
        brand: {
          950: '#08211D',
          900: '#0C2E28',
          800: '#123E35',
          700: '#1A5045',
          600: '#246657',
          500: '#2F7D6A',
          400: '#4C9985',
          300: '#7CB8A5',
          200: '#AFD6C7',
          150: '#CBE5DA',
          100: '#DEEEE5',
          50: '#EEF6F1',
        },
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(33, 28, 24, 0.04)',
        card: '0 1px 2px 0 rgba(33, 28, 24, 0.04), 0 1px 1px 0 rgba(33, 28, 24, 0.03)',
        raised: '0 2px 6px -1px rgba(33, 28, 24, 0.07), 0 1px 2px -1px rgba(33, 28, 24, 0.04)',
        popover: '0 12px 32px -8px rgba(22, 19, 17, 0.22), 0 4px 10px -4px rgba(22, 19, 17, 0.12)',
        focus: '0 0 0 3px rgba(47, 125, 106, 0.22)',
      },
      borderRadius: {
        sm: '6px',
        md: '9px',
        lg: '14px',
        xl: '20px',
      },
      letterSpacing: {
        tightest: '-0.04em',
        snug: '-0.015em',
      },
      backgroundImage: {
        grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
