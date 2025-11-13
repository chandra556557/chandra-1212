#!/bin/bash

# =============================================================================
# PostgreSQL Installation and Setup Script for Red Hat Enterprise Linux
# =============================================================================
# This script installs PostgreSQL and sets up the initial database
# for Playwright-CRX application on Red Hat-based distributions
#
# Supported distributions:
# - RHEL 8+
# - CentOS 8+
# - Rocky Linux 8+
# - AlmaLinux 8+
# - Fedora 35+
#
# Usage:
#   sudo ./install-postgresql-redhat.sh
# =============================================================================

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
DB_NAME="playwright_crx"
DB_USER="crx_user"
DB_PASSWORD="crx_password"
DB_HOST="localhost"
DB_PORT="5432"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to detect the distribution
detect_distribution() {
    if [ -f /etc/redhat-release ]; then
        if grep -q "Red Hat Enterprise Linux" /etc/redhat-release; then
            echo "rhel"
        elif grep -q "CentOS" /etc/redhat-release; then
            echo "centos"
        elif grep -q "Rocky" /etc/redhat-release; then
            echo "rocky"
        elif grep -q "AlmaLinux" /etc/redhat-release; then
            echo "almalinux"
        else
            echo "redhat-based"
        fi
    elif [ -f /etc/fedora-release ]; then
        echo "fedora"
    else
        echo "unknown"
    fi
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root or with sudo"
        exit 1
    fi
}

# Function to check if PostgreSQL is already installed
check_postgresql_installed() {
    if command -v psql &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to install PostgreSQL on RHEL/CentOS/Rocky/AlmaLinux
install_postgresql_rhel() {
    print_status "Installing PostgreSQL on RHEL-based distribution..."

    # Enable AppStream repository (for RHEL 8+)
    print_status "Enabling PostgreSQL repository..."
    sudo dnf module -y enable postgresql:13

    # Install PostgreSQL server and contrib
    print_status "Installing PostgreSQL server and contrib..."
    sudo dnf install -y postgresql-server postgresql-contrib

    # Initialize PostgreSQL database
    print_status "Initializing PostgreSQL database..."
    sudo postgresql-setup --initdb

    # Start and enable PostgreSQL service
    print_status "Starting and enabling PostgreSQL service..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql

    print_success "PostgreSQL installed successfully"
}

# Function to install PostgreSQL on Fedora
install_postgresql_fedora() {
    print_status "Installing PostgreSQL on Fedora..."

    # Install PostgreSQL server and contrib
    print_status "Installing PostgreSQL server and contrib..."
    sudo dnf install -y postgresql-server postgresql-contrib

    # Initialize PostgreSQL database
    print_status "Initializing PostgreSQL database..."
    sudo postgresql-setup --initdb

    # Start and enable PostgreSQL service
    print_status "Starting and enabling PostgreSQL service..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql

    print_success "PostgreSQL installed successfully"
}

# Function to configure PostgreSQL
configure_postgresql() {
    print_status "Configuring PostgreSQL..."

    # Set password for postgres user
    print_status "Setting password for postgres user..."
    sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

    # Configure PostgreSQL to accept connections
    PG_HBA_FILE="/var/lib/pgsql/data/pg_hba.conf"
    POSTGRESQL_CONF="/var/lib/pgsql/data/postgresql.conf"

    # Backup original files
    sudo cp "$PG_HBA_FILE" "$PG_HBA_FILE.backup"
    sudo cp "$POSTGRESQL_CONF" "$POSTGRESQL_CONF.backup"

    # Update pg_hba.conf to use md5 authentication
    print_status "Updating authentication method in pg_hba.conf..."
    sudo sed -i 's/scram-sha-256/md5/g' "$PG_HBA_FILE"

    # Listen on all interfaces
    print_status "Configuring PostgreSQL to listen on all interfaces..."
    sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$POSTGRESQL_CONF"

    # Restart PostgreSQL to apply changes
    print_status "Restarting PostgreSQL to apply configuration changes..."
    sudo systemctl restart postgresql

    print_success "PostgreSQL configured successfully"
}

# Function to create database and user
create_database_and_user() {
    print_status "Creating database and user for Playwright-CRX..."

    # Create database
    print_status "Creating database: $DB_NAME"
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" || {
        print_warning "Database $DB_NAME already exists"
    }

    # Create user
    print_status "Creating user: $DB_USER"
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" || {
        print_warning "User $DB_USER already exists"
    }

    # Grant privileges to user
    print_status "Granting privileges to user: $DB_USER"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

    print_success "Database and user created successfully"
}

# Function to test PostgreSQL connection
test_postgresql_connection() {
    print_status "Testing PostgreSQL connection..."

    # Test connection to database
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" &> /dev/null; then
        print_success "PostgreSQL connection test successful"
        return 0
    else
        print_error "PostgreSQL connection test failed"
        return 1
    fi
}

# Function to display connection information
display_connection_info() {
    print_status "PostgreSQL Connection Information:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo "  Password: $DB_PASSWORD"
    echo ""
    print_status "Connection string for application:"
    echo "  postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    echo ""
    print_status "To connect to the database:"
    echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    echo ""
}

# Function to create a sample .env file
create_env_file() {
    ENV_FILE=".env"

    print_status "Creating sample .env file..."

    cat > "$ENV_FILE" << EOF
# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Application Configuration
PORT=3000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_here

# Chrome Extension Configuration
EXTENSION_ID=your_extension_id
EXTENSION_VERSION=1.0.0
EOF

    print_success "Sample .env file created: $ENV_FILE"
    print_warning "Please update the JWT_SECRET and EXTENSION_ID values before using"
}

# Main installation function
main() {
    print_status "Starting PostgreSQL installation for Playwright-CRX..."
    echo "=============================================================="

    # Check if running as root
    check_root

    # Detect distribution
    DISTRO=$(detect_distribution)
    print_status "Detected distribution: $DISTRO"

    # Check if PostgreSQL is already installed
    if check_postgresql_installed; then
        print_warning "PostgreSQL is already installed"
        read -p "Do you want to continue with database setup? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Exiting..."
            exit 0
        fi
    else
        # Install PostgreSQL based on distribution
        case $DISTRO in
            "rhel"|"centos"|"rocky"|"almalinux"|"redhat-based")
                install_postgresql_rhel
                ;;
            "fedora")
                install_postgresql_fedora
                ;;
            *)
                print_error "Unsupported distribution: $DISTRO"
                exit 1
                ;;
        esac
    fi

    # Configure PostgreSQL
    configure_postgresql

    # Create database and user
    create_database_and_user

    # Test PostgreSQL connection
    if test_postgresql_connection; then
        # Display connection information
        display_connection_info

        # Create sample .env file
        create_env_file

        print_success "PostgreSQL installation and setup completed successfully!"
        echo "=============================================================="
        print_status "Next steps:"
        echo "1. Update the .env file with your application settings"
        echo "2. Install Node.js and npm if not already installed"
        echo "3. Clone the Playwright-CRX repository"
        echo "4. Install dependencies and run the application"
    else
        print_error "PostgreSQL installation completed but connection test failed"
        print_status "Please check the PostgreSQL logs:"
        echo "  sudo journalctl -u postgresql"
        exit 1
    fi
}

# Run the main function
main "$@"
