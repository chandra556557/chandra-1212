#!/bin/bash

# PostgreSQL Tables Listing Script
# This script connects to PostgreSQL and lists all tables

# Load environment variables from .env file
if [ -f "playwright-crx-enhanced/backend/.env" ]; then
    export $(grep -v '^#' playwright-crx-enhanced/backend/.env | xargs)
else
    echo "Error: .env file not found in playwright-crx-enhanced/backend/"
    echo "Please copy .env.example to .env and configure your database credentials"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL not found in .env file"
    exit 1
fi

echo "🔍 Connecting to PostgreSQL database..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo ""

# List all tables in the database
echo "📋 Listing all tables:"
psql "$DATABASE_URL" -c "\dt"

echo ""
echo "📊 Table details:"
psql "$DATABASE_URL" -c "
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM 
    information_schema.tables t
JOIN 
    information_schema.columns c ON t.table_name = c.table_name
WHERE 
    t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY 
    t.table_name, 
    c.ordinal_position;
"

echo ""
echo "✅ Table listing complete!"