-- =====================================================
-- Incremental Database Schema Migration - 2025
-- Description: Safe migration that only creates missing tables
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- EXTERNAL API INTEGRATION TABLES
-- =====================================================

-- ExternalAPIConfig table (if not exists)
CREATE TABLE IF NOT EXISTS "ExternalAPIConfig" (
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

-- APICallLog table (if not exists)
CREATE TABLE IF NOT EXISTS "APICallLog" (
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

-- TestDataset table (if not exists)
CREATE TABLE IF NOT EXISTS "TestDataset" (
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

-- test_data_repositories table (if not exists)
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

-- test_data_snapshots table (if not exists)
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

-- data_cleanup_rules table (if not exists)
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

-- synthetic_data_templates table (if not exists)
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

-- api_test_suites table (if not exists)
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

-- api_test_cases table (if not exists)
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

-- api_contracts table (if not exists)
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

-- api_mocks table (if not exists)
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

-- api_performance_benchmarks table (if not exists)
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

-- Function for snake_case updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_snake()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updatedAt triggers to existing tables
DROP TRIGGER IF EXISTS update_external_api_config_updated_at ON "ExternalAPIConfig";
CREATE TRIGGER update_external_api_config_updated_at BEFORE UPDATE ON "ExternalAPIConfig" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_call_log_updated_at ON "APICallLog";
CREATE TRIGGER update_api_call_log_updated_at BEFORE UPDATE ON "APICallLog" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_test_dataset_updated_at ON "TestDataset";
CREATE TRIGGER update_test_dataset_updated_at BEFORE UPDATE ON "TestDataset" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply snake_case updated_at triggers to repository and API testing tables
DROP TRIGGER IF EXISTS update_test_data_repo_updated_at ON test_data_repositories;
CREATE TRIGGER update_test_data_repo_updated_at BEFORE UPDATE ON test_data_repositories FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_test_data_snapshots_updated_at ON test_data_snapshots;
-- No updated_at column, skip trigger

DROP TRIGGER IF EXISTS update_data_cleanup_rules_updated_at ON data_cleanup_rules;
CREATE TRIGGER update_data_cleanup_rules_updated_at BEFORE UPDATE ON data_cleanup_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_synthetic_data_templates_updated_at ON synthetic_data_templates;
CREATE TRIGGER update_synthetic_data_templates_updated_at BEFORE UPDATE ON synthetic_data_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_api_suite_updated_at ON api_test_suites;
CREATE TRIGGER update_api_suite_updated_at BEFORE UPDATE ON api_test_suites FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_api_test_updated_at ON api_test_cases;
CREATE TRIGGER update_api_test_updated_at BEFORE UPDATE ON api_test_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_api_contract_updated_at ON api_contracts;
CREATE TRIGGER update_api_contract_updated_at BEFORE UPDATE ON api_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_api_mock_updated_at ON api_mocks;
CREATE TRIGGER update_api_mock_updated_at BEFORE UPDATE ON api_mocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_api_performance_benchmarks_updated_at ON api_performance_benchmarks;
-- No updated_at column, skip trigger

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
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

-- Create user-specific policies
CREATE POLICY IF NOT EXISTS "ExternalAPIConfigs are user-specific" ON "ExternalAPIConfig" FOR ALL USING ("userId" = auth.uid()::text);
CREATE POLICY IF NOT EXISTS "APICallLogs are user-specific" ON "APICallLog" FOR ALL USING ("userId" = auth.uid()::text);
CREATE POLICY IF NOT EXISTS "TestDatasets are user-specific" ON "TestDataset" FOR ALL USING ("userId" = auth.uid()::text);
CREATE POLICY IF NOT EXISTS "TestDataRepos are user-specific" ON test_data_repositories FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY IF NOT EXISTS "TestDataSnapshots are user-specific" ON test_data_snapshots FOR ALL USING ("created_by" = auth.uid()::text);
CREATE POLICY IF NOT EXISTS "DataCleanupRules are user-specific" ON data_cleanup_rules FOR ALL USING (repository_id IN (SELECT id FROM test_data_repositories WHERE user_id = auth.uid()::text));
CREATE POLICY IF NOT EXISTS "SyntheticTemplates are user-specific" ON synthetic_data_templates FOR ALL USING (repository_id IN (SELECT id FROM test_data_repositories WHERE user_id = auth.uid()::text));
CREATE POLICY IF NOT EXISTS "ApiTestSuites are user-specific" ON api_test_suites FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY IF NOT EXISTS "ApiTestCases are user-specific" ON api_test_cases FOR ALL USING (suite_id IN (SELECT id FROM api_test_suites WHERE user_id = auth.uid()::text));
CREATE POLICY IF NOT EXISTS "ApiContracts are user-specific" ON api_contracts FOR ALL USING (suite_id IN (SELECT id FROM api_test_suites WHERE user_id = auth.uid()::text));
CREATE POLICY IF NOT EXISTS "ApiMocks are user-specific" ON api_mocks FOR ALL USING (suite_id IN (SELECT id FROM api_test_suites WHERE user_id = auth.uid()::text));
CREATE POLICY IF NOT EXISTS "ApiPerformanceBenchmarks are user-specific" ON api_performance_benchmarks FOR ALL USING (test_case_id IN (SELECT id FROM api_test_cases WHERE suite_id IN (SELECT id FROM api_test_suites WHERE user_id = auth.uid()::text)));

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================

-- Return summary of migration
SELECT 
    COUNT(*) as total_tables,
    COUNT(CASE WHEN table_name LIKE 'api_%' THEN 1 END) as api_testing_tables,
    COUNT(CASE WHEN table_name LIKE 'test_data_%' OR table_name LIKE 'data_cleanup_%' OR table_name LIKE 'synthetic_%' THEN 1 END) as test_data_tables,
    COUNT(CASE WHEN table_name IN ('ExternalAPIConfig', 'APICallLog', 'TestDataset') THEN 1 END) as external_api_tables,
    COUNT(CASE WHEN table_name IN ('User', 'Project', 'Script', 'TestRun', 'TestStep', 'ExtensionScript', 'Variable', 'Breakpoint', 'TestSuite', 'TestData', 'ApiRequest') THEN 1 END) as core_tables,
    COUNT(CASE WHEN table_name IN ('RefreshToken') THEN 1 END) as auth_tables
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';