
# 🔴 Red Hat 8 Deployment Guide for Playwright CRX Testing Framework

## 🎯 Overview

This guide addresses specific challenges when deploying the Playwright CRX testing framework on Red Hat Enterprise Linux 8, including PostgreSQL setup, Node.js configuration, and extension compatibility.

---

## 🚨 Red Hat 8 Specific Challenges

### Challenge 1: PostgreSQL Version Compatibility
**Problem**: Red Hat 8 often ships with older PostgreSQL versions that may not support all features.

**Solution**:
```bash
# Check PostgreSQL version
psql --version

# If version < 12, consider upgrading
sudo dnf module enable postgresql:13
sudo dnf update postgresql

# For Red Hat 8, PostgreSQL 15+ is recommended
sudo dnf install postgresql15-server
```

### Challenge 2: Node.js Version Management
**Problem**: Red Hat 8 may have an older Node.js version that doesn't support all ES6+ features.

**Solution**:
```bash
# Install Node.js 18+ using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install

# Or use Red Hat Software Collections
sudo dnf module enable nodejs:18
sudo dnf install nodejs
```

### Challenge 3: Firewall and SELinux Configuration
**Problem**: Red Hat 8's firewall and SELinux may block Node.js server connections.

**Solution**:
```bash
# Check firewall status
sudo firewall-cmd --list-all

# Open necessary ports (3000 for backend, 3001 for WebSocket)
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --add-port=3001/tcp --permanent
sudo firewall-cmd --reload

# Configure SELinux
sudo setsebool -P httpd_can_network_connect 1
sudo semanage -a -t http_port_t -p tcp -m port:3000 -s permissive
```

### Challenge 4: Chrome Extension Compatibility
**Problem**: Chrome extensions may have compatibility issues on Red Hat 8.

**Solution**:
```bash
# Install Chromium (open-source version of Chrome)
sudo dnf install chromium

# Or use Chrome with proper flags
google-chrome --no-sandbox --disable-web-security --remote-debugging-port=9222
```

---

## 📋 Prerequisites

### System Requirements
- Red Hat Enterprise Linux 8.4+
- 4GB+ RAM
- 10GB+ disk space
- Root or sudo access

### Software Requirements
- PostgreSQL 12+ (15+ recommended)
- Node.js 18+ (LTS recommended)
- Chromium browser (for extension testing)

---

## 🔧 Step-by-Step Deployment

### Step 1: System Preparation
```bash
# Update system packages
sudo dnf update -y

# Install required development tools
sudo dnf groupinstall "Development Tools" -y
sudo dnf install git wget curl vim -y

# Create application user (optional but recommended)
sudo useradd -m -s /bin/bash playwright-crx
sudo passwd playwright-crx
```

### Step 2: PostgreSQL Installation
```bash
# Install PostgreSQL 15 (recommended for Red Hat 8)
sudo dnf install postgresql15-server postgresql15-contrib

# Initialize and start PostgreSQL
sudo postgresql-setup --initdb
sudo systemctl enable postgresql15
sudo systemctl start postgresql15

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE playwright_crx;"
sudo -u postgres psql -c "CREATE USER crx_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE playwright_crx TO crx_user;"

# Configure PostgreSQL for remote connections
sudo vim /var/lib/pgsql/data/postgresql.conf
# Add/modify these lines:
listen_addresses = '*'
port = 5432
max_connections = 100
```

### Step 3: Node.js Application Setup
```bash
# Clone the repository
git clone https://github.com/your-org/playwright-crx-enhanced.git
cd playwright-crx-enhanced

# Install Node.js dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_crx
DB_USER=crx_user
DB_PASSWORD=secure_password
DATABASE_URL="postgresql://crx_user:secure_password@localhost:5432/playwright_crx"

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Build the application
npm run build
```

### Step 4: System Service Configuration
```bash
# Create systemd service file
sudo tee /etc/systemd/playwright-crx.service > /dev/null <<EOF
[Unit]
Description=Playwright CRX Backend Service
After=network.target

[Service]
Type=simple
User=playwright-crx
WorkingDirectory=/opt/playwright-crx
ExecStart=/usr/bin/npm start
ExecStop=/usr/bin/npm stop
Restart=always
RestartSec=10
Environment=NODE_ENV=production PORT=3000

[Install]
WantedBy=multi-user
[Service]
Type=simple
User=playwright-crx
Group=playwright-crx
WorkingDirectory=/opt/playwright-crx
ExecStart=/usr/bin/npm start
ExecStop=/usr/bin/npm stop
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable playwright-crx.service
sudo systemctl start playwright-crx.service

# Check service status
sudo systemctl status playwright-crx.service
```

### Step 5: Firewall Configuration
```bash
# Open firewall ports
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --add-port=3001/tcp --permanent
sudo firewall-cmd --reload

# Configure SELinux for Node.js
sudo setsebool -P httpd_can_network_connect 1
sudo semanage -a -t http_port_t -p tcp -m port:3000 -s permissive
sudo semanage -a -t http_port_t -p tcp -m port:3001 -s permissive
```

### Step 6: Chrome Extension Setup
```bash
# Install Chromium for extension testing
sudo dnf install chromium

# Create extension directory
mkdir -p /opt/playwright-crx-extension
cd /opt/playwright-crx-extension

# Build the extension
cd /path/to/playwright-crx-enhanced/examples/recorder-crx
npm run build

# Pack the extension
npm run pack

# Install extension in Chromium
# Note: This requires manual setup in Chromium extensions page
```

---

## 🔧 Configuration Files

### Environment Variables (.env)
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_crx
DB_USER=crx_user
DB_PASSWORD=secure_password
DATABASE_URL="postgresql://crx_user:secure_password@localhost:5432/playwright_crx"

# Application Configuration
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS="chrome-extension://*,http://localhost:3000,http://localhost:5173,http://localhost:5174"

# Security Configuration
JWT_ACCESS_SECRET="your-super-secret-access-key-change-in-production-min-32-chars-long"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production-min-32-chars-long"

# Red Hat Specific Configuration
POSTGRES_CONFIG_PATH=/var/lib/pgsql/data/postgresql.conf
POSTGRES_DATA_PATH=/var/lib/pgsql/data
```

### Systemd Service (playwright-crx.service)
```ini
[Unit]
Description=Playwright CRX Backend Service
After=network.target

[Service]
Type=simple
User=playwright-crx
WorkingDirectory=/opt/playwright-crx
ExecStart=/usr/bin/npm start
ExecStop=/usr/bin/npm stop
Restart=always
RestartSec=10
Environment=NODE_ENV=production PORT=3000
```

---

## 🧪 Testing the Deployment

### 1. Health Check
```bash
# Test backend health
curl http://localhost:3000/health

# Expected response
{"status":"ok","timestamp":"2025-10-24T18:00:00.000Z","environment":"production"}
```

### 2. Database Connection Test
```bash
# Test database connection
psql -U crx_user -h localhost -p 5432 -d playwright_crx -c "SELECT 1;"

# Expected response
?column?
----------
        1
(1 row)
```

### 3. Authentication Test
```bash
# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'

# Test user login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 4. Extension Test
```bash
# Test extension loading
# Load extension in Chromium with:
# chromium --load-extension=/opt/playwright-crx-extension/extension.crx
```

---

## 🐛 Troubleshooting Common Issues

### Issue 1: PostgreSQL Connection Failed
**Symptoms**:
- "Connection refused" error
