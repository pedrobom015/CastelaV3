#!/bin/bash

set -e

FRONTEND1_CONTAINER="presserv-frontend1"
BACKEND_CONTAINER="presserv-backend"
NGINX_CONTAINER="presserv-nginx"

FRONTEND1_IMAGE="integration_front-frontend1"
BACKEND_IMAGE="integration_front-backend"

echo "🔄 Parando e removendo containers antigos se existirem..."
docker rm -f $FRONTEND1_CONTAINER $BACKEND_CONTAINER $NGINX_CONTAINER 2>/dev/null || true

echo "🧹 Removendo imagens antigas específicas..."
docker rmi -f $FRONTEND1_IMAGE $BACKEND_IMAGE 2>/dev/null || true

echo "🧹 Limpando imagens órfãs..."
docker image prune -f

echo "🐳 Buildando novas imagens..."
docker-compose build --no-cache

echo "🚀 Subindo containers..."
docker-compose up -d

echo "✅ Deploy finalizado!"
echo "Frontend: https://localhost"
echo "API:      https://localhost/api/"
echo "API docs: https://localhost/api/docs"
