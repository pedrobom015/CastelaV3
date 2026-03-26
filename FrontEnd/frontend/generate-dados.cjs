const fs = require('fs')
const path = require('path')

const src = path.resolve(__dirname, 'dados-teste')
const dest = path.resolve(__dirname, 'public', 'dados-teste')

if (!fs.existsSync(src)) {
  console.error('[generate-dados] Pasta dados-teste não encontrada.')
  process.exit(1)
}

// Garante que public/dados-teste existe
fs.mkdirSync(dest, { recursive: true })

// Copia todos os arquivos .DBF/.dbf
const files = fs.readdirSync(src).filter(f => f.toLowerCase().endsWith('.dbf'))

for (const file of files) {
  fs.copyFileSync(path.join(src, file), path.join(dest, file))
}

// Gera index.json com a lista de arquivos
fs.writeFileSync(path.join(dest, 'index.json'), JSON.stringify(files))

console.log(`[generate-dados] ${files.length} arquivo(s) copiado(s) para public/dados-teste/`)
