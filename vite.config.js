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
        target: 'http://16.171.4.170:8081',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://16.171.4.170:8081',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
