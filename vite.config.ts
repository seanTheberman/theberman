import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['lucide-react', 'clsx', 'tailwind-merge'],
          'form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'map': ['leaflet', 'react-leaflet', 'leaflet.markercluster', 'react-leaflet-cluster'],
          'cms': ['react-quill-new', 'react-hot-toast'],
          'stripe': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
        },
      },
    },
  },
})
