import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  // 👇 专门解决各种 "Not Defined" 报错的补丁
  define: {
    'process.env': {},
    global: 'window', // 有些库需要这个
  }
});
