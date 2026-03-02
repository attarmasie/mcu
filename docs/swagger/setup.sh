#!/bin/bash
# Setup Swagger UI dengan credentials

echo "🔧 Setting up Swagger UI..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found!"
    exit 1
fi

# Extract credentials
SWAGGER_USERNAME=$(grep "^SWAGGER_USERNAME=" .env.production | cut -d'=' -f2)
SWAGGER_PASSWORD=$(grep "^SWAGGER_PASSWORD=" .env.production | cut -d'=' -f2)

if [ -z "$SWAGGER_USERNAME" ] || [ -z "$SWAGGER_PASSWORD" ]; then
    echo "❌ SWAGGER_USERNAME or SWAGGER_PASSWORD not set in .env.production"
    exit 1
fi

echo "✅ Swagger credentials found:"
echo "   Username: $SWAGGER_USERNAME"
echo "   Password: ****"
echo ""
echo "📝 Building and starting Swagger services..."
docker compose up -d swagger swagger-proxy

echo ""
echo "✅ Swagger UI is ready!"
echo "🔗 Access at: http://localhost:8081"
echo "📊 Basic Auth credentials from .env.production will be used"
