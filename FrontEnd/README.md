🚀 Presserv - Infraestrutura & Frontend

Este repositório gerencia a aplicação utilizando Nginx como Proxy Reverso e React (Vite) como Frontend.

Estruturada em duas camadas:

# Ambiente Desenvolvimento

1. Desenvolvimento (Modificações e Testes)
   Utilize este modo para codificação ativa com Hot Reload. Ignore o Docker nesta fase.

**Navegue até o frontend**

cd frontend

**Inicie o servidor de desenvolvimento**

npm run start-app

Acesso: http://localhost:5173

# Ambiente Produção

**1. Gere os arquivos de distribuição (Obrigatório)**

cd frontend && npm run build

**2. Volte para a raiz e execute o deploy**

cd ..
./deploy.sh

Funcionamento do Deploy:

1. Build: O Dockerfile copia a pasta dist/ gerada para dentro do container.
2. Isolamento: O frontend fica exposto apenas internamente para o Nginx na porta 80.
3. Proxy: O Nginx na raiz recebe o tráfego externo e repassa para o container do frontend.
   📊 Matriz de Portas e Acessos
   Ambiente URL de Acesso Porta Host Porta Container
   Desenvolvimento http://localhost:5173 5173 -
   Produção (HTTP) http://localhost:80 80 80
   Produção (HTTPS) https://localhost:443 443 443
   ⚠️ Observações Técnicas

- SPA Fallback: O arquivo nginx.conf-frontend contém a regra try_files $uri /index.html. Isso evita erro 404 ao atualizar rotas do React Router.
- Logs: Para debugar o tráfego no Proxy: docker logs -f presserv-nginx.
- SSL: Certifique-se de que os arquivos cert.pem e privkey.pem estejam presentes na pasta /nginx antes de subir o container.
