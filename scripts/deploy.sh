#!/bin/bash

# =================================================================
# TRUECHECKIA PRODUCTION DEPLOYMENT SCRIPT
# =================================================================
# Este script automatiza o processo de deploy para produção
# Desenvolvido para uso com Vercel CLI
# =================================================================

set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="truecheckia"
DOMAIN="www.truecheckia.com"
NODE_VERSION="20"

echo -e "${BLUE}🚀 Iniciando deploy do TrueCheckIA para produção...${NC}"
echo "================================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI não encontrado. Instalando...${NC}"
    npm install -g vercel
fi

# Check Node.js version
NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_CURRENT" -lt 20 ]; then
    echo -e "${RED}❌ Node.js $NODE_VERSION+ é necessário. Versão atual: $NODE_CURRENT${NC}"
    exit 1
fi

# Pre-deployment checks
echo -e "${YELLOW}🔍 Executando verificações pré-deploy...${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Arquivo .env.production não encontrado!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo de ambiente encontrado${NC}"

# Type check
echo -e "${YELLOW}🔧 Verificando tipos TypeScript...${NC}"
npm run type-check
echo -e "${GREEN}✅ Tipos TypeScript válidos${NC}"

# Lint check
echo -e "${YELLOW}🔍 Executando lint...${NC}"
npm run lint
echo -e "${GREEN}✅ Lint passou${NC}"

# Build test
echo -e "${YELLOW}🏗️  Testando build de produção...${NC}"
NODE_OPTIONS='--max-old-space-size=4096' npm run build
echo -e "${GREEN}✅ Build de produção bem-sucedido${NC}"

# Database migration check
echo -e "${YELLOW}🗄️  Verificando migrações do banco de dados...${NC}"
if [ -d "prisma/migrations" ]; then
    echo -e "${GREEN}✅ Migrações encontradas${NC}"
else
    echo -e "${YELLOW}⚠️  Nenhuma migração encontrada${NC}"
fi

# Deploy to Vercel
echo -e "${BLUE}🚀 Fazendo deploy para Vercel...${NC}"
vercel --prod --yes

# Verify deployment
echo -e "${YELLOW}🔍 Verificando deployment...${NC}"
sleep 10

# Health check
echo -e "${YELLOW}🏥 Executando health check...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/health || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passou - API está funcionando${NC}"
else
    echo -e "${RED}❌ Health check falhou - Código HTTP: $HTTP_CODE${NC}"
    echo -e "${YELLOW}⚠️  Verificar logs no Vercel Dashboard${NC}"
fi

# Success message
echo "================================================================="
echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo -e "${BLUE}🌐 URL: https://$DOMAIN${NC}"
echo -e "${BLUE}📊 Dashboard: https://vercel.com/dashboard${NC}"
echo "================================================================="

# Post-deployment checklist
echo -e "${YELLOW}📋 CHECKLIST PÓS-DEPLOY:${NC}"
echo "□ Verificar se todas as páginas estão carregando"
echo "□ Testar fluxo de autenticação completo"
echo "□ Verificar integração com Stripe"
echo "□ Confirmar envio de emails"
echo "□ Testar análise de IA"
echo "□ Verificar Google OAuth"
echo "□ Monitorar logs por 24h"

echo -e "${GREEN}Deploy finalizado! 🚀${NC}"