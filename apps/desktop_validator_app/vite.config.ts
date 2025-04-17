import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { PluginOption } from 'vite'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react() as PluginOption, tailwindcss()],
  base: './',
  build: {
    outDir: 'dist-react',
  },
  server: {
    port: 7661,
    strictPort: true,
  }
})
