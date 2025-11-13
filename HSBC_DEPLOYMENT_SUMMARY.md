# 🏦 HSBC Environment Deployment Summary

This document provides a complete summary for deploying the Playwright CRX testing framework to the HSBC Red Hat environment, including database migration from the current playwright_crx database.

## 📋 Quick Start Guide

### 1. Clone Repository on HSBC Environment

```bash
# Clone the repository
git clone https://github.com/penetrationtesting212/chrome-ext.git
cd chrome-ext
```

### 2. Database Migration

```bash
# Option 1: Use the migration package
./scripts/migrate-to-redhat.sh

# Option 2: Manual backup and restore
# On current machine:
./scripts/backup-database.bat

# Transfer backup file to HSBC environment
# On HSBC:
./scripts/restore-database.sh <backup_file>
```

### 3. Build Application

```bash
# Build everything
./scripts/build-all.bat  # Windows
# or
./scripts/build-all.sh   # Linux/Mac
```

### 4. Setup Backend

```bash
# Navigate to backend
cd playwright-crx-enhanced/backend

# Install dependencies
npm install --production

# Configure environment
cp .env.example .env
# Edit .env with HSBC database credentials

# Run migrations
npx prisma migrate deploy

# Start backend
npm start
```

### 5. Load Extension

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `examples/recorder-crx/dist` folder

---

## 🗄️ Database Migration Details

### Current Database Information
- **Database Name**: playwright_crx
- **Source Environment**: Current Windows/Linux environment
- **Target Environment**: HSBC Red Hat environment
- **Backup Format**: Compressed SQL (.sql.gz)

### Migration Steps

1. **Create Backup** (Current Environment)
   ```bash
   # Windows
   scripts\backup-database.bat
   
   # Linux/Mac
   ./scripts/backup-database.sh
   ```

2. **Transfer Backup** (To HSBC Environment)
   - Copy backup file from `./backups/` directory
   - Transfer via secure method (SCP, SFTP, etc.)
   - Place in HSBC environment `./backups/` directory

3. **Restore Database** (HSBC Environment)
   ```bash
   # Ensure PostgreSQL is running
   sudo systemctl status postgresql15
   
   # Restore from backup
   ./scripts/restore-database.sh <backup_file>
   ```

4. **Verify Migration**
   ```bash
   # Check database connection
   psql -h localhost -U crx_user -d playwright_crx -c "SELECT version();"
   
   # Verify tables
   ./list-postgres-tables.sh
   ```

---

## 🔧 HSBC Environment Setup

### System Requirements

```bash
# Check Red Hat version
cat /etc/redhat-release

# Required packages
sudo dnf install -y nodejs npm postgresql15-server postgresql15-contrib
```

### PostgreSQL Configuration

```bash
# Install PostgreSQL 15
sudo dnf install -y postgresql15-server postgresql15-contrib

# Initialize database
sudo postgresql-setup --initdb

# Start and enable
sudo systemctl enable postgresql15
sudo systemctl start postgresql15

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE playwright_crx;
CREATE USER crx_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE playwright_crx TO crx_user;
ALTER USER crx_user CREATEDB;
\q
EOF
```

### Application Configuration

```bash
# Create application directory
sudo mkdir -p /opt/playwright-crx
sudo chown $USER:$USER /opt/playwright-crx

# Extract application
tar -xzf playwright-crx-YYYYMMDD.tar.gz -C /opt/playwright-crx

# Setup backend
cd /opt/playwright-crx/playwright-crx-enhanced/backend
npm install --production
cp .env.example .env

# Edit .env with HSBC settings
nano .env
```

### Environment Variables for HSBC

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_crx
DB_USER=crx_user
DB_PASSWORD=secure_hsbc_password
DB_SCHEMA=public
DATABASE_URL="postgresql://crx_user:secure_hsbc_password@localhost:5432/playwright_crx?schema=public"

# Security (CHANGE THESE FOR PRODUCTION)
JWT_ACCESS_SECRET="hsbc-super-secret-access-key-change-in-production"
JWT_REFRESH_SECRET="hsbc-super-secret-refresh-key-change-in-production"

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS - Update with HSBC domain
ALLOWED_ORIGINS="chrome-extension://your-extension-id-here,https://hsbc-domain.com"

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR="./uploads"

# Logging
LOG_LEVEL=info  # Use info for production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🚀 Service Configuration

### Systemd Service

```bash
# Create systemd service file
sudo tee /etc/systemd/system/playwright-crx.service > /dev/null << EOF
[Unit]
Description=Playwright CRX Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=playwright
WorkingDirectory=/opt/playwright-crx/playwright-crx-enhanced/backend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Create service user
sudo useradd -r -s /bin/false playwright
sudo chown -R playwright:playwright /opt/playwright-crx

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable playwright-crx
sudo systemctl start playwright-crx
```

### Firewall Configuration

```bash
# Open required ports
sudo firewall-cmd --permanent --add-port=3000/tcp  # Backend API
sudo firewall-cmd --permanent --add-port=3001/tcp  # WebSocket
sudo firewall-cmd --reload

# Verify open ports
sudo firewall-cmd --list-ports
```

---

## 🧪 Testing and Verification

### Extension Testing

1. **Load Extension**
   - Open Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `/opt/playwright-crx/examples/recorder-crx/dist`

2. **Test Functionality**
   - Click extension icon
   - Try recording a simple action
   - Verify backend connection
   - Check Chrome DevTools console for errors

### Backend Testing

```bash
# Test API endpoints
curl -X GET http://localhost:3000/api/health

# Check service status
sudo systemctl status playwright-crx

# View logs
sudo journalctl -u playwright-crx -f
```

### Database Testing

```bash
# Test database connection
psql -h localhost -U crx_user -d playwright_crx -c "SELECT version();"

# List tables
psql -h localhost -U crx_user -d playwright_crx -c "\dt"

# Check data
psql -h localhost -U crx_user -d playwright_crx -c "SELECT COUNT(*) FROM \"User\";"
```

---

## 🔒 Security Considerations for HSBC

### Database Security

1. **Strong Passwords**
   - Use complex passwords for database
   - Rotate passwords regularly
   - Store passwords securely

2. **Access Control**
   - Restrict database access to authorized users
   - Use connection pooling
   - Enable SSL for database connections

3. **Network Security**
   - Configure firewall rules
   - Use HTTPS for API communication
   - Implement rate limiting

### Application Security

1. **Environment Variables**
   - Change default JWT secrets
   - Use environment-specific configurations
   - Never commit secrets to Git

2. **File Permissions**
   - Set appropriate file permissions
   - Use dedicated service user
   - Restrict access to sensitive files

3. **Monitoring**
   - Enable application logging
   - Monitor system logs
   - Set up alerting

---

## 📊 Performance Optimization

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_script_user_id ON "Script"("userId");
CREATE INDEX IF NOT EXISTS idx_testrun_user_id ON "TestRun"("userId");
CREATE INDEX IF NOT EXISTS idx_testrun_started_at ON "TestRun"("startedAt");
```

### Application Optimization

```bash
# Configure connection pooling
# Add to .env
DB_CONNECTION_POOL_MIN=5
DB_CONNECTION_POOL_MAX=20

# Enable caching
# Add to .env
CACHE_TTL=3600  # 1 hour
CACHE_MAX_SIZE=1000
```

---

## 🆘 Troubleshooting Guide

### Common Issues

1. **Extension Won't Load**
   - Check manifest.json syntax
   - Verify file permissions
   - Check Chrome DevTools console

2. **Backend Won't Start**
   - Check database connection
   - Verify port availability
   - Check system logs

3. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check credentials in .env
   - Test with psql command

4. **Migration Failed**
   - Check backup file integrity
   - Verify database permissions
   - Check available disk space

### Log Locations

```bash
# Application logs
sudo journalctl -u playwright-crx -f

# PostgreSQL logs
sudo tail -f /var/lib/pgsql/data/log/postgresql.log

# System logs
sudo journalctl -f
```

---

## 📞 Support and Maintenance

### Regular Maintenance

1. **Database Backups**
   ```bash
   # Schedule daily backups
   0 2 * * * /opt/playwright-crx/scripts/backup-database.sh
   ```

2. **Log Rotation**
   ```bash
   # Configure logrotate
   sudo nano /etc/logrotate.d/playwright-crx
   ```

3. **Security Updates**
   ```bash
   # Regular updates
   sudo dnf update -y
   ```

### Contact Information

For technical support:
1. Check documentation in repository
2. Review system logs
3. Verify configuration files
4. Test with minimal setup

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Repository cloned on HSBC environment
- [ ] PostgreSQL installed and configured
- [ ] Database backup transferred from source
- [ ] Environment variables configured
- [ ] Firewall rules applied
- [ ] Service user created

### Post-Deployment
- [ ] Database restored successfully
- [ ] Backend service running
- [ ] Extension loads in Chrome
- [ ] API endpoints responding
- [ ] All tests passing
- [ ] Logs being collected
- [ ] Monitoring configured

### Security Verification
- [ ] Default passwords changed
- [ ] HTTPS configured
- [ ] Database access restricted
- [ ] File permissions set correctly
- [ ] SELinux configured (if applicable)

---

## 📚 Additional Resources

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [DATABASE_MIGRATION_SCRIPTS.md](./DATABASE_MIGRATION_SCRIPTS.md) - Database migration scripts
- [EXTENSION_BUILD_GUIDE.md](./EXTENSION_BUILD_GUIDE.md) - Extension building guide
- [DATABASE_INTEGRATION_CODE.md](./DATABASE_INTEGRATION_CODE.md) - Database integration documentation

---

**🎉 Your Playwright CRX application is now ready for HSBC deployment!**

For any issues during deployment, refer to the troubleshooting section or check the system logs.