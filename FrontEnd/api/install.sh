#!/usr/bin/env bash
set -e

echo "1️⃣  Instalando dependências..."
npm install

echo "2️⃣  Gerando Prisma Client..."
npx prisma generate

echo "✅  Tudo pronto! Agora basta executar: npm run dev"
