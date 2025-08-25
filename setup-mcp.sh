#!/bin/bash

# TrueCheckIA MCP Setup Script
# This script installs and configures Model Context Protocol servers

echo "🚀 TrueCheckIA MCP Setup"
echo "========================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js first."
    exit 1
fi

# Create necessary directories
print_status "Creating MCP directories..."
mkdir -p .claude/memory
mkdir -p .claude/logs
print_success "Directories created"

# Install MCP servers globally for better performance
print_status "Installing MCP servers..."
echo ""

# PostgreSQL MCP
print_status "Installing PostgreSQL MCP..."
npm install -g @modelcontextprotocol/server-postgres
if [ $? -eq 0 ]; then
    print_success "PostgreSQL MCP installed"
else
    print_warning "PostgreSQL MCP installation failed, will use npx fallback"
fi

# GitHub MCP
print_status "Installing GitHub MCP..."
npm install -g @modelcontextprotocol/server-github
if [ $? -eq 0 ]; then
    print_success "GitHub MCP installed"
else
    print_warning "GitHub MCP installation failed, will use npx fallback"
fi

# Puppeteer MCP
print_status "Installing Puppeteer MCP..."
npm install -g @modelcontextprotocol/server-puppeteer
if [ $? -eq 0 ]; then
    print_success "Puppeteer MCP installed"
else
    print_warning "Puppeteer MCP installation failed, will use npx fallback"
fi

# Memory MCP
print_status "Installing Memory MCP..."
npm install -g @modelcontextprotocol/server-memory
if [ $? -eq 0 ]; then
    print_success "Memory MCP installed"
else
    print_warning "Memory MCP installation failed, will use npx fallback"
fi

# File System MCP
print_status "Installing File System MCP..."
npm install -g @modelcontextprotocol/server-filesystem
if [ $? -eq 0 ]; then
    print_success "File System MCP installed"
else
    print_warning "File System MCP installation failed, will use npx fallback"
fi

echo ""
print_status "Checking environment variables..."

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    print_warning "GITHUB_TOKEN not found in environment"
    echo "  To use GitHub MCP, set your token:"
    echo "  export GITHUB_TOKEN='ghp_your_token_here'"
    echo ""
fi

# Create a startup script
print_status "Creating MCP startup script..."
cat > .claude/start-mcp.sh << 'EOF'
#!/bin/bash

# Start MCP servers for Claude Code
echo "Starting MCP servers..."

# Export necessary environment variables
export DATABASE_URL="postgresql://neondb_owner:npg_Hef0mJsrbu6Y@ep-lingering-truth-ae6n5s9w-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
export MEMORY_PATH="./.claude/memory"
export ALLOWED_PATHS="$(pwd)"

# Start servers in background
npx @modelcontextprotocol/server-postgres &
npx @modelcontextprotocol/server-memory &
npx @modelcontextprotocol/server-filesystem &

if [ ! -z "$GITHUB_TOKEN" ]; then
    npx @modelcontextprotocol/server-github &
fi

echo "MCP servers started!"
echo "Use 'pkill -f modelcontextprotocol' to stop all servers"
EOF

chmod +x .claude/start-mcp.sh
print_success "Startup script created at .claude/start-mcp.sh"

echo ""
echo "========================================="
echo -e "${GREEN}✅ MCP Setup Complete!${NC}"
echo "========================================="
echo ""
echo "📝 Next Steps:"
echo "1. Set your GitHub token (optional):"
echo "   export GITHUB_TOKEN='ghp_your_token_here'"
echo ""
echo "2. Start MCP servers:"
echo "   ./.claude/start-mcp.sh"
echo ""
echo "3. Use with Claude Code:"
echo "   claude --mcp postgres,github,puppeteer"
echo ""
echo "4. For your next session, run:"
echo "   claude --resume --memory 'TrueCheckIA project'"
echo ""
print_success "Setup complete! Happy coding! 🚀"