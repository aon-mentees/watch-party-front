import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    global: 'window',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://13.61.104.21:8081',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://13.61.104.21:8081',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
