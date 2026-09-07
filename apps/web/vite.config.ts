import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base 固定为相对空串,允许部署在任意子路径(如 https://host/onyxforge/ 或根路径)
// 生产由壳与 /tools/* 静态同源提供;这里只负责壳自身的构建。
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
  server: {
    host: '127.0.0.1',
    port: 5174,
  },
});
