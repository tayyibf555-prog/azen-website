/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./case-study-*.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#0071e3',
          gray: '#86868b',
          dark: '#1d1d1f',
        },
        ink: {
          DEFAULT: 'oklch(0.10 0.012 260)',
          deep: 'oklch(0.06 0.012 260)',
        },
        // Tinted near-white. Use instead of `text-white` (pure #fff is banned).
        paper: 'oklch(0.985 0.003 260)',
        // Lighter brand-blue for small-text use (eyebrows, labels, links).
        // Standard #0071e3 is too dark to pass WCAG AA at 12px on dark bg
        // (measures 4.08:1, needs 4.5:1). This token measures ~5.5:1.
        // Keep #0071e3 for buttons and display-size accents.
        indigo: {
          DEFAULT: '#0071e3',
          deep: '#005bb5',
          bright: 'oklch(0.78 0.16 255)',
        },
      },
      fontFamily: {
        sans: ['"Archivo"', '-apple-system', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      animation: {
        marquee: 'marquee 80s linear infinite',
        'typing-sequence': 'typingSequence 10s infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-100% - 2rem))' },
        },
      },
    },
  },
  plugins: [],
}
