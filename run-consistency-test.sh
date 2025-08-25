#!/bin/bash

echo "🚀 Starting AI Detection Consistency Test"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "🔍 Checking if server is running..."
curl -s http://localhost:3000/api/health > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Server not running. Starting development server...${NC}"
    npm run dev &
    SERVER_PID=$!
    echo "Waiting for server to start..."
    sleep 10
else
    echo -e "${GREEN}✅ Server is running${NC}"
fi

# Get authentication token
echo ""
echo "🔐 Getting authentication token..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@truecheckia.com",
    "password": "Test123456!"
  }')

# Extract token from response
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get authentication token${NC}"
    echo "Response: $TOKEN_RESPONSE"
    echo ""
    echo "Please ensure test user exists with credentials:"
    echo "  Email: test@truecheckia.com"
    echo "  Password: Test123456!"
    
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null
    fi
    exit 1
fi

echo -e "${GREEN}✅ Got authentication token${NC}"

# Run consistency tests
echo ""
echo "🧪 Running consistency tests..."
echo "================================"
export TEST_TOKEN=$TOKEN
export API_URL=http://localhost:3000

node test-ai-consistency.js

# Cleanup
if [ ! -z "$SERVER_PID" ]; then
    echo ""
    echo "🛑 Stopping development server..."
    kill $SERVER_PID 2>/dev/null
fi

echo ""
echo "✅ Test completed!"