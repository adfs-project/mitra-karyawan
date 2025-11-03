
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url';

// FIX: __dirname is not available in ES modules, so we define it manually.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Admin portal runs on port 3001
  },
  resolve: {
    alias: {
      '@mk/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
})
