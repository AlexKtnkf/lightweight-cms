import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      react({
        // Enable React development mode for better error messages
        jsxRuntime: 'automatic',
        // Force development mode unless explicitly building for production
        babel: {
          plugins: isProduction ? [] : [
            // Add development-only plugins if needed
          ],
        },
      })
    ],
    base: '/admin/',
    // In middleware mode, Vite doesn't need server config
    // It's served through Express
    build: {
      outDir: '../public/admin',
      emptyOutDir: true,
      // Always enable source maps for better error messages
      sourcemap: true,
      // Don't minify in development
      minify: isProduction ? 'esbuild' : false,
    },
    // Ensure we're in development mode when not explicitly building for production
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    },
    // Ensure esbuild doesn't drop console logs in dev
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
    },
  };
})
