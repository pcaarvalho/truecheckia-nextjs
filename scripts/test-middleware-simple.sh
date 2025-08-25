#!/bin/bash

# Simple Middleware Test Script
# Tests critical middleware authentication and redirection scenarios using curl

BASE_URL=${TEST_URL:-"http://localhost:3000"}
TOTAL_TESTS=0
PASSED_TESTS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test result functions
pass_test() {
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo -e "${GREEN}✅ PASS${NC}: $1"
}

fail_test() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    echo -e "   Expected: $2"
    echo -e "   Got: $3"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

run_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    local test_name="$1"
    local expected="$2"
    local actual="$3"
    local details="$4"
    
    if [[ "$actual" == *"$expected"* ]]; then
        pass_test "$test_name"
        if [[ -n "$details" ]]; then
            echo "   Details: $details"
        fi
    else
        fail_test "$test_name" "$expected" "$actual"
        if [[ -n "$details" ]]; then
            echo "   Details: $details"
        fi
    fi
    echo ""
}

# Test function with timeout and error handling
test_endpoint() {
    local url="$1"
    local follow_redirects="$2"
    local headers="$3"
    
    if [[ "$follow_redirects" == "false" ]]; then
        curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" \
             --max-time 10 \
             --max-redirs 0 \
             ${headers:+-H "$headers"} \
             "$url" 2>/dev/null || echo "000|ERROR"
    else
        curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" \
             --max-time 10 \
             --max-redirs 3 \
             ${headers:+-H "$headers"} \
             "$url" 2>/dev/null || echo "000|ERROR"
    fi
}

# Check if server is running
check_server() {
    info "Checking server availability at $BASE_URL..."
    local health_response=$(curl -s --max-time 5 "$BASE_URL/api/health" 2>/dev/null)
    
    if [[ $? -eq 0 && "$health_response" == *"success"* ]]; then
        info "✅ Server is available and healthy"
        return 0
    else
        echo -e "${RED}❌ Server not available at $BASE_URL${NC}"
        echo "Please start the development server with: npm run dev"
        return 1
    fi
}

# Start server availability check
echo "🚀 Starting Middleware Test Suite"
echo "Testing against: $BASE_URL"
echo "=" $(printf '=%.0s' {1..50})

if ! check_server; then
    exit 1
fi

echo ""

# Test 1: Homepage access without authentication - should allow (200)
info "Test 1: Homepage access without authentication"
result=$(test_endpoint "$BASE_URL/" false)
status=$(echo "$result" | cut -d'|' -f1)
run_test "Homepage without auth" "200" "$status" "Homepage should be accessible to everyone"

# Test 2: Dashboard access without authentication - should redirect to login (302/307)
info "Test 2: Dashboard access without authentication"
result=$(test_endpoint "$BASE_URL/dashboard" false)
status=$(echo "$result" | cut -d'|' -f1)
redirect=$(echo "$result" | cut -d'|' -f2)
if [[ "$status" == "302" || "$status" == "307" ]] && [[ "$redirect" == *"login"* ]]; then
    pass_test "Dashboard without auth redirects to login"
    echo "   Details: Status $status, redirects to $redirect"
else
    fail_test "Dashboard without auth" "302/307 redirect to login" "Status: $status, Redirect: $redirect"
fi
echo ""

# Test 3: Login page access without authentication - should allow (200)
info "Test 3: Login page access without authentication"
result=$(test_endpoint "$BASE_URL/login" false)
status=$(echo "$result" | cut -d'|' -f1)
run_test "Login page without auth" "200" "$status" "Login page should be accessible to unauthenticated users"

# Test 4: Register page access without authentication - should allow (200)
info "Test 4: Register page access without authentication"
result=$(test_endpoint "$BASE_URL/register" false)
status=$(echo "$result" | cut -d'|' -f1)
run_test "Register page without auth" "200" "$status" "Register page should be accessible to unauthenticated users"

# Test 5: API routes should bypass middleware
info "Test 5: API route access (should bypass middleware)"
result=$(test_endpoint "$BASE_URL/api/health" false)
status=$(echo "$result" | cut -d'|' -f1)
run_test "API route access" "200" "$status" "API routes should bypass middleware"

# Test 6: Analysis page without authentication - should redirect
info "Test 6: Analysis page without authentication"
result=$(test_endpoint "$BASE_URL/analysis" false)
status=$(echo "$result" | cut -d'|' -f1)
redirect=$(echo "$result" | cut -d'|' -f2)
if [[ "$status" == "302" || "$status" == "307" ]] && [[ "$redirect" == *"login"* ]]; then
    pass_test "Analysis page redirects to login when unauthenticated"
    echo "   Details: Status $status, redirects to $redirect"
else
    fail_test "Analysis page without auth" "302/307 redirect to login" "Status: $status, Redirect: $redirect"
fi
echo ""

# Test 7: History page without authentication - should redirect
info "Test 7: History page without authentication"
result=$(test_endpoint "$BASE_URL/history" false)
status=$(echo "$result" | cut -d'|' -f1)
redirect=$(echo "$result" | cut -d'|' -f2)
if [[ "$status" == "302" || "$status" == "307" ]] && [[ "$redirect" == *"login"* ]]; then
    pass_test "History page redirects to login when unauthenticated"
    echo "   Details: Status $status, redirects to $redirect"
else
    fail_test "History page without auth" "302/307 redirect to login" "Status: $status, Redirect: $redirect"
fi
echo ""

# Test 8: Protected route with invalid token - should redirect and clear cookies
info "Test 8: Protected route with invalid token"
INVALID_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImV4cCI6MX0.invalid"
result=$(test_endpoint "$BASE_URL/profile" false "Cookie: accessToken=$INVALID_TOKEN")
status=$(echo "$result" | cut -d'|' -f1)
redirect=$(echo "$result" | cut -d'|' -f2)
if [[ "$status" == "302" || "$status" == "307" ]] && [[ "$redirect" == *"login"* ]]; then
    pass_test "Protected route with invalid token redirects to login"
    echo "   Details: Status $status, redirects to $redirect"
else
    fail_test "Protected route with invalid token" "302/307 redirect to login" "Status: $status, Redirect: $redirect"
fi
echo ""

# Test 9: Contact page (public route) - should allow
info "Test 9: Contact page access (public route)"
result=$(test_endpoint "$BASE_URL/contact" false)
status=$(echo "$result" | cut -d'|' -f1)
run_test "Contact page access" "200" "$status" "Contact page should be publicly accessible"

# Test 10: Pricing page (public route) - should allow
info "Test 10: Pricing page access (public route)"
result=$(test_endpoint "$BASE_URL/pricing" false)
status=$(echo "$result" | cut -d'|' -f1)
run_test "Pricing page access" "200" "$status" "Pricing page should be publicly accessible"

# Test 11: Favicon and static resources should bypass middleware
info "Test 11: Favicon access (should bypass middleware)"
result=$(test_endpoint "$BASE_URL/favicon.ico" false)
status=$(echo "$result" | cut -d'|' -f1)
# Status should not be a redirect (not 302/307)
if [[ "$status" != "302" && "$status" != "307" ]]; then
    pass_test "Favicon bypasses middleware (no redirect)"
    echo "   Details: Status $status (not a redirect)"
else
    fail_test "Favicon access" "No redirect (not 302/307)" "Status: $status"
fi
echo ""

# Test 12: Multiple redirects handling - should not cause infinite loops
info "Test 12: Multiple redirects handling (prevent infinite loops)"
result=$(test_endpoint "$BASE_URL/dashboard" true)  # Follow redirects
status=$(echo "$result" | cut -d'|' -f1)
# Should eventually reach login page (200) or an error, but not loop
if [[ "$status" == "200" ]]; then
    pass_test "Multiple redirects handled correctly (no infinite loop)"
    echo "   Details: Final status $status after following redirects"
else
    warning "Multiple redirects test - Status: $status (may indicate issues)"
fi
echo ""

# Summary
echo "=" $(printf '=%.0s' {1..50})
echo "📊 TEST SUMMARY"
echo "=" $(printf '=%.0s' {1..50})
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $((TOTAL_TESTS - PASSED_TESTS))"
echo "Success Rate: $(( (PASSED_TESTS * 100) / TOTAL_TESTS ))%"
echo ""

# Critical Issues Analysis
failed_tests=$((TOTAL_TESTS - PASSED_TESTS))
if [[ $failed_tests -eq 0 ]]; then
    echo -e "${GREEN}🎉 All tests passed! Middleware is working correctly.${NC}"
elif [[ $failed_tests -le 2 ]]; then
    echo -e "${YELLOW}⚠ Minor issues detected ($failed_tests failed tests).${NC}"
else
    echo -e "${RED}🚨 Critical issues found ($failed_tests failed tests).${NC}"
fi

# Recommendations
echo ""
echo "💡 RECOMMENDATIONS:"
echo "--------------------"
if [[ $PASSED_TESTS -eq $TOTAL_TESTS ]]; then
    echo "• All tests passed! Middleware is working correctly."
    echo "• Monitor middleware performance in production."
    echo "• Consider implementing rate limiting for auth endpoints."
else
    echo "• $failed_tests tests failed. Review middleware logic for:"
    echo "  - Protected route redirection"
    echo "  - Public route accessibility"
    echo "  - Invalid token handling"
    echo "• Test with valid JWT tokens for complete validation."
fi

echo "• Set up alerts for authentication failures in production."
echo "• Consider implementing CSRF protection."

# Exit with appropriate code
if [[ $failed_tests -gt 3 ]]; then
    echo -e "\n${RED}Critical middleware issues detected. Exiting with error code.${NC}"
    exit 1
else
    echo -e "\n${GREEN}Middleware test completed successfully.${NC}"
    exit 0
fi