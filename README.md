# MCU Attarmasi - Medical Clinic Management System

Monorepo project dengan Golang backend dan React frontend untuk sistem manajemen klinik.

## 📋 Quick Start

### 1. Setup Dependencies

```bash
npm run install:all
```

### 2. Generate API Code

```bash
npm run generate
```

### 3. Run dengan Docker Compose

```bash
docker compose up -d --build
```

### 4. Seed Database dengan Admin User

```bash
npm run seed:docker
```

**Admin Credentials:**
- Email: `admin@mail.com`
- Password: `mcuattarmasi`

### 5. Access Services

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8081 (username: admin, password: your_swagger_password_here)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **RedisInsight**: http://localhost:5540

## 🛠️ Development

### Run Locally (without Docker)

```bash
# Development mode (BE + FE)
npm run dev

# Backend only
npm run dev:be

# Frontend only
npm run dev:fe
```

### Database Seeding

```bash
# Local development
npm run seed

# In Docker container
npm run seed:docker
```

## 📚 Documentation

- **API Documentation**: See [SWAGGER_SETUP.md](./SWAGGER_SETUP.md)
- **Database Seeder**: See [backend/SEEDER.md](./backend/SEEDER.md)
- **Docusaurus**: `npm run docs:code` (http://localhost:3000)

## 🏗️ Project Structure

```
.
├── backend/          # Golang API server
├── frontend/         # React + Vite frontend
├── contracts/        # OpenAPI specifications
├── docs/            # Documentation (Docusaurus)
│   └── docs/
│       └── swagger/ # Swagger UI setup
└── docker-compose.yml
```

## 📝 Available Scripts

```bash
npm run help         # Show all available commands
npm run install:all  # Install all dependencies
npm run generate     # Generate API code from OpenAPI
npm run seed         # Seed database
npm run dev          # Run development servers
npm run build        # Build all
npm run docs         # Open documentation
```

## 🔐 Default Credentials

### Admin User
- Email: `admin@mail.com`
- Password: `mcuattarmasi`

### Database (PostgreSQL)
- User: `admin`
- Password: `redminote8`
- Database: `mcu_attarmasi`

### Redis
- Password: `redminote8`

### Swagger UI (Production)
- Username: `admin`
- Password: Set in `.env.production`

## 🚀 Deployment

### Build Production Images

```bash
docker compose up -d --build
```

### Environment Variables

Update `backend/.env.production` for production configuration.

## 📦 Tech Stack

### Backend
- Golang 1.25+
- Gin (HTTP framework)
- GORM (ORM)
- PostgreSQL
- Redis
- JWT Authentication

### Frontend
- React 18+
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- Shadcn/ui
- Tailwind CSS

## 📄 License

Private project for MCU Attarmasi.
