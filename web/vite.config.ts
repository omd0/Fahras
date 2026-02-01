import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
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
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      clientPort: 3000,
    },
    allowedHosts: [
      '.localhost', 'localhost', 'node', 'nginx',
      'app.saudiflux.org', '.saudiflux.org',
      '.cranl.net', '.traefik.me',
      ...(process.env.VITE_ALLOWED_HOSTS?.split(',').filter(Boolean) ?? []),
    ],
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

