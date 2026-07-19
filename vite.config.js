// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config() // read .env / .env.local

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const ELEVEN_KEY = env.ELEVENLABS_API_KEY

  return {
    plugins: [react()],
    // Multi-page static site. Without these explicit entries Vite only
    // ships index.html to dist/, so every case-study-*.html link 404s
    // in production. List each one as a rollup input.
    build: {
      rollupOptions: {
        input: {
          main:       resolve(__dirname, 'index.html'),
          prepPoint:  resolve(__dirname, 'work/prep-point/index.html'),
          superior:   resolve(__dirname, 'work/superior-accounting/index.html'),
          ttt:        resolve(__dirname, 'work/ttt/index.html'),
          littleOaks: resolve(__dirname, 'work/little-oaks/index.html'),
          ziaUlQuran: resolve(__dirname, 'work/zia-ul-quran/index.html'),
          ziaUlUmmah: resolve(__dirname, 'work/zia-ul-ummah/index.html'),
          eyos:       resolve(__dirname, 'work/eyos/index.html'),
        },
      },
    },
    server: {
      proxy: {
        '/eleven': {
          target: 'https://api.elevenlabs.io',
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/eleven/, ''),
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq) => {
              if (ELEVEN_KEY) proxyReq.setHeader('xi-api-key', ELEVEN_KEY)
            })
          }
        }
      }
    }
  }
})
