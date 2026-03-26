#!/bin/bash
set -e

# ── Configurações ──────────────────────────────────────────────────────────────
EC2_HOST="3.149.31.159"
EC2_USER="ec2-user"
EC2_KEY="$HOME/Downloads/server01.pem"
REMOTE_DIR="/home/ec2-user/demo"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"
SSH="ssh -i $EC2_KEY -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST"
# ──────────────────────────────────────────────────────────────────────────────

echo "▶ Build das imagens localmente (linux/amd64 para EC2)..."
docker buildx build --platform linux/amd64 --load -t presserv-frontend1 -f "$LOCAL_DIR/frontend/Dockerfile-frontend1"  "$LOCAL_DIR/frontend"
docker buildx build --platform linux/amd64 --load -t presserv-backend   -f "$LOCAL_DIR/backend/Dockerfile"              "$LOCAL_DIR/backend"
docker buildx build --platform linux/amd64 --load -t presserv-landing   -f "$LOCAL_DIR/frontend-landing/Dockerfile"     "$LOCAL_DIR/frontend-landing"

echo ""
echo "▶ Exportando imagens para tar..."
docker save presserv-frontend1 presserv-backend presserv-landing | gzip > /tmp/presserv-images.tar.gz

echo ""
echo "▶ Enviando imagens para EC2..."
scp -i "$EC2_KEY" -o StrictHostKeyChecking=no \
  /tmp/presserv-images.tar.gz \
  "$EC2_USER@$EC2_HOST:/tmp/presserv-images.tar.gz"

echo ""
echo "▶ Enviando docker-compose e nginx.conf..."
rsync -az \
  -e "ssh -i $EC2_KEY -o StrictHostKeyChecking=no" \
  "$LOCAL_DIR/docker-compose.yml" \
  "$EC2_USER@$EC2_HOST:$REMOTE_DIR/docker-compose.yml"

scp -i "$EC2_KEY" -o StrictHostKeyChecking=no \
  "$LOCAL_DIR/nginx/nginx.conf" \
  "$EC2_USER@$EC2_HOST:$REMOTE_DIR/nginx/nginx.conf"

echo ""
echo "▶ Enviando certificados Cloudflare..."
scp -i "$EC2_KEY" -o StrictHostKeyChecking=no \
  "$LOCAL_DIR/nginx/cert.pem" \
  "$LOCAL_DIR/nginx/privkey.pem" \
  "$EC2_USER@$EC2_HOST:$REMOTE_DIR/nginx/"

echo ""
echo "▶ Subindo containers na EC2..."
$SSH bash << 'REMOTE'
set -e

echo "  Parando containers antigos..."
cd /home/ec2-user/demo
docker-compose down --remove-orphans 2>/dev/null || true

echo "  Removendo imagens antigas..."
docker rmi presserv-frontend1 presserv-backend presserv-landing 2>/dev/null || true
docker image prune -f 2>/dev/null || true

echo "  Carregando novas imagens..."
docker load < /tmp/presserv-images.tar.gz
rm -f /tmp/presserv-images.tar.gz

echo "  Subindo containers..."
docker-compose up -d

echo "  Status:"
docker ps --format 'table {{.Names}}\t{{.Status}}'
REMOTE

rm -f /tmp/presserv-images.tar.gz

echo ""
echo "✅ Deploy concluído! Acesse https://grupobompastor.presserv.org"
