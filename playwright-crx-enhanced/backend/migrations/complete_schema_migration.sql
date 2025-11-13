-- =====================================================
-- Complete Database Schema Migration
-- Generated: 2025-11-10
-- Description: Full schema with all tables and indexes
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- DROP EXISTING TABLES (in correct order due to foreign keys)
-- =====================================================
DROP TABLE IF EXISTS "Breakpoint" CASCADE;
DROP TABLE IF EXISTS "Variable" CASCADE;
DROP TABLE IF EXISTS "TestStep" CASCADE;
DROP TABLE IF EXISTS "TestRun" CASCADE;
DROP TABLE IF EXISTS "Script" CASCADE;
DROP TABLE IF EXISTS "ExtensionScript" CASCADE;
DROP TABLE IF EXISTS "TestData" CASCADE;
DROP TABLE IF EXISTS "TestSuite" CASCADE;
DROP TABLE IF EXISTS "ApiRequest" CASCADE;
DROP TABLE IF EXISTS "Project" CASCADE;
DROP TABLE IF EXISTS "RefreshToken" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- =====================================================
-- TABLE: User
-- =====================================================
CREATE TABLE "User" (
    id VARCHAR(200) PRIMARY KEY,
    email VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    name VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "User_email_idx" ON "User"(email);

-- =====================================================
-- TABLE: RefreshToken
-- =====================================================
CREATE TABLE "RefreshToken" (
    id VARCHAR(200) PRIMARY KEY,
    token VARCHAR(200) NOT NULL UNIQUE,
    "userId" VARCHAR(200) NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "revokedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"(token);

-- =====================================================
-- TABLE: Project
-- =====================================================
CREATE TABLE "Project" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    "userId" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Project_userId_idx" ON "Project"("userId");
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- =====================================================
-- TABLE: Script
-- =====================================================
CREATE TABLE "Script" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    language VARCHAR(200) NOT NULL DEFAULT 'typescript',
    code TEXT NOT NULL,
    "projectId" VARCHAR(200),
    "userId" VARCHAR(200) NOT NULL,
    "browserType" VARCHAR(200) NOT NULL DEFAULT 'chromium',
    viewport JSONB,
    "testIdAttribute" VARCHAR(200) NOT NULL DEFAULT 'data-testid',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "Script_projectId_fkey" FOREIGN KEY ("projectId") 
        REFERENCES "Project"(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Script_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Script_userId_idx" ON "Script"("userId");
CREATE INDEX "Script_projectId_idx" ON "Script"("projectId");
CREATE INDEX "Script_createdAt_idx" ON "Script"("createdAt");

-- =====================================================
-- TABLE: TestRun
-- =====================================================
CREATE TABLE "TestRun" (
    id VARCHAR(200) PRIMARY KEY,
    "scriptId" VARCHAR(200) NOT NULL,
    "userId" VARCHAR(200) NOT NULL,
    status VARCHAR(200) NOT NULL,
    duration INTEGER,
    "errorMsg" TEXT,
    "traceUrl" TEXT,
    "screenshotUrls" JSONB,
    "videoUrl" TEXT,
    environment VARCHAR(200),
    browser VARCHAR(200) NOT NULL DEFAULT 'chromium',
    viewport JSONB,
    "startedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "completedAt" TIMESTAMP,
    "executionReportUrl" TEXT,
    CONSTRAINT "TestRun_scriptId_fkey" FOREIGN KEY ("scriptId") 
        REFERENCES "Script"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestRun_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "TestRun_scriptId_idx" ON "TestRun"("scriptId");
CREATE INDEX "TestRun_userId_idx" ON "TestRun"("userId");
CREATE INDEX "TestRun_status_idx" ON "TestRun"(status);
CREATE INDEX "TestRun_startedAt_idx" ON "TestRun"("startedAt");

-- =====================================================
-- TABLE: TestStep
-- =====================================================
CREATE TABLE "TestStep" (
    id VARCHAR(200) PRIMARY KEY,
    "testRunId" VARCHAR(200) NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    action VARCHAR(200) NOT NULL,
    selector TEXT,
    value TEXT,
    status VARCHAR(200) NOT NULL,
    duration INTEGER,
    "errorMsg" TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "TestStep_testRunId_fkey" FOREIGN KEY ("testRunId") 
        REFERENCES "TestRun"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "TestStep_testRunId_idx" ON "TestStep"("testRunId");
CREATE INDEX "TestStep_stepNumber_idx" ON "TestStep"("stepNumber");

-- =====================================================
-- TABLE: ExtensionScript
-- =====================================================
CREATE TABLE "ExtensionScript" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    "scriptType" VARCHAR(200) NOT NULL,
    "userId" VARCHAR(200) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "ExtensionScript_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ExtensionScript_userId_idx" ON "ExtensionScript"("userId");
CREATE INDEX "ExtensionScript_scriptType_idx" ON "ExtensionScript"("scriptType");

-- =====================================================
-- TABLE: Variable
-- =====================================================
CREATE TABLE "Variable" (
    id VARCHAR(200) PRIMARY KEY,
    "scriptId" VARCHAR(200) NOT NULL,
    name VARCHAR(200) NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "Variable_scriptId_fkey" FOREIGN KEY ("scriptId") 
        REFERENCES "Script"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Variable_scriptId_name_key" UNIQUE ("scriptId", name)
);

CREATE INDEX "Variable_scriptId_idx" ON "Variable"("scriptId");

-- =====================================================
-- TABLE: Breakpoint
-- =====================================================
CREATE TABLE "Breakpoint" (
    id VARCHAR(200) PRIMARY KEY,
    "scriptId" VARCHAR(200) NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    condition TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "Breakpoint_scriptId_fkey" FOREIGN KEY ("scriptId") 
        REFERENCES "Script"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Breakpoint_scriptId_lineNumber_key" UNIQUE ("scriptId", "lineNumber")
);

CREATE INDEX "Breakpoint_scriptId_idx" ON "Breakpoint"("scriptId");

-- =====================================================
-- TABLE: TestSuite
-- =====================================================
CREATE TABLE "TestSuite" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    "userId" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "TestSuite_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "TestSuite_userId_idx" ON "TestSuite"("userId");

-- =====================================================
-- TABLE: TestData
-- =====================================================
CREATE TABLE "TestData" (
    id VARCHAR(200) PRIMARY KEY,
    "suiteId" VARCHAR(200) NOT NULL,
    name VARCHAR(200) NOT NULL,
    environment VARCHAR(200) NOT NULL DEFAULT 'dev',
    type VARCHAR(200) NOT NULL DEFAULT 'user',
    data JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "TestData_suiteId_fkey" FOREIGN KEY ("suiteId") 
        REFERENCES "TestSuite"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "TestData_suiteId_idx" ON "TestData"("suiteId");
CREATE INDEX "TestData_environment_idx" ON "TestData"(environment);
CREATE INDEX "TestData_type_idx" ON "TestData"(type);

-- =====================================================
-- TABLE: ApiRequest
-- =====================================================
CREATE TABLE "ApiRequest" (
    id VARCHAR(200) PRIMARY KEY,
    "userId" VARCHAR(200) NOT NULL,
    name VARCHAR(200) NOT NULL,
    method VARCHAR(200) NOT NULL,
    url TEXT NOT NULL,
    headers JSONB,
    body JSONB,
    environment VARCHAR(200) NOT NULL DEFAULT 'dev',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "ApiRequest_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ApiRequest_userId_idx" ON "ApiRequest"("userId");
CREATE INDEX "ApiRequest_environment_idx" ON "ApiRequest"(environment);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updatedAt trigger to all relevant tables
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_updated_at BEFORE UPDATE ON "Project"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_script_updated_at BEFORE UPDATE ON "Script"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extension_script_updated_at BEFORE UPDATE ON "ExtensionScript"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variable_updated_at BEFORE UPDATE ON "Variable"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_suite_updated_at BEFORE UPDATE ON "TestSuite"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_data_updated_at BEFORE UPDATE ON "TestData"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_request_updated_at BEFORE UPDATE ON "ApiRequest"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment to insert sample user
-- INSERT INTO "User" (id, email, password, name, "createdAt", "updatedAt")
-- VALUES ('test-user-001', 'admin@example.com', '$2b$10$example_hashed_password', 'Admin User', NOW(), NOW());

-- =====================================================
-- VERIFICATION QUERIES (Run separately after migration)
-- =====================================================

-- Count all tables
-- SELECT 
--     schemaname,
--     tablename,
--     (SELECT COUNT(*) FROM pg_class WHERE relname = tablename) as table_exists
-- FROM pg_tables 
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- List all indexes
-- SELECT 
--     schemaname,
--     tablename,
--     indexname
-- FROM pg_indexes 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
