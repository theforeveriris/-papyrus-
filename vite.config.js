import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages 项目页面需要 base 路径，开发模式不需要
  base: mode === 'production' ? '/papyrus/' : '/',
  server: {
    port: 5173,
    host: true
  }
}))
