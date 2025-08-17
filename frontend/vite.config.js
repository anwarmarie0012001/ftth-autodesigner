import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      // Setiap permintaan ke '/api' akan diteruskan ke backend
      '/api': {
        // [FIX] Targetnya adalah nama layanan backend dari docker-compose
        target: 'http://ftth-backend:8000', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
  },
})