
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 确保 Electron 可以通过相对路径加载资源
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
