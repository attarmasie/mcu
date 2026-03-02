#!/bin/sh
set -e

# Generate .htpasswd file dari environment variables
if [ -n "$SWAGGER_USERNAME" ] && [ -n "$SWAGGER_PASSWORD" ]; then
    htpasswd -cb /etc/nginx/.htpasswd "$SWAGGER_USERNAME" "$SWAGGER_PASSWORD"
    echo "✓ Swagger authentication configured: username=$SWAGGER_USERNAME"
else
    echo "⚠ SWAGGER_USERNAME and SWAGGER_PASSWORD not set, basic auth will be disabled"
fi

# Start nginx
exec "$@"
