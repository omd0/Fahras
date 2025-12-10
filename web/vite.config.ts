import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      clientPort: 3000,
    },
    allowedHosts: ['.localhost', 'localhost', 'node', 'nginx', 'app.saudiflux.org', '.saudiflux.org'],
    fs: {
      strict: false,
      allow: ['..'],
    },
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
  envPrefix: 'VITE_',
})

