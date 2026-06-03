import { defineConfig, type PreviewServer, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { IncomingMessage, ServerResponse } from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ACCHIEVEMENT_DIR = path.resolve('public/acchievement')
const SYSTEM_SETTINGS_DIR = path.resolve('public/system-settings')

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => resolve(body))
  })
}

function registerAchievementStorage(server: ViteDevServer | PreviewServer) {
  server.middlewares.use('/api/acchievement/data', async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url!

    // List all achievements
    if (req.method === 'GET' && (url === '/' || url === '')) {
      const dataDir = path.join(ACCHIEVEMENT_DIR, 'data')
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
      const dataDir = path.join(ACCHIEVEMENT_DIR, 'data')
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

  server.middlewares.use('/api/acchievement/images', async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url!
    const match = url.match(/\/(.+)\.png\/?$/)
    if (match && req.method === 'PUT') {
      const id = match[1]
      const imagesDir = path.join(ACCHIEVEMENT_DIR, 'images')
      fs.mkdirSync(imagesDir, { recursive: true })

      const body = await readRequestBody(req)
      const { dataUrl } = JSON.parse(body) as { dataUrl: string }
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
      fs.writeFileSync(path.join(imagesDir, `${id}.png`), Buffer.from(base64, 'base64'))
      const publicPath = `/acchievement/images/${id}.png`
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ path: publicPath }))
      return
    }

    res.writeHead(404)
    res.end()
  })
}

function registerSystemSettings(server: ViteDevServer | PreviewServer) {
  server.middlewares.use('/api/system-settings/language', async (req: IncomingMessage, res: ServerResponse) => {
    const settingsFile = path.join(SYSTEM_SETTINGS_DIR, 'language.json')

    if (req.method === 'GET') {
      if (!fs.existsSync(settingsFile)) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ language: 'en' }))
        return
      }

      const raw = fs.readFileSync(settingsFile, 'utf-8')
      const stripped = raw.replace(/^\uFEFF/, '')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(stripped)
      return
    }

    if (req.method === 'PUT') {
      const body = await readRequestBody(req)
      fs.mkdirSync(SYSTEM_SETTINGS_DIR, { recursive: true })
      fs.writeFileSync(settingsFile, body, 'utf-8')
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
  plugins: [
    react(),
    tsconfigPaths(),
    {
      name: 'acchievement-storage',
      configureServer(server) {
        registerAchievementStorage(server)
        registerSystemSettings(server)
      },
      configurePreviewServer(server) {
        registerAchievementStorage(server)
        registerSystemSettings(server)
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
