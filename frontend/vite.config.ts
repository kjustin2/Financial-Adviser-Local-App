import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'  // Use SWC for faster compilation
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    // Optimize dev server performance
    hmr: {
      port: 24678, // Use a different port for HMR
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Optimize build performance
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',  // Only sourcemaps in dev
    target: 'esnext',  // Use latest JS features for smaller bundles
    minify: 'esbuild', // Use esbuild for faster minification
    cssMinify: 'esbuild', // Use esbuild for CSS minification
    rollupOptions: {
      output: {
        // Optimized manual chunks for better caching
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          // Routing
          'router': ['react-router-dom'],
          // UI Components (split by frequency of change)
          'ui-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label', 
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs'
          ],
          // Data visualization
          'charts': ['recharts'],
          // Form handling
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // HTTP client and state management
          'data': ['axios', '@tanstack/react-query'],
          // Utility libraries
          'utils': ['clsx', 'class-variance-authority', 'tailwind-merge', 'date-fns'],
          // Icons
          'icons': ['lucide-react'],
        },
        // Optimize chunk file names for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk'
          return `js/[name]-[hash].js`
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
      },
    },
    // Build performance optimizations
    reportCompressedSize: false, // Disable gzip reporting for faster builds
    chunkSizeWarningLimit: 1000, // Increase warning limit
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'react-hook-form',
      'zod'
    ],
    // Force pre-bundling of these packages
    force: false,
  },
  // Enable esbuild for faster builds
  esbuild: {
    target: 'esnext',
    // Enable advanced optimizations
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
})