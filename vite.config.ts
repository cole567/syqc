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
  // 👇👇👇 新增这一段，专门解决 "process is not defined" 错误 👇👇👇
  define: {
    'process.env': {}
  }
})
