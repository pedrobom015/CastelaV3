# Licenca-App

Projeto Next.js com Prisma e MySQL para gerenciamento de licenças.

## Instalação

1. Renomeie `.env.example` para `.env` e configure sua string de conexão MySQL.
2. Rode o script de instalação:

```bash
npm run install.sh
```

ou manual:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Rotas

- **GET** `/api/validar-licenca/{client_key}`: Valida a licença.
- **PUT** `/api/keepalive/{client_key}`: Atualiza keepalive.
- **POST** `/api/keepalive`: Cria nova licença.

