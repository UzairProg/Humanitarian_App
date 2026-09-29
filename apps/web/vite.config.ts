import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@al-husseiniya/types': path.resolve(__dirname, '../../packages/types/src'),
      '@al-husseiniya/config': path.resolve(__dirname, '../../packages/config/src'),
      '@al-husseiniya/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@al-husseiniya/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
