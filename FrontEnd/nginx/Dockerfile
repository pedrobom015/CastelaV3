FROM nginx:1.27-alpine

# Copia o app principal (dist) para o diretório padrão do Nginx
COPY dist/ /usr/share/nginx/html


# Substitui a configuração padrão
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe as duas portas
EXPOSE 80

# Mantém o Nginx rodando em primeiro plano
CMD ["nginx", "-g", "daemon off;"]
