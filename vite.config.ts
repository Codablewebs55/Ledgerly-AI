import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { tempoVitePlugin } from 'tempo-sdk'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// tempoVitePlugin() only activates under Tempo's TEMPO=true dev environment.
export default defineConfig({
  plugins: [tempoVitePlugin(), react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
})
