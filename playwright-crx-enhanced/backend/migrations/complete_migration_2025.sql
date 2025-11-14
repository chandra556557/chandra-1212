-- =====================================================
-- Complete Database Schema Migration - Updated 2025
-- Description: Comprehensive migration covering all tables
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- DROP EXISTING TABLES (in correct order due to foreign keys)
-- =====================================================
-- Drop auxiliary and integration tables first (respecting FK dependencies)
DROP TABLE IF EXISTS api_performance_benchmarks CASCADE;
DROP TABLE IF EXISTS api_mocks CASCADE;
DROP TABLE IF EXISTS api_contracts CASCADE;
DROP TABLE IF EXISTS api_test_cases CASCADE;
DROP TABLE IF EXISTS api_test_suites CASCADE;
DROP TABLE IF EXISTS test_data_snapshots CASCADE;
DROP TABLE IF EXISTS data_cleanup_rules CASCADE;
DROP TABLE IF EXISTS synthetic_data_templates CASCADE;
DROP TABLE IF EXISTS test_data_repositories CASCADE;
DROP TABLE IF EXISTS "APICallLog" CASCADE;
DROP TABLE IF EXISTS "ExternalAPIConfig" CASCADE;
DROP TABLE IF EXISTS "TestDataset" CASCADE;

-- Core tables
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
-- TABLE: ExternalAPIConfig
-- =====================================================
CREATE TABLE "ExternalAPIConfig" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    "apiType" VARCHAR(200) NOT NULL,
    endpoint VARCHAR(200) NOT NULL,
    method VARCHAR(10) NOT NULL DEFAULT 'POST',
    headers JSONB,
    "authType" VARCHAR(50),
    "authConfig" JSONB,
    "requestTemplate" JSONB,
    "responseMapping" JSONB,
    "userId" VARCHAR(200) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "ExternalAPIConfig_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_externalapiconfig_userid ON "ExternalAPIConfig"("userId");
CREATE INDEX IF NOT EXISTS idx_externalapiconfig_apitype ON "ExternalAPIConfig"("apiType");

-- =====================================================
-- TABLE: APICallLog
-- =====================================================
CREATE TABLE "APICallLog" (
    id VARCHAR(200) PRIMARY KEY,
    "configId" VARCHAR(200) NOT NULL,
    "userId" VARCHAR(200) NOT NULL,
    endpoint VARCHAR(200) NOT NULL,
    method VARCHAR(10) NOT NULL,
    "requestBody" JSONB,
    "responseBody" JSONB,
    "statusCode" INTEGER,
    duration INTEGER,
    success BOOLEAN NOT NULL DEFAULT false,
    error TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "APICallLog_configId_fkey" FOREIGN KEY ("configId")
        REFERENCES "ExternalAPIConfig"(id) ON DELETE CASCADE,
    CONSTRAINT "APICallLog_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_apicalllog_configid ON "APICallLog"("configId");
CREATE INDEX IF NOT EXISTS idx_apicalllog_userid ON "APICallLog"("userId");
CREATE INDEX IF NOT EXISTS idx_apicalllog_createdat ON "APICallLog"("createdAt");

-- =====================================================
-- TABLE: TestDataset
-- =====================================================
CREATE TABLE "TestDataset" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    "dataType" VARCHAR(200) NOT NULL,
    records JSONB NOT NULL DEFAULT '[]',
    schema JSONB,
    "userId" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "TestDataset_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_testdataset_userid ON "TestDataset"("userId");
CREATE INDEX IF NOT EXISTS idx_testdataset_datatype ON "TestDataset"("dataType");
CREATE INDEX IF NOT EXISTS idx_testdataset_createdat ON "TestDataset"("createdAt");

-- =====================================================
-- TEST DATA REPOSITORY TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS test_data_repositories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL,
  source TEXT,
  config JSONB,
  row_count INTEGER DEFAULT 0,
  column_names JSONB,
  last_refreshed TIMESTAMP,
  auto_refresh BOOLEAN DEFAULT false,
  refresh_interval INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_test_data_repo_user ON test_data_repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_test_data_repo_type ON test_data_repositories(data_type);

CREATE TABLE IF NOT EXISTS test_data_snapshots (
  id SERIAL PRIMARY KEY,
  repository_id INTEGER NOT NULL REFERENCES test_data_repositories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  snapshot_data JSONB NOT NULL,
  row_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_snapshot_repo ON test_data_snapshots(repository_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_created ON test_data_snapshots(created_at);

CREATE TABLE IF NOT EXISTS data_cleanup_rules (
  id SERIAL PRIMARY KEY,
  repository_id INTEGER NOT NULL REFERENCES test_data_repositories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  cleanup_type VARCHAR(50) NOT NULL,
  schedule VARCHAR(100),
  query_template TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_executed TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cleanup_repo ON data_cleanup_rules(repository_id);
CREATE INDEX IF NOT EXISTS idx_cleanup_enabled ON data_cleanup_rules(enabled);

CREATE TABLE IF NOT EXISTS synthetic_data_templates (
  id SERIAL PRIMARY KEY,
  repository_id INTEGER NOT NULL REFERENCES test_data_repositories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  field_name VARCHAR(255) NOT NULL,
  data_type VARCHAR(50) NOT NULL,
  generator VARCHAR(100) NOT NULL,
  config JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_synthetic_repo ON synthetic_data_templates(repository_id);

-- =====================================================
-- API TESTING TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS api_test_suites (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  base_url VARCHAR(500),
  headers JSONB,
  auth_config JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_suite_user ON api_test_suites(user_id);

CREATE TABLE IF NOT EXISTS api_test_cases (
  id SERIAL PRIMARY KEY,
  suite_id INTEGER NOT NULL REFERENCES api_test_suites(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  method VARCHAR(10) NOT NULL,
  endpoint VARCHAR(500) NOT NULL,
  headers JSONB,
  query_params JSONB,
  body TEXT,
  expected_status INTEGER,
  expected_response JSONB,
  assertions JSONB,
  timeout INTEGER DEFAULT 5000,
  retry_count INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_test_suite ON api_test_cases(suite_id);
CREATE INDEX IF NOT EXISTS idx_api_test_enabled ON api_test_cases(enabled);

CREATE TABLE IF NOT EXISTS api_contracts (
  id SERIAL PRIMARY KEY,
  suite_id INTEGER NOT NULL REFERENCES api_test_suites(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  contract_type VARCHAR(50) NOT NULL,
  contract_data JSONB NOT NULL,
  validation_rules JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contract_suite ON api_contracts(suite_id);

CREATE TABLE IF NOT EXISTS api_mocks (
  id SERIAL PRIMARY KEY,
  suite_id INTEGER NOT NULL REFERENCES api_test_suites(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  endpoint VARCHAR(500) NOT NULL,
  method VARCHAR(10) NOT NULL,
  response_status INTEGER DEFAULT 200,
  response_headers JSONB,
  response_body TEXT,
  response_delay INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mock_suite ON api_mocks(suite_id);
CREATE INDEX IF NOT EXISTS idx_mock_enabled ON api_mocks(enabled);

CREATE TABLE IF NOT EXISTS api_performance_benchmarks (
  id SERIAL PRIMARY KEY,
  test_case_id INTEGER NOT NULL REFERENCES api_test_cases(id) ON DELETE CASCADE,
  run_id VARCHAR(255) NOT NULL,
  response_time INTEGER NOT NULL,
  status_code INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  error_msg TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_benchmark_test ON api_performance_benchmarks(test_case_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_timestamp ON api_performance_benchmarks(timestamp);

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

-- Function for snake_case updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_snake()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply snake_case updated_at triggers
DROP TRIGGER IF EXISTS update_test_data_repo_updated_at ON test_data_repositories;
CREATE TRIGGER update_test_data_repo_updated_at BEFORE UPDATE ON test_data_repositories FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_cleanup_rule_updated_at ON data_cleanup_rules;
CREATE TRIGGER update_cleanup_rule_updated_at BEFORE UPDATE ON data_cleanup_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_synthetic_template_updated_at ON synthetic_data_templates;
CREATE TRIGGER update_synthetic_template_updated_at BEFORE UPDATE ON synthetic_data_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_api_suite_updated_at ON api_test_suites;
CREATE TRIGGER update_api_suite_updated_at BEFORE UPDATE ON api_test_suites FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_api_test_updated_at ON api_test_cases;
CREATE TRIGGER update_api_test_updated_at BEFORE UPDATE ON api_test_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_api_contract_updated_at ON api_contracts;
CREATE TRIGGER update_api_contract_updated_at BEFORE UPDATE ON api_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_api_mock_updated_at ON api_mocks;
CREATE TRIGGER update_api_mock_updated_at BEFORE UPDATE ON api_mocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

-- Apply triggers to ExternalAPIConfig and APICallLog
DROP TRIGGER IF EXISTS update_external_api_config_updated_at ON "ExternalAPIConfig";
CREATE TRIGGER update_external_api_config_updated_at BEFORE UPDATE ON "ExternalAPIConfig" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_call_log_updated_at ON "APICallLog";
CREATE TRIGGER update_api_call_log_updated_at BEFORE UPDATE ON "APICallLog" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply triggers to TestDataset
DROP TRIGGER IF EXISTS update_test_dataset_updated_at ON "TestDataset";
CREATE TRIGGER update_test_dataset_updated_at BEFORE UPDATE ON "TestDataset" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Script" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TestRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TestStep" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExtensionScript" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Variable" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Breakpoint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TestSuite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TestData" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExternalAPIConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "APICallLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TestDataset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_data_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_data_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_cleanup_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE synthetic_data_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_mocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_performance_benchmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for user-based access
CREATE POLICY "Users can view own data" ON "User" FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own data" ON "User" FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Projects are user-specific" ON "Project" FOR ALL USING ("userId" = auth.uid()::text);
CREATE POLICY "Scripts are user-specific" ON "Script" FOR ALL USING ("userId" = auth.uid()::text);
CREATE POLICY "TestRuns are user-specific" ON "TestRun" FOR ALL USING ("userId" = auth.uid()::text);
CREATE POLICY "TestSteps are user-specific" ON "TestStep" FOR ALL USING ("testRunId" IN (SELECT id FROM "TestRun" WHERE "userId" = auth.uid()::text));
CREATE POLICY "ExtensionScripts are user-specific" ON "ExtensionScript" FOR ALL USING ("userId" = auth.uid()::text);
CREATE POLICY "Variables are user-specific" ON "Variable" FOR ALL USING ("scriptId" IN (SELECT id FROM "Script" WHERE "userId" = auth.uid()::text));
CREATE POLICY "Breakpoints are user-specific" ON "Breakpoint" FOR ALL USING ("scriptId" IN (SELECT id FROM "Script" WHERE "userId" = auth.uid()::text));
CREATE POLICY "TestSuites are user-specific" ON "TestSuite" FOR ALL USING ("userId" = auth.uid()::text);
CREATE POLICY "TestData are user-specific" ON "TestData" FOR ALL USING ("suiteId" IN (SELECT id FROM "TestSuite" WHERE "userId" = auth.uid()::text));
CREATE POLICY "ApiRequests are user-specific" ON "ApiRequest" FOR ALL USING ("userId" = auth.uid()::text);
CREATE POLICY "ExternalAPIConfigs are user-specific" ON "ExternalAPIConfig" FOR ALL USING ("userId" = auth.uid()::text);
CREATE POLICY "APICallLogs are user-specific" ON "APICallLog" FOR ALL USING ("userId" = auth.uid()::text);
CREATE POLICY "TestDatasets are user-specific" ON "TestDataset" FOR ALL USING ("userId" = auth.uid()::text);

-- Policies for test data repository tables
CREATE POLICY "TestDataRepos are user-specific" ON test_data_repositories FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "TestDataSnapshots are user-specific" ON test_data_snapshots FOR ALL USING ("created_by" = auth.uid()::text);
CREATE POLICY "DataCleanupRules are user-specific" ON data_cleanup_rules FOR ALL USING (repository_id IN (SELECT id FROM test_data_repositories WHERE user_id = auth.uid()::text));
CREATE POLICY "SyntheticTemplates are user-specific" ON synthetic_data_templates FOR ALL USING (repository_id IN (SELECT id FROM test_data_repositories WHERE user_id = auth.uid()::text));

-- Policies for API testing tables
CREATE POLICY "ApiTestSuites are user-specific" ON api_test_suites FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "ApiTestCases are user-specific" ON api_test_cases FOR ALL USING (suite_id IN (SELECT id FROM api_test_suites WHERE user_id = auth.uid()::text));
CREATE POLICY "ApiContracts are user-specific" ON api_contracts FOR ALL USING (suite_id IN (SELECT id FROM api_test_suites WHERE user_id = auth.uid()::text));
CREATE POLICY "ApiMocks are user-specific" ON api_mocks FOR ALL USING (suite_id IN (SELECT id FROM api_test_suites WHERE user_id = auth.uid()::text));
CREATE POLICY "ApiPerformanceBenchmarks are user-specific" ON api_performance_benchmarks FOR ALL USING (test_case_id IN (SELECT id FROM api_test_cases WHERE suite_id IN (SELECT id FROM api_test_suites WHERE user_id = auth.uid()::text)));

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

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

-- Check RLS policies
-- SELECT 
--     schemaname,
--     tablename,
--     policyname,
--     cmd,
--     qual
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================