# Swagger UI Documentation Service

Standalone Swagger UI service dengan basic authentication untuk production.

## Setup

### Environment Variables

Add to `.env.production`:
```env
SWAGGER_USERNAME=admin
SWAGGER_PASSWORD=your_secure_password_here
```

### Docker Compose

Service akan otomatis tersedia di port 8081 dengan basic auth yang dikonfigurasi.

## Endpoints

- `http://localhost:8081/` - Swagger UI (requires basic auth in production)
- `http://localhost:8081/health` - Health check (no auth required)

## Development

Untuk menjalankan Swagger UI standalone:

```bash
docker run --rm -p 8081:8080 \
  -e SWAGGER_JSON=/docs/openapi.bundled.yaml \
  -v $(pwd)/contracts:/docs \
  swaggerapi/swagger-ui
```

Atau gunakan npm script:
```bash
npm run docs:api
```

## Production

Di production, nginx reverse proxy akan menampilkan Swagger UI dengan basic authentication.

Username dan password dikonfigurasi dari environment variables.
