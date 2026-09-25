import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      watch: {
        // Reliable file watching when the project is bind-mounted into Docker on Windows.
        usePolling: true,
        interval: 300,
      },
    },
  }
})
