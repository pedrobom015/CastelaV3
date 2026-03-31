import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const dadosTeste = () => ({
  name: 'serve-dados-teste',
  configureServer(server: any) {
    const dadosDir = path.resolve(__dirname, 'dados-teste')
    server.middlewares.use('/dados-teste', (req: any, res: any, next: any) => {
      try {
        const fileName = (req.url || '').replace(/^\//, '')
        if (fileName === 'index.json') {
          if (!fs.existsSync(dadosDir)) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Pasta dados-teste não encontrada. Execute: node seed-data.cjs' }))
            return
          }
          const files = fs.readdirSync(dadosDir).filter((f: string) => f.toLowerCase().endsWith('.dbf'))
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(files))
          return
        }
        const filePath = path.join(dadosDir, fileName)
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader('Content-Type', 'application/octet-stream')
          fs.createReadStream(filePath).pipe(res)
        } else {
          next()
        }
      } catch (e) {
        console.error('[dados-teste] Erro no middleware:', e)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: String(e) }))
      }
    })
  },
})

export default defineConfig({
  plugins: [react(), dadosTeste()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/api/, ''),
        changeOrigin: true,
      },
    },
  },
})
