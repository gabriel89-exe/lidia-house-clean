import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa React e ReactDOM em chunk próprio (fica em cache no browser)
          react: ['react', 'react-dom'],
          // Separa o cliente Supabase (biblioteca grande) em chunk próprio
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
