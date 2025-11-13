#!/bin/bash

# 🔧 Playwright CRX Authentication Setup Script
# This script sets up the complete authentication system

echo "🚀 Setting up Playwright CRX Authentication System..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -d "playwright-crx-enhanced" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# 1. Check PostgreSQL
echo ""
print_info "1. Checking PostgreSQL installation..."

if command -v psql &> /dev/null; then
    print_status "PostgreSQL is installed"
    
    # Check if PostgreSQL is running
    if pg_isready -q &> /dev/null; then
        print_status "PostgreSQL is running"
    else
        print_warning "PostgreSQL is not running"
        print_info "Starting PostgreSQL service..."
        
        # Try different commands based on OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo systemctl start postgresql
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew services start postgresql
        else
            print_warning "Please start PostgreSQL manually"
        fi
        
        # Wait a moment and check again
        sleep 3
        if pg_isready -q &> /dev/null; then
            print_status "PostgreSQL started successfully"
        else
            print_error "Failed to start PostgreSQL"
            exit 1
        fi
    fi
else
    print_error "PostgreSQL is not installed"
    print_info "Please install PostgreSQL first:"
    print_info "  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    print_info "  macOS: brew install postgresql"
    print_info "  Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# 2. Setup Database
echo ""
print_info "2. Setting up database..."

# Check if database exists
DB_EXISTS=$(psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='playwright_crx'")

if [ "$DB_EXISTS" = "1" ]; then
    print_status "Database 'playwright_crx' already exists"
else
    print_info "Creating database 'playwright_crx'..."
    createdb -U postgres playwright_crx
    if [ $? -eq 0 ]; then
        print_status "Database created successfully"
    else
        print_error "Failed to create database"
        exit 1
    fi
fi

# 3. Setup Backend
echo ""
print_info "3. Setting up backend..."

cd playwright-crx-enhanced/backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installing backend dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
else
    print_status "Dependencies already installed"
fi

# 4. Setup Environment
echo ""
print_info "4. Setting up environment variables..."

if [ ! -f ".env" ]; then
    print_info "Creating .env file from template..."
    cp .env.example .env
    
    # Generate random secrets
    ACCESS_SECRET=$(openssl rand -base64 32)
    REFRESH_SECRET=$(openssl rand -base64 32)
    
    # Update .env with random secrets
    sed -i.bak "s/your-super-secret-access-key-change-this-in-production/$ACCESS_SECRET/" .env
    sed -i.bak "s/your-super-secret-refresh-key-change-this-in-production/$REFRESH_SECRET/" .env
    rm .env.bak
    
    print_status "Environment file created with secure secrets"
    print_warning "Please update .env with your PostgreSQL password"
else
    print_status "Environment file already exists"
fi

# 5. Database Migrations
echo ""
print_info "5. Running database migrations..."

npx prisma migrate dev --name init
if [ $? -eq 0 ]; then
    print_status "Database migrations completed"
else
    print_error "Database migrations failed"
    exit 1
fi

# 6. Start Backend Server
echo ""
print_info "6. Starting backend server..."

# Check if port 3000 is already in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    print_warning "Port 3000 is already in use"
    print_info "Trying to kill existing process..."
    pkill -f "node.*3000" || true
    sleep 2
fi

print_info "Starting server on http://localhost:3000"
npm run dev &
BACKEND_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health >/dev/null 2>&1; then
        print_status "Backend server is running successfully"
        break
    fi
    sleep 1
    echo -n "."
done

if ! curl -s http://localhost:3000/api/health >/dev/null 2>&1; then
    print_error "Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 7. Extension Setup
echo ""
print_info "7. Extension setup instructions..."

print_warning "Please complete these steps manually:"
echo ""
echo "1. 📋 Get Extension ID:"
echo "   - Open Chrome: chrome://extensions/"
echo "   - Enable 'Developer mode'"
echo "   - Find your extension ID (32-character string)"
echo ""
echo "2. 🔧 Update .env file:"
echo "   - Add your extension ID to ALLOWED_ORIGINS"
echo "   - Example: ALLOWED_ORIGINS=\"chrome-extension://YOUR_ID_HERE,http://localhost:3000\""
echo ""
echo "3. 🔄 Reload Extension:"
echo "   - Go to chrome://extensions/"
echo "   - Click reload button for Playwright CRX"
echo ""
echo "4. 🧪 Test Authentication:"
echo "   - Open extension popup"
echo "   - Try to register a new user"
echo ""

# 8. Test Authentication
echo ""
print_info "8. Testing authentication system..."

# Test registration
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"test123\",\"name\":\"Test User\"}")

if echo "$TEST_RESPONSE" | grep -q "accessToken"; then
    print_status "Registration API is working"
else
    print_error "Registration API failed"
    echo "Response: $TEST_RESPONSE"
fi

# Test login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"test123\"}")

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    print_status "Login API is working"
else
    print_error "Login API failed"
    echo "Response: $LOGIN_RESPONSE"
fi

# Final instructions
echo ""
echo "=================================================="
print_status "Authentication setup completed!"
echo ""
print_info "Backend server is running with PID: $BACKEND_PID"
print_info "Server URL: http://localhost:3000"
print_info "API Health: http://localhost:3000/api/health"
echo ""
print_warning "To stop the server: kill $BACKEND_PID"
print_warning "To restart: cd playwright-crx-enhanced/backend && npm run dev"
echo ""
print_info "Next steps:"
echo "1. Update extension ID in .env"
echo "2. Reload Chrome extension"
echo "3. Test user registration in extension"
echo ""
echo "🎯 Run './auth-diagnostic.js' in browser console for detailed testing"