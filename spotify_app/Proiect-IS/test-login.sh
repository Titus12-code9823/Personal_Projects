#!/bin/bash

# Script pentru testarea endpoint-ului /auth/login
# Folosire: ./test-login.sh username password

BACKEND_URL="http://localhost:8080"
USERNAME="${1:-testuser}"
PASSWORD="${2:-password123}"

echo "🔐 Testare login pentru: $USERNAME"
echo ""

# Login request
RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

echo "Răspuns: $RESPONSE"
echo ""

# Extrage token-ul (necesită jq instalat, sau poți face manual)
if command -v jq &> /dev/null; then
  TOKEN=$(echo "$RESPONSE" | jq -r '.token')
  if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo "✅ Token primit: ${TOKEN:0:50}..."
    echo ""
    echo "📋 Testare cerere protejată cu token:"
    curl -s -X GET "$BACKEND_URL/api/v1/songs" \
      -H "Authorization: Bearer $TOKEN" | jq '.' | head -20
  else
    echo "❌ Login eșuat. Verifică username/password sau dacă backend-ul rulează."
  fi
else
  echo "💡 Instalează 'jq' pentru parsing JSON: brew install jq"
  echo "   Sau copiază manual token-ul din răspuns și folosește-l în header:"
  echo "   Authorization: Bearer <token>"
fi

