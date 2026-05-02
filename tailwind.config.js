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
      },
      fontFamily: {
        sans: ['"Mona Sans"', '"Inter Tight"', '-apple-system', '"Helvetica Neue"', 'sans-serif'],
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
