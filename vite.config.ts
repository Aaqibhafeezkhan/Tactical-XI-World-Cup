import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/Tactical-XI-World-Cup-2026/' : '/',
  server: { port: 5173 },
});
