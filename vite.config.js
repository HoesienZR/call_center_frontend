import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      '192.168.20.28', // IP مورد نظر شما
      'localhost', // اگر می‌خواهید localhost هم کار کند، این را اضافه کنید
      '127.0.0.1'
    ]
  }
})
