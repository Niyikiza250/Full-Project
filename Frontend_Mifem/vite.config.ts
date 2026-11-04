import { defineConfig, type PreviewServer, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { IncomingMessage, ServerResponse } from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ACHIEVEMENT_DIR = path.resolve('public/achievement')
const SYSTEM_SETTINGS_DIR = path.resolve('public/system-settings')

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => resolve(body))
  })
}

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

function registerAchievementStorage(server: ViteDevServer | PreviewServer) {
  server.middlewares.use('/api/achievement/data', async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url!

    // List all achievements
    if (req.method === 'GET' && (url === '/' || url === '')) {
      const dataDir = path.join(ACHIEVEMENT_DIR, 'data')
      if (!fs.existsSync(dataDir)) { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('[]'); return }
      const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'))
      const items = files.map(f => {
        const raw = fs.readFileSync(path.join(dataDir, f), 'utf-8')
        const stripped = raw.replace(/^\uFEFF/, '')
        return JSON.parse(stripped)
      })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(items))
      return
    }

    // Save or delete achievement data
    const match = url.match(/\/(.+)\.json\/?$/)
    if (match) {
      const id = match[1]
      const dataDir = path.join(ACHIEVEMENT_DIR, 'data')
      fs.mkdirSync(dataDir, { recursive: true })

      if (req.method === 'PUT') {
        const body = await readRequestBody(req)
        fs.writeFileSync(path.join(dataDir, `${id}.json`), body, 'utf-8')
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
        return
      }

      if (req.method === 'DELETE') {
        const filePath = path.join(dataDir, `${id}.json`)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
        return
      }
    }

    res.writeHead(404)
    res.end()
  })

  server.middlewares.use('/api/achievement/images', async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url!
    const match = url.match(/\/(.+)\.png\/?$/)
    if (match && req.method === 'PUT') {
      const id = match[1]
      const imagesDir = path.join(ACHIEVEMENT_DIR, 'images')
      fs.mkdirSync(imagesDir, { recursive: true })

      const body = await readRequestBody(req)
      const { dataUrl } = JSON.parse(body) as { dataUrl: string }
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
      fs.writeFileSync(path.join(imagesDir, `${id}.png`), Buffer.from(base64, 'base64'))
      const publicPath = `/achievement/images/${id}.png`
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ path: publicPath }))
      return
    }

    res.writeHead(404)
    res.end()
  })
}

function registerSystemSettings(server: ViteDevServer | PreviewServer) {
  server.middlewares.use('/api/system-settings', async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url!
    fs.mkdirSync(SYSTEM_SETTINGS_DIR, { recursive: true })

    // GET /api/system-settings/language
    if (url === '/language' && req.method === 'GET') {
      const settingsFile = path.join(SYSTEM_SETTINGS_DIR, 'language.json')
      if (!fs.existsSync(settingsFile)) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ language: 'en' }))
        return
      }
      const raw = fs.readFileSync(settingsFile, 'utf-8')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(raw.replace(/^\uFEFF/, ''))
      return
    }

    // PUT /api/system-settings/language
    if (url === '/language' && req.method === 'PUT') {
      const body = await readRequestBody(req)
      fs.writeFileSync(path.join(SYSTEM_SETTINGS_DIR, 'language.json'), body, 'utf-8')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
      return
    }

    // GET /api/system-settings/smtp
    if (url === '/smtp' && req.method === 'GET') {
      const smtpFile = path.join(SYSTEM_SETTINGS_DIR, 'smtp.json')
      if (!fs.existsSync(smtpFile)) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ value: null }))
        return
      }
      const raw = fs.readFileSync(smtpFile, 'utf-8')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(raw.replace(/^\uFEFF/, ''))
      return
    }

    // PUT /api/system-settings/smtp
    if (url === '/smtp' && req.method === 'PUT') {
      const body = await readRequestBody(req)
      fs.writeFileSync(path.join(SYSTEM_SETTINGS_DIR, 'smtp.json'), body, 'utf-8')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
      return
    }

    // GET /api/system-settings/:key — generic setting read
    const getMatch = url.match(/^\/([a-z_]+)$/)
    if (getMatch && req.method === 'GET') {
      const key = getMatch[1]
      const filePath = path.join(SYSTEM_SETTINGS_DIR, `${key}.json`)
      if (!fs.existsSync(filePath)) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ data: { key, value: null } }))
        return
      }
      const raw = fs.readFileSync(filePath, 'utf-8')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ data: { key, value: raw.replace(/^\uFEFF/, '').replace(/^"|"$/g, '') } }))
      return
    }

    // PUT /api/system-settings/:key — generic setting write
    const putMatch = url.match(/^\/([a-z_]+)$/)
    if (putMatch && req.method === 'PUT') {
      const key = putMatch[1]
      const body = await readRequestBody(req)
      const parsed = JSON.parse(body)
      const rawValue = String(parsed.value)
      fs.writeFileSync(path.join(SYSTEM_SETTINGS_DIR, `${key}.json`), JSON.stringify(rawValue), 'utf-8')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
      return
    }

    res.writeHead(404)
    res.end()
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
      name: 'achievement-storage',
      configureServer(server) {
        registerUploadsServer(server)
        registerAchievementStorage(server)
        registerSystemSettings(server)
      },
      configurePreviewServer(server) {
        registerUploadsServer(server)
        registerAchievementStorage(server)
        registerSystemSettings(server)
      },
    },
  ],
  build: {
    // The Rwanda location dataset is lazily loaded and intentionally large.
    chunkSizeWarningLimit: 5000,
  },
  server: {
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
})
