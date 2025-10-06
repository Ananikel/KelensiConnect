import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true, // Needed for Docker container port mapping
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Proxy to backend in local dev without docker
        changeOrigin: true,
      }
    }
  }
})
