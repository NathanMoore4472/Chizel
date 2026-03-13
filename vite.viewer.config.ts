import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  define: {
    __APP_ROOT__: JSON.stringify(__dirname),
  },
  resolve: {
    alias: {
      '@/store': path.resolve(__dirname, './src/viewer/store-shim.ts'),
      '@': path.resolve(__dirname, './src'),
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
