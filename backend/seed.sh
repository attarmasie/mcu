#!/bin/bash

# Seed database script
echo "🌱 Running database seeder..."
echo ""

cd "$(dirname "$0")" || exit

# Run seeder
go run cmd/tools/seed/main.go

echo ""
echo "✅ Seeding process completed!"
