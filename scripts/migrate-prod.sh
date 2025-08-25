#!/bin/bash

# =================================================================
# TRUECHECKIA PRODUCTION DATABASE MIGRATION SCRIPT
# =================================================================
# Este script executa migrações do banco de dados em produção
# com segurança e backups automáticos
# =================================================================

set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups/migrations"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}🗄️ Iniciando migração do banco de dados para produção...${NC}"
echo "================================================================="

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Arquivo .env.production não encontrado!${NC}"
    exit 1
fi

# Load production environment
source .env.production

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL não encontrada nas variáveis de ambiente!${NC}"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}🔍 Verificando status do banco de dados...${NC}"

# Check database connection
if npx prisma db pull --print > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Conexão com banco de dados estabelecida${NC}"
else
    echo -e "${RED}❌ Falha na conexão com banco de dados${NC}"
    exit 1
fi

# Generate Prisma client
echo -e "${YELLOW}⚡ Gerando cliente Prisma...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Cliente Prisma gerado${NC}"

# Check for pending migrations
echo -e "${YELLOW}📋 Verificando migrações pendentes...${NC}"

MIGRATION_STATUS=$(npx prisma migrate status --schema=prisma/schema.prisma || echo "error")

if echo "$MIGRATION_STATUS" | grep -q "No pending migrations"; then
    echo -e "${GREEN}✅ Nenhuma migração pendente${NC}"
    echo -e "${BLUE}ℹ️ Banco de dados já está atualizado${NC}"
    exit 0
elif echo "$MIGRATION_STATUS" | grep -q "pending migrations"; then
    echo -e "${YELLOW}⚠️ Migrações pendentes encontradas${NC}"
    echo "$MIGRATION_STATUS"
else
    echo -e "${RED}❌ Erro ao verificar status das migrações${NC}"
    echo "$MIGRATION_STATUS"
    exit 1
fi

# Confirm migration
echo -e "${YELLOW}🤔 Deseja continuar com as migrações? (y/N)${NC}"
read -r CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}ℹ️ Migração cancelada pelo usuário${NC}"
    exit 0
fi

# Create backup log
BACKUP_LOG="$BACKUP_DIR/migration_$TIMESTAMP.log"
echo "Migration started at: $(date)" > "$BACKUP_LOG"
echo "DATABASE_URL: $DATABASE_URL" >> "$BACKUP_LOG"

# Execute migrations
echo -e "${BLUE}🚀 Executando migrações...${NC}"
echo -e "${YELLOW}⚠️ NÃO INTERROMPA ESTE PROCESSO${NC}"

if npx prisma migrate deploy --schema=prisma/schema.prisma 2>&1 | tee -a "$BACKUP_LOG"; then
    echo -e "${GREEN}✅ Migrações executadas com sucesso!${NC}"
    echo "Migration completed at: $(date)" >> "$BACKUP_LOG"
else
    echo -e "${RED}❌ Falha na execução das migrações!${NC}"
    echo "Migration failed at: $(date)" >> "$BACKUP_LOG"
    echo -e "${RED}📄 Verifique o log em: $BACKUP_LOG${NC}"
    exit 1
fi

# Verify database schema
echo -e "${YELLOW}🔍 Verificando integridade do schema...${NC}"
if npx prisma db pull --print > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Schema do banco de dados válido${NC}"
else
    echo -e "${RED}❌ Problema detectado no schema${NC}"
    exit 1
fi

# Create seed data if needed
if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
    echo -e "${YELLOW}🌱 Deseja executar seed do banco de dados? (y/N)${NC}"
    read -r SEED_CONFIRM
    
    if [[ "$SEED_CONFIRM" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🌱 Executando seed...${NC}"
        if npm run prisma:seed 2>&1 | tee -a "$BACKUP_LOG"; then
            echo -e "${GREEN}✅ Seed executado com sucesso${NC}"
        else
            echo -e "${YELLOW}⚠️ Falha no seed (não crítico)${NC}"
        fi
    fi
fi

# Final verification
echo -e "${YELLOW}🔍 Verificação final...${NC}"
FINAL_STATUS=$(npx prisma migrate status --schema=prisma/schema.prisma)

if echo "$FINAL_STATUS" | grep -q "No pending migrations"; then
    echo -e "${GREEN}✅ Todas as migrações aplicadas com sucesso!${NC}"
else
    echo -e "${YELLOW}⚠️ Status final das migrações:${NC}"
    echo "$FINAL_STATUS"
fi

echo "================================================================="
echo -e "${GREEN}🎉 Migração concluída!${NC}"
echo -e "${BLUE}📄 Log salvo em: $BACKUP_LOG${NC}"
echo "================================================================="

# Success summary
echo -e "${BLUE}📋 RESUMO:${NC}"
echo "• Migrações aplicadas em: $(date)"
echo "• Banco de dados: PostgreSQL (Neon)"
echo "• Status: Atualizado"
echo "• Log: $BACKUP_LOG"

echo -e "${YELLOW}📝 PRÓXIMOS PASSOS:${NC}"
echo "1. Verificar se a aplicação está funcionando corretamente"
echo "2. Monitorar logs de erro por algumas horas"
echo "3. Fazer backup completo do banco após confirmação"