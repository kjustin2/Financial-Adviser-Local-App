/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'  // Use SWC for faster compilation
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: false,  // Disable CSS processing for faster tests
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**', '**/.{idea,git,cache,output,temp}/**'],
    
    // Performance optimizations
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1,
      },
    },
    
    // Test execution optimizations  
    maxConcurrency: 5,  // Reduced for stability
    
    // Coverage optimizations
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'e2e/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.*',
        '**/*.spec.*',
      ],
      enabled: false,
    },
    
    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Watch mode optimizations
    watchExclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
  
  // Optimize build for testing
  esbuild: {
    target: 'node18',  // Match your Node.js version for optimal performance
  },
  
  // Pre-bundle test dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event',
      'vitest',
    ],
  },
})