// my-portfolio/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use relative paths so it works in a subfolder like /dance-portfolio/
  base: './',
})