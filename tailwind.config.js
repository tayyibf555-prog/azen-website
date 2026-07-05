/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./case-study-*.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#0071e3',
          // Secondary text on the paper ground — #86868b failed AA on
          // white at small sizes; this measures ~4.7:1.
          gray: '#6e6e73',
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
        // Brand-blue for small-text use (eyebrows, labels) on PAPER —
        // needs to be darker than #0071e3 to hold AA at 11px.
        indigo: {
          DEFAULT: '#0071e3',
          deep: '#005bb5',
          bright: 'oklch(0.47 0.17 255)',
        },
      },
      fontFamily: {
        sans: ['"Schibsted Grotesk"', '-apple-system', '"Helvetica Neue"', 'sans-serif'],
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
