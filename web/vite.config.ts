import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Financial-Adviser-Local-App/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          storage: ['dexie'],
          utils: ['date-fns', 'zod', 'clsx'],
          state: ['zustand'],
          ui: ['lucide-react']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['dexie', 'zustand', 'zod']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  }
})