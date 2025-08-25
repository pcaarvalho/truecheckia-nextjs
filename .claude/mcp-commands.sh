#!/bin/bash

# TrueCheckIA MCP Commands Collection
# Useful commands for Claude Code sessions with MCPs

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🤖 TrueCheckIA MCP Commands${NC}"
echo "=============================="
echo ""

# Function to display commands
show_commands() {
    echo -e "${GREEN}📦 PostgreSQL MCP Commands:${NC}"
    echo "----------------------------------------"
    echo "# Query database directly:"
    echo 'claude --eval "SELECT * FROM \"User\" LIMIT 5;" --mcp postgres-dev'
    echo ""
    echo "# Check database stats:"
    echo 'claude --eval "SELECT COUNT(*) as users FROM \"User\";" --mcp postgres-dev'
    echo ""
    echo "# Run migrations:"
    echo 'claude --eval "npx prisma migrate dev" --mcp postgres-dev'
    echo ""
    
    echo -e "${GREEN}🐙 GitHub MCP Commands:${NC}"
    echo "----------------------------------------"
    echo "# Create pull request:"
    echo 'claude --eval "Create PR from current branch" --mcp github'
    echo ""
    echo "# Check PR status:"
    echo 'claude --eval "List open PRs" --mcp github'
    echo ""
    echo "# Create issue:"
    echo 'claude --eval "Create issue: [Title]" --mcp github'
    echo ""
    
    echo -e "${GREEN}🌐 Puppeteer MCP Commands:${NC}"
    echo "----------------------------------------"
    echo "# Run E2E tests:"
    echo 'claude --eval "Run puppeteer tests from .claude/puppeteer-tests.js" --mcp puppeteer'
    echo ""
    echo "# Capture screenshots:"
    echo 'claude --eval "Screenshot all pages" --mcp puppeteer'
    echo ""
    echo "# Test specific flow:"
    echo 'claude --eval "Test login flow" --mcp puppeteer'
    echo ""
    
    echo -e "${GREEN}🧠 Memory MCP Commands:${NC}"
    echo "----------------------------------------"
    echo "# Save context:"
    echo 'claude --eval "Remember: [important info]" --mcp memory'
    echo ""
    echo "# Retrieve context:"
    echo 'claude --eval "What do you remember about [topic]?" --mcp memory'
    echo ""
    
    echo -e "${GREEN}🚀 Quick Start Commands:${NC}"
    echo "----------------------------------------"
    echo "# Start new session with all MCPs:"
    echo 'claude --mcp postgres-dev,github,puppeteer,memory'
    echo ""
    echo "# Resume previous session:"
    echo 'claude --resume --memory "TrueCheckIA"'
    echo ""
    echo "# Debug mode with verbose output:"
    echo 'claude --debug --mcp postgres-dev'
    echo ""
}

# Function to test MCP connectivity
test_mcps() {
    echo -e "${YELLOW}Testing MCP Connectivity...${NC}"
    echo ""
    
    # Test PostgreSQL
    echo -n "PostgreSQL MCP: "
    if npx @modelcontextprotocol/server-postgres --test 2>/dev/null; then
        echo -e "${GREEN}✓ Connected${NC}"
    else
        echo -e "${YELLOW}⚠ Not configured${NC}"
    fi
    
    # Test GitHub
    echo -n "GitHub MCP: "
    if [ ! -z "$GITHUB_TOKEN" ]; then
        echo -e "${GREEN}✓ Token found${NC}"
    else
        echo -e "${YELLOW}⚠ Token not set${NC}"
    fi
    
    # Test Puppeteer
    echo -n "Puppeteer MCP: "
    if command -v puppeteer &> /dev/null; then
        echo -e "${GREEN}✓ Available${NC}"
    else
        echo -e "${YELLOW}⚠ Not installed${NC}"
    fi
    
    echo ""
}

# Main menu
case "$1" in
    test)
        test_mcps
        ;;
    commands|help)
        show_commands
        ;;
    *)
        echo "Usage: $0 {test|commands|help}"
        echo ""
        echo "  test     - Test MCP connectivity"
        echo "  commands - Show useful MCP commands"
        echo "  help     - Show this help message"
        echo ""
        show_commands
        ;;
esac