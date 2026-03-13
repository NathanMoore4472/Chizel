import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/store': path.resolve(__dirname, './src/viewer/store-shim.ts'),
    },
  },
  build: {
    outDir: 'dist-viewer',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        viewer: path.resolve(__dirname, 'viewer.html'),
      },
    },
  },
})
