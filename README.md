# 🏠 AI Real Estate CRM & ERP

> Enterprise-Grade Multi-Tenant SaaS — Built with NestJS + Next.js 15 + Flutter

[![CI/CD](https://github.com/your-org/crm-erp/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/your-org/crm-erp/actions)
[![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)](LICENSE)

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS 10 + TypeScript + Prisma + PostgreSQL 16 |
| **Frontend** | Next.js 15 (App Router) + Tailwind CSS + shadcn/ui |
| **Mobile** | Flutter (Android + iOS) |
| **Cache** | Redis 7 + BullMQ |
| **Realtime** | Socket.IO |
| **Storage** | Cloudflare R2 (→ S3, Azure Blob abstraction) |
| **AI** | OpenAI GPT-4o (→ Gemini abstraction) |
| **WhatsApp** | Meta Cloud API (→ Gupshup, Twilio abstraction) |
| **Auth** | JWT + Refresh Tokens + RBAC |
| **Infra** | Azure AKS + Docker + GitHub Actions |

---

## 📂 Project Structure

```
crm-erp/
├── apps/
│   ├── api/          # NestJS Backend (port 3001)
│   ├── web/          # Next.js 15 CRM (port 3000)
│   └── mobile/       # Flutter Mobile App
├── packages/
│   └── shared/       # Shared types & constants
├── infra/
│   ├── nginx/        # Reverse proxy
│   └── k8s/          # Kubernetes manifests
├── .github/
│   └── workflows/    # CI/CD pipelines
└── docker-compose.yml
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose
- Flutter SDK (for mobile)

### 1. Clone & Install
```bash
git clone https://github.com/your-org/crm-erp.git
cd crm-erp
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start with Docker Compose
```bash
docker-compose up -d postgres redis
```

### 4. Run DB Migrations & Seed
```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Start Development Servers
```bash
pnpm dev
# API: http://localhost:3001
# Web: http://localhost:3000
# Swagger: http://localhost:3001/api/docs
```

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@crm.com | Admin@123456 |
| Admin | admin@demorealty.com | Admin@123456 |
| Manager | manager@demorealty.com | Manager@123456 |

---

## 📚 API Documentation

Swagger UI available at: `http://localhost:3001/api/docs`

---

## 🏗️ Development Phases

| Phase | Modules | Status |
|-------|---------|--------|
| Phase 1 | Auth, Dashboard, Leads, Properties, Inventory | 🔄 In Progress |
| Phase 2 | CRM, Follow-ups, WhatsApp, Reports | 🔲 Planned |
| Phase 3 | Payments, Bookings, Customer Portal | 🔲 Planned |
| Phase 4 | AI Copilot, Voice Agent, Analytics | 🔲 Planned |
| Phase 5 | Marketplace, Public APIs, White-label | 🔲 Planned |

---

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage report
pnpm --filter api test:cov
```

---

## 🐳 Docker Commands

```bash
# Full stack (dev)
docker-compose up

# Production build
docker-compose -f docker-compose.prod.yml up

# Rebuild specific service
docker-compose up --build api
```

---

## 🔒 Security

- Argon2 password hashing
- JWT access (15min) + refresh (7d) tokens with rotation
- RBAC on every endpoint
- Tenant isolation at repository layer (Prisma Extensions)
- Rate limiting (100 req/min per IP)
- Helmet.js security headers
- Input validation with class-validator
- Audit logs for all write operations

---

## 📄 License

UNLICENSED — Proprietary software. All rights reserved.
