#!/bin/bash
# ADP - Controle de Processos da Funerária
# Script de inicialização para Linux e macOS

echo ""
echo " ============================================"
echo "  ADP - Controle de Processos da Funeraria"
echo "  Presserv Informatica Ltda"
echo " ============================================"
echo ""

# Detecta o sistema operacional
OS="$(uname -s)"

# Verifica se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo " [ERRO] Node.js nao encontrado no sistema!"
    echo ""
    echo " Para instalar o Node.js:"
    echo ""
    if [ "$OS" = "Darwin" ]; then
        echo "  macOS:"
        echo "  1. Acesse https://nodejs.org e baixe a versao LTS"
        echo "     OU instale via Homebrew: brew install node"
    else
        echo "  Linux (Ubuntu/Debian):"
        echo "    sudo apt update && sudo apt install nodejs npm"
        echo "  Linux (Fedora/RHEL):"
        echo "    sudo dnf install nodejs"
        echo "  Linux (Arch):"
        echo "    sudo pacman -S nodejs npm"
    fi
    echo ""
    exit 1
fi

NODE_VER=$(node --version)
echo " Node.js detectado: $NODE_VER"
echo ""

# Vai para a pasta onde o script está
cd "$(dirname "$0")"

# Instala dependências na primeira execução
if [ ! -d "node_modules" ]; then
    echo " Primeira execucao: instalando dependencias..."
    echo " Aguarde, isso pode demorar alguns minutos."
    echo ""
    npm install
    echo ""
fi

# Abre o navegador após 3 segundos em background
(
    sleep 3
    if [ "$OS" = "Darwin" ]; then
        open http://localhost:3000
    else
        xdg-open http://localhost:3000 &> /dev/null || \
        sensible-browser http://localhost:3000 &> /dev/null || \
        echo " Abra manualmente: http://localhost:3000"
    fi
) &

echo " Servidor iniciando em http://localhost:3000"
echo " Pressione Ctrl+C para encerrar."
echo ""

npm run dev
