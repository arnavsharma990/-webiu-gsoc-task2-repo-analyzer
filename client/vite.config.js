import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }

          if (id.includes('node_modules/recharts')) {
            return 'recharts-vendor';
          }

          if (id.includes('node_modules/d3-') || id.includes('node_modules/internmap')) {
            return 'd3-vendor';
          }

          return undefined;
        }
      }
    }
  },
  preview: {
    port: 4173
  }
});
