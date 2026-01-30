// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config() // read .env / .env.local

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const ELEVEN_KEY = env.ELEVENLABS_API_KEY

  return {
    plugins: [react()],
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
