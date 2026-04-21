import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F1117',
          secondary: '#1A1D27',
          tertiary: '#252836',
        },
        border: '#2E3244',
        text: {
          primary: '#F1F3F9',
          secondary: '#8B92A9',
          muted: '#4E5568',
        },
        accent: {
          blue: '#4F86F7',
          'blue-hover': '#6B9BF8',
        },
        success: '#34D399',
        warning: '#FBBF24',
        danger: '#F87171',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
