import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { bundleSizeTrackerVite } from '../../dist/index.js';

export default defineConfig({
  plugins: [
    vue(),
    bundleSizeTrackerVite({
      maxSize: 400,
      outputFormat: 'html',
      outputPath: './bundle-report'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'chart': ['chart.js']
        }
      }
    }
  }
});
