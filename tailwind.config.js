/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./case-study-*.html", "./work/**/*.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#0071e3',
          gray: '#86868b',
          dark: '#1d1d1f',
        },
        // Ink navy — the light theme's text colours. text-ink for body,
        // ink/NN alphas for hairlines and fills on paper.
        ink: {
          DEFAULT: 'oklch(0.18 0.030 260 / <alpha-value>)',
          deep: 'oklch(0.13 0.030 260 / <alpha-value>)',
        },
        // Tinted near-white — text ON blue drench grounds and buttons.
        paper: 'oklch(0.985 0.003 260 / <alpha-value>)',
        // Lighter brand-blue for small-text use (eyebrows, labels) on the
        // navy ground — #0071e3 is too dark to hold AA at 11px on dark.
        indigo: {
          DEFAULT: '#0071e3',
          deep: '#005bb5',
          bright: 'oklch(0.78 0.16 255)',
        },
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', '-apple-system', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        // Geist Light for the thin display lines (user-tuned pairing).
        geist: ['"Geist"', '"Hanken Grotesk"', '-apple-system', 'sans-serif'],
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
