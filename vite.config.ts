import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.') 
    }
  },
  // 这里的 define 块删掉了，因为我们已经在代码里用了 import.meta.env
  // 这里的 base 也没设置，默认为 '/'，这正是 Vercel 需要的
})
