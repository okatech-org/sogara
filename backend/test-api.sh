#!/bin/bash
# Script de test automatisé pour les API SOGARA

echo "🧪 Test des API SOGARA Backend"
echo "================================"

BASE_URL="http://localhost:3001"
API_URL="$BASE_URL/api"

# Fonction de test
test_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo "Testing: $description"
    response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$endpoint")
    
    if [ "$response" = "$expected_status" ]; then
        echo "✅ $description - Status: $response"
        cat /tmp/response.json | jq . 2>/dev/null || cat /tmp/response.json
    else
        echo "❌ $description - Status: $response (Expected: $expected_status)"
    fi
    echo ""
}

# Tests
test_endpoint "$BASE_URL/health" "Health Check"
test_endpoint "$API_URL/analytics/dashboard" "Analytics Dashboard"
test_endpoint "$API_URL/approval/workflows" "Approval Workflows"
test_endpoint "$API_URL/approval/pending" "Pending Steps"
test_endpoint "$API_URL/posts" "Posts"

echo "🎉 Tests terminés!"
