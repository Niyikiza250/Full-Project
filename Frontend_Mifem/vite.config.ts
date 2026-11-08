import { defineConfig, type PreviewServer, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

const UPLOADS_DIR = path.resolve('frontend/uploads')

function getMimeType(ext: string): string {
  const mime: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  }
  return mime[ext] || 'application/octet-stream'
}

function registerUploadsServer(server: ViteDevServer | PreviewServer) {
  server.middlewares.use('/frontend/uploads', (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) { res.writeHead(404); res.end(); return }
    const filename = path.basename(req.url.split('?')[0])
    const filepath = path.join(UPLOADS_DIR, filename)
    if (fs.existsSync(filepath)) {
      const ext = path.extname(filepath).toLowerCase()
      res.writeHead(200, { 'Content-Type': getMimeType(ext), 'Cache-Control': 'public, max-age=31536000' })
      fs.createReadStream(filepath).pipe(res)
    } else {
      res.writeHead(404)
      res.end()
    }
  })
}

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    react(),
    {
      name: 'serve-uploads',
      closeBundle() {
        const src = UPLOADS_DIR
        const dest = path.resolve('dist/frontend/uploads')
        if (fs.existsSync(src)) {
          fs.mkdirSync(dest, { recursive: true })
          for (const file of fs.readdirSync(src)) {
            fs.copyFileSync(path.join(src, file), path.join(dest, file))
          }
        }
      },
    },
    {
      name: 'serve-frontend-uploads',
      configureServer(server) {
        registerUploadsServer(server)
      },
      configurePreviewServer(server) {
        registerUploadsServer(server)
      },
    },
  ],
  build: {
    // The Rwanda location dataset is lazily loaded and intentionally large.
    chunkSizeWarningLimit: 5000,
  },
  server: {
    open: '/',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    open: '/',
  },
})
