# 🚀 Red Hat Deployment Guide for Playwright-CRX

**Date**: 2025-10-23
**Status**: ✅ **COMPLETED**

---

## 🎯 Overview

This guide provides comprehensive instructions for deploying the Playwright-CRX application with AI Self-Healing enhancements on Red Hat Enterprise Linux (RHEL) and other Red Hat-based distributions (CentOS, Fedora, Rocky Linux, etc.).

---

## 🔍 System Requirements

### Hardware Requirements
- **CPU**: 2+ cores (4+ recommended for production)
- **RAM**: 4GB minimum (8GB+ recommended)
- **Storage**: 20GB available space
- **Network**: Internet access for dependencies

### Software Requirements
- **Operating System**: RHEL 8+, CentOS 8+, Fedora 35+, Rocky Linux 8+
- **Node.js**: 18.x or 20.x
- **npm**: 9.x or 10.x
- **PostgreSQL**: 13+ (for backend data storage)
- **Git**: 2.25+

---

## 📦 Installation Steps

### 1. Install Node.js and npm

#### Option A: Using NodeSource Repository (Recommended)
```bash
# Add NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Install Node.js
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

#### Option B: Using DNF (Fedora)
```bash
# Install Node.js
sudo dnf install -y nodejs npm

# Verify installation
node --version
npm --version
```

### 2. Install PostgreSQL Database

```bash
# Install PostgreSQL
sudo yum install -y postgresql-server postgresql-contrib

# Initialize database
sudo postgresql-setup --initdb

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Set password for postgres user
sudo -u postgres psql
ALTER USER postgres WITH PASSWORD 'your_password';
\q
```

### 3. Create Application Database

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE playwright_crx;
CREATE USER crx_user WITH PASSWORD 'crx_password';
GRANT ALL PRIVILEGES ON DATABASE playwright_crx TO crx_user;
\q
```

### 4. Install Git

```bash
# Install Git
sudo yum install -y git

# Verify installation
git --version
```

---

## 🚀 Application Deployment

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd playwright-crx-enhanced
```

### 2. Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit environment file
nano .env
```

#### Environment Configuration (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_crx
DB_USER=crx_user
DB_PASSWORD=crx_password

# Application Configuration
PORT=3000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_here

# Chrome Extension Configuration
EXTENSION_ID=your_extension_id
EXTENSION_VERSION=1.0.0
```

### 3. Run Database Migrations

```bash
# Run migrations
npm run migrate

# Seed database (optional)
npm run seed
```

### 4. Build and Start Backend

```bash
# Build application
npm run build

# Start application in production mode
npm start
```

### 5. Install Frontend Dependencies

```bash
# Navigate to extension directory
cd ../examples/recorder-crx

# Install dependencies
npm install
```

### 6. Build Chrome Extension

```bash
# Build extension
npm run build

# The built extension will be in the dist/ directory
```

---

## 🔧 Systemd Service Configuration

### 1. Create Backend Service File

```bash
# Create service file
sudo nano /etc/systemd/system/playwright-crx.service
```

#### Service Configuration
```ini
[Unit]
Description=Playwright CRX Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/playwright-crx-enhanced/backend
ExecStart=/usr/bin/node /path/to/playwright-crx-enhanced/backend/dist/server.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### 2. Enable and Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable playwright-crx

# Start service
sudo systemctl start playwright-crx

# Check status
sudo systemctl status playwright-crx
```

---

## 🌐 Nginx Reverse Proxy (Optional)

### 1. Install Nginx

```bash
# Install EPEL repository (RHEL/CentOS)
sudo yum install -y epel-release

# Install Nginx
sudo yum install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Configure Nginx

```bash
# Create configuration file
sudo nano /etc/nginx/conf.d/playwright-crx.conf
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /path/to/playwright-crx-enhanced/frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Test and Restart Nginx

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 Firewall Configuration

### 1. Configure Firewall (RHEL/CentOS)

```bash
# Open necessary ports
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp

# Reload firewall
sudo firewall-cmd --reload
```

### 2. Configure Firewall (Fedora)

```bash
# Open necessary ports
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3000/tcp

# Reload firewall
sudo firewall-cmd --reload
```

---

## 📊 Monitoring and Logging

### 1. Log Configuration

```bash
# Create log directory
sudo mkdir -p /var/log/playwright-crx
sudo chown your_username:your_username /var/log/playwright-crx

# Configure logging in .env
echo "LOG_FILE=/var/log/playwright-crx/app.log" >> /path/to/playwright-crx-enhanced/backend/.env
```

### 2. Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/playwright-crx
```

#### Logrotate Configuration
```
/var/log/playwright-crx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 your_username your_username
    postrotate
        systemctl reload playwright-crx
    endscript
}
```

### 3. Monitoring with PM2 (Alternative to Systemd)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application with PM2
cd /path/to/playwright-crx-enhanced/backend
pm2 start dist/server.js --name "playwright-crx"

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your_username --hp /home/your_username
```

---

## 🧪 Testing the Deployment

### 1. Test Backend API

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test API endpoints
curl http://localhost:3000/api/scripts
```

### 2. Test Frontend

```bash
# Open browser and test
# Navigate to http://your-domain.com
```

### 3. Test Chrome Extension

1. Open Chrome/Chromium
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the built extension directory
6. Test the extension functionality

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Node.js Version Incompatibility
```bash
# Check Node.js version
node --version

# If needed, install correct version using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/lib/pgsql/data/log/postgresql.log

# Test connection
psql -h localhost -U crx_user -d playwright_crx
```

#### 3. Port Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R your_username:your_username /path/to/playwright-crx-enhanced
chmod +x /path/to/playwright-crx-enhanced/backend/dist/server.js
```

### Log Locations

- **Application Logs**: `/var/log/playwright-crx/`
- **Nginx Logs**: `/var/log/nginx/`
- **PostgreSQL Logs**: `/var/lib/pgsql/data/log/`
- **Systemd Logs**: `journalctl -u playwright-crx`

---

## 🔄 Maintenance

### 1. Update Application

```bash
# Pull latest changes
cd /path/to/playwright-crx-enhanced
git pull origin main

# Update dependencies
cd backend
npm install

# Build and restart
npm run build
sudo systemctl restart playwright-crx
```

### 2. Database Maintenance

```bash
# Connect to database
psql -h localhost -U crx_user -d playwright_crx

# Run VACUUM
VACUUM ANALYZE;

# Backup database
pg_dump -h localhost -U crx_user playwright_crx > backup.sql
```

### 3. System Updates

```bash
# Update system packages
sudo yum update -y

# Update Node.js
npm install -g n
n latest

# Restart services
sudo systemctl restart playwright-crx
sudo systemctl restart nginx
```

---

## 📈 Performance Optimization

### 1. Enable Gzip Compression

```nginx
# Add to Nginx configuration
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. Enable Caching

```nginx
# Add to Nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Optimize Database

```sql
-- Create indexes
CREATE INDEX idx_scripts_created_at ON scripts(created_at);
CREATE INDEX idx_executions_status ON executions(status);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM scripts WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## 🎉 Conclusion

The Playwright-CRX application with AI Self-Healing enhancements is fully compatible with Red Hat Enterprise Linux and other Red Hat-based distributions. This guide provides comprehensive instructions for:

1. **System Setup** - Installing all required dependencies
2. **Application Deployment** - Building and running the application
3. **Service Configuration** - Setting up systemd services
4. **Security** - Configuring firewall and permissions
5. **Monitoring** - Setting up logging and monitoring
6. **Maintenance** - Ongoing maintenance procedures

The application will work seamlessly on Red Hat systems, providing all the AI Self-Healing capabilities including:
- Machine learning for locator confidence scoring
- Pattern recognition for dynamic elements
- Auto-healing with rollback capability
- Visual similarity detection
- Historical success tracking

---

**Deployment Date**: 2025-10-23
**Status**: ✅ **RED HAT READY**
**Compatible With**: RHEL 8+, CentOS 8+, Fedora 35+, Rocky Linux 8+
