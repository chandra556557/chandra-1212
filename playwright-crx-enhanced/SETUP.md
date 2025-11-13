# 🚀 Setup Guide - Enhanced Playwright-CRX

Complete step-by-step guide to set up the Enhanced Playwright-CRX project.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **Docker** (Optional, for containerized setup) ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

## 🎯 Quick Start (Docker - Recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/playwright-crx-enhanced.git
cd playwright-crx-enhanced
```

### 2. Configure Environment
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit .env file and update:
# - JWT_ACCESS_SECRET (use a strong random string)
# - JWT_REFRESH_SECRET (use a different strong random string)
# - ALLOWED_ORIGINS (add your extension ID after installation)
```

### 3. Start with Docker
```bash
# Build and start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Create first user (optional)
docker-compose exec backend npx prisma studio
```

### 4. Access the Application
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Prisma Studio**: Run `docker-compose exec backend npx prisma studio`

---

## 🔧 Manual Setup (Local Development)

### Step 1: Database Setup

#### Option A: Local PostgreSQL
```bash
# Create database
createdb playwright_crx

# Or using psql
psql -U postgres
CREATE DATABASE playwright_crx;
\q
```

#### Option B: Docker PostgreSQL Only
```bash
docker run -d \
  --name playwright-crx-db \
  -e POSTGRES_DB=playwright_crx \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=secure_password \
  -p 5432:5432 \
  postgres:15-alpine
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

Backend will be running at: http://localhost:3000

### Step 3: Extension Setup

```bash
cd extension

# Install dependencies
npm install

# Build extension
npm run build

# For development with hot reload
npm run dev
```

#### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension/dist` folder
5. Copy the **Extension ID** (e.g., `abcdefghijklmnopqrstuvwxyz`)

#### Update Backend CORS

```bash
# Edit backend/.env and add your extension ID
ALLOWED_ORIGINS="chrome-extension://YOUR_EXTENSION_ID_HERE,http://localhost:3000"

# Restart backend
```

### Step 4: CLI Tool Setup (Optional)

```bash
cd cli

# Install globally
npm install -g .

# Test CLI
pw-crx --version

# Run a test
pw-crx run path/to/test-suite.html
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Extension Tests
```bash
cd extension

# Run tests
npm test

# E2E tests
npm run test:e2e
```

---

## 📊 Database Management

### View Database
```bash
cd backend

# Open Prisma Studio (GUI)
npx prisma studio
```

### Run Migrations
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

### Seed Database
```bash
# Run seed script
npx prisma db seed
```

---

## 🔐 Security Configuration

### 1. Generate Strong Secrets
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Update .env
```env
JWT_ACCESS_SECRET=<generated-secret-1>
JWT_REFRESH_SECRET=<generated-secret-2>
```

### 3. Configure CORS
```env
# Add your extension ID and allowed origins
ALLOWED_ORIGINS=chrome-extension://YOUR_EXTENSION_ID,https://yourdomain.com
```

---

## 🌐 Production Deployment

### Option 1: Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy
```

### Option 2: Manual Deployment

#### Backend
```bash
cd backend

# Install production dependencies
npm ci --only=production

# Build TypeScript
npm run build

# Run migrations
DATABASE_URL=<production-url> npx prisma migrate deploy

# Start with PM2
pm2 start dist/index.js --name playwright-crx-api
```

#### Extension
```bash
cd extension

# Build for production
npm run build

# Package extension
npm run pack

# Upload to Chrome Web Store
```

---

## 📡 API Testing with Postman

### 1. Import Collection
```bash
# Open Postman
# File > Import > Select postman/Playwright-CRX-Enhanced.postman_collection.json
```

### 2. Set Variables
- `baseUrl`: http://localhost:3000/api
- Other variables will be auto-set after login

### 3. Test Endpoints
1. Run **Register** or **Login** request
2. Access token will be auto-saved
3. Test other endpoints (Scripts, Self-Healing, DDT)

---

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql -h localhost -U admin -d playwright_crx

# Check DATABASE_URL in .env
echo $DATABASE_URL
```

### Backend Won't Start
```bash
# Check Node version
node --version  # Should be 20+

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### Extension Not Loading
```bash
# Rebuild extension
cd extension
rm -rf dist
npm run build

# Check for errors
# Chrome > Extensions > Extension Details > Errors tab
```

### Prisma Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (CAUTION)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

---

## 📚 Next Steps

1. ✅ Read the [API Documentation](./docs/API.md)
2. ✅ Follow the [Self-Healing Guide](./docs/SELF_HEALING.md)
3. ✅ Try [Data-Driven Testing](./docs/DDT.md)
4. ✅ Explore [Extension Scripts](./docs/EXTENSION_SCRIPTS.md)
5. ✅ Set up [CI/CD Pipeline](./docs/CICD.md)

---

## 🆘 Getting Help

- **Documentation**: See `docs/` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/playwright-crx-enhanced/issues)
- **Discord**: [Join our community](https://discord.gg/example)
- **Email**: support@example.com

---

## ✅ Verification Checklist

- [ ] PostgreSQL is running
- [ ] Backend API responds at http://localhost:3000/health
- [ ] Extension loads in Chrome without errors
- [ ] Can register/login via Postman
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] CORS allows extension origin

---

Made with ❤️ by the Playwright-CRX Enhanced team
