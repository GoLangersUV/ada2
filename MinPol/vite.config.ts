// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [react()],
  build: {
    outDir: 'dist', // Ensure this matches your desired output directory
    rollupOptions: {
      // Rollup options if needed
    },
  },
  // Use the build hook to copy the server.js file
});

