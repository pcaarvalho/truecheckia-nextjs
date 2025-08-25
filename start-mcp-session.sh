#!/bin/bash

# 🚀 TrueCheckIA MCP Session Starter
# Este script prepara e inicia uma sessão otimizada com Claude Code

echo "🚀 TrueCheckIA MCP Session Starter"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if dev server is running
echo -e "${BLUE}[1/4]${NC} Checking dev server..."
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓${NC} Dev server is running"
else
    echo -e "${YELLOW}!${NC} Dev server not running. Starting it..."
    npm run dev &
    sleep 5
fi

# Check database connection
echo -e "${BLUE}[2/4]${NC} Testing database connection..."
if npx prisma db execute --preview-feature --schema=./prisma/schema.prisma --url="$DATABASE_URL" -- "SELECT 1" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Database connected"
else
    echo -e "${YELLOW}!${NC} Database connection needs configuration"
fi

# Check GitHub token
echo -e "${BLUE}[3/4]${NC} Checking GitHub token..."
if [ ! -z "$GITHUB_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} GitHub token found"
else
    echo -e "${YELLOW}!${NC} GitHub token not set"
    echo "   To set: export GITHUB_TOKEN='ghp_your_token'"
fi

# Create memory context
echo -e "${BLUE}[4/4]${NC} Preparing memory context..."
mkdir -p .claude/memory

cat > .claude/memory/project-context.md << 'EOF'
# TrueCheckIA Project Context

## Current Status
- Authentication: ✅ Fixed (JWT with 7-day expiration)
- Database: ✅ PostgreSQL Neon configured
- Payments: ✅ Stripe integrated
- Email: ✅ Resend configured
- MCPs: ✅ Configured (PostgreSQL, GitHub, Puppeteer, Memory)

## Recent Work
- Fixed token_expired authentication issue
- Removed duplicate auth.ts files
- Updated all import paths
- Configured httpOnly cookies
- Translated email templates to English

## Tech Stack
- Next.js 15 with App Router
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- Stripe Payments
- Resend Email
- TailwindCSS + ShadCN/UI

## Important Files
- /lib/auth.ts - Main authentication
- /middleware.ts - Route protection
- /app/api/auth/* - Auth endpoints
- /.env.local - Environment variables
- /MCP_GUIDE.md - MCP documentation

## Test Credentials
- Email: test@truecheckia.com
- Password: Test123456!
- Plan: FREE

## Database URLs
- Dev: ep-lingering-truth-ae6n5s9w
- Prod: ep-late-resonance-aesr6j4v
EOF

echo -e "${GREEN}✓${NC} Memory context created"

echo ""
echo "==================================="
echo -e "${GREEN}✅ Ready to start MCP session!${NC}"
echo "==================================="
echo ""
echo "📋 Quick Commands:"
echo ""
echo "1. Start full session with all MCPs:"
echo -e "${BLUE}claude --mcp postgres-dev,github,puppeteer,memory${NC}"
echo ""
echo "2. Resume previous session:"
echo -e "${BLUE}claude --resume --memory 'TrueCheckIA'${NC}"
echo ""
echo "3. Database-focused session:"
echo -e "${BLUE}claude --mcp postgres-dev${NC}"
echo ""
echo "4. Testing-focused session:"
echo -e "${BLUE}claude --mcp puppeteer${NC}"
echo ""
echo "📝 Useful queries to try:"
echo '• "Show all users in the database"'
echo '• "Run E2E tests for login"'
echo '• "Create a PR for the auth fixes"'
echo '• "Take screenshots of all pages"'
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"