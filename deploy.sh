#!/bin/bash
# RealFlow CRM — VPS Deployment Script
# Run this on the VPS after cloning the repo

set -e
APP_DIR="/var/www/crmreal"
DB_NAME="crmreal"
DB_USER="crmadmin"
DB_PASS="CrmReal@2024#Secure"

echo "🚀 RealFlow CRM Deployment Starting..."

# ─── PostgreSQL Setup ──────────────────────────────────────────────────────
echo "🗄️  Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || echo "DB already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo "✅ PostgreSQL ready: $DB_NAME"

# ─── App Directory ─────────────────────────────────────────────────────────
echo "📁 Setting up app directory..."
sudo mkdir -p $APP_DIR
sudo chown -R crm:crm $APP_DIR

# ─── Clone / Pull Repo ────────────────────────────────────────────────────
echo "📥 Cloning repository..."
if [ -d "$APP_DIR/.git" ]; then
  cd $APP_DIR && git pull origin main
else
  git clone https://github.com/umeshkumar097/crmreal.git $APP_DIR
fi
cd $APP_DIR

# ─── Write .env for API ───────────────────────────────────────────────────
echo "📝 Writing API .env..."
cat > $APP_DIR/apps/api/.env << 'ENVEOF'
NODE_ENV=production
PORT=3000
APP_URL=https://api.propgocrm.com
FRONTEND_URL=https://propgocrm.com
ALLOWED_ORIGINS=https://propgocrm.com,https://www.propgocrm.com,https://api.propgocrm.com

DATABASE_URL="postgresql://crmadmin:CrmReal@2024#Secure@localhost:5432/crmreal?schema=public"

JWT_ACCESS_SECRET=propgocrm-jwt-access-secret-ultra-secure-2024-production-key
JWT_REFRESH_SECRET=propgocrm-jwt-refresh-secret-ultra-secure-2024-production-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=e058a2f2b6f9136b65d2d513dc98c5a2
R2_ACCESS_KEY_ID=4783d4a1eda731d5c6ddc4b997ef82d4
R2_SECRET_ACCESS_KEY=f3c936f421f3019b0ee5b76b6184fdc3df1f84092b6586f842a8a8a0bc73b9c7
R2_BUCKET_NAME=crmreal
R2_PUBLIC_URL=https://crm.propgocrm.com
R2_ENDPOINT=https://e058a2f2b6f9136b65d2d513dc98c5a2.r2.cloudflarestorage.com

AI_PROVIDER=openai
OPENAI_API_KEY=sk-placeholder
OPENAI_MODEL=gpt-4o
GEMINI_API_KEY=placeholder
GEMINI_MODEL=gemini-pro

WHATSAPP_PROVIDER=baileys
META_PHONE_NUMBER_ID=placeholder
META_ACCESS_TOKEN=placeholder
META_WEBHOOK_VERIFY_TOKEN=propgocrm-webhook-token

SWAGGER_ENABLED=true
SWAGGER_PATH=api/docs
MAX_FILE_SIZE_MB=10
ENVEOF

# ─── Write .env for Web ───────────────────────────────────────────────────
echo "📝 Writing Web .env..."
cat > $APP_DIR/apps/web/.env.local << 'WEBENVEOF'
NEXT_PUBLIC_API_URL=https://api.propgocrm.com/api/v1
API_URL=https://api.propgocrm.com
WEBENVEOF

# ─── Install Dependencies ─────────────────────────────────────────────────
echo "📦 Installing dependencies..."
cd $APP_DIR && pnpm install --frozen-lockfile 2>&1 | tail -5

# ─── Prisma DB Push ───────────────────────────────────────────────────────
echo "🗄️  Running Prisma DB push..."
cd $APP_DIR/apps/api && npx prisma db push

# ─── Build Next.js ────────────────────────────────────────────────────────
echo "🏗️  Building Next.js frontend..."
cd $APP_DIR/apps/web && npm run build

# ─── PM2 Start ────────────────────────────────────────────────────────────
echo "⚡ Starting apps with PM2..."
cd $APP_DIR
pm2 delete crmreal-api 2>/dev/null || true
pm2 delete crmreal-web 2>/dev/null || true

pm2 start apps/api/src/main.ts \
  --name crmreal-api \
  --interpreter ts-node \
  --interpreter-args "-r tsconfig-paths/register" \
  --cwd apps/api \
  -i 2

pm2 start npm --name crmreal-web -- start --cwd apps/web
pm2 save
pm2 startup | tail -1

echo "✅ RealFlow CRM Deployed!"
pm2 list
