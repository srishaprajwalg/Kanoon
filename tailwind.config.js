/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        muted: 'var(--color-text-muted)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        legal: {
          50: '#F4F7FB',
          100: '#E6EDF5',
          200: '#CCDCEB',
          300: '#A3BFDC',
          400: '#6F9BC8',
          500: '#4376B2',
          600: '#2E5A96',
          700: '#1E3E6B',
          800: '#122745',
          900: '#0B192C',
          950: '#060E1A',
        },
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        saffron: {
          500: '#FF9933',
          600: '#E67E22',
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Merriweather', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'glow-blue': '0 0 25px -5px rgba(67, 118, 178, 0.3)',
      }
    },
  },
  plugins: [],
}
