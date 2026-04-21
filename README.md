# VIESTYLE E-Commerce

> Fashion E-commerce Platform + AI Stylist Assistant

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | NestJS v11 + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 16 + pgvector |
| Cache | Redis |
| AI | Google Gemini API |
| Admin UI | React + Vite + shadcn/ui |

## Project Structure

```
vns-backend/
├── backend/          # NestJS API server
├── admin/            # React Admin Dashboard
├── docker-compose.yml
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### 1. Setup Environment

```bash
cp .env.example .env
```

### 2. Start Docker Services

```bash
docker compose up -d
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Run Prisma Migrations

```bash
npm run prisma:migrate
```

### 5. Start Backend Dev Server

```bash
npm run start:dev
```

API will be available at `http://localhost:3000/api`
Swagger docs at `http://localhost:3000/api/docs`

## Scripts

### Backend (`/backend`)

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start dev server with watch |
| `npm run build` | Build for production |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
