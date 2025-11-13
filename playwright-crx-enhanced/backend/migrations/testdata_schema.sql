-- Test Data Management Tables

-- Create TestDataset table for storing generated test data
CREATE TABLE IF NOT EXISTS "TestDataset" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    "dataType" VARCHAR(200) NOT NULL,
    records JSONB NOT NULL DEFAULT '[]',
    schema JSONB,
    "userId" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_testdataset_userid ON "TestDataset"("userId");
CREATE INDEX IF NOT EXISTS idx_testdataset_datatype ON "TestDataset"("dataType");
CREATE INDEX IF NOT EXISTS idx_testdataset_createdat ON "TestDataset"("createdAt");

-- Create trigger to auto-update updatedAt
CREATE OR REPLACE FUNCTION update_testdataset_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER testdataset_updated_at_trigger
    BEFORE UPDATE ON "TestDataset"
    FOR EACH ROW
    EXECUTE FUNCTION update_testdataset_updated_at();

-- Create ExternalAPIConfig table for backend integrations
CREATE TABLE IF NOT EXISTS "ExternalAPIConfig" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    "apiType" VARCHAR(200) NOT NULL,
    endpoint VARCHAR(200) NOT NULL,
    method VARCHAR(200) NOT NULL DEFAULT 'POST',
    headers JSONB,
    "authType" VARCHAR(200),
    "authConfig" JSONB,
    "requestTemplate" JSONB,
    "responseMapping" JSONB,
    "userId" VARCHAR(200) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- =====================================================
-- TestSuite and TestData tables for UI persistence
-- =====================================================

CREATE TABLE IF NOT EXISTS "TestSuite" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    "userId" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "TestSuite_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "TestSuite_userId_idx" ON "TestSuite"("userId");

CREATE TABLE IF NOT EXISTS "TestData" (
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

CREATE INDEX IF NOT EXISTS "TestData_suiteId_idx" ON "TestData"("suiteId");
CREATE INDEX IF NOT EXISTS "TestData_environment_idx" ON "TestData"(environment);
CREATE INDEX IF NOT EXISTS "TestData_type_idx" ON "TestData"(type);

CREATE INDEX IF NOT EXISTS idx_externalapiconfig_userid ON "ExternalAPIConfig"("userId");
CREATE INDEX IF NOT EXISTS idx_externalapiconfig_apitype ON "ExternalAPIConfig"("apiType");

-- Create trigger for ExternalAPIConfig
CREATE TRIGGER externalapiconfig_updated_at_trigger
    BEFORE UPDATE ON "ExternalAPIConfig"
    FOR EACH ROW
    EXECUTE FUNCTION update_testdataset_updated_at();

-- Create APICallLog table for tracking external API calls
CREATE TABLE IF NOT EXISTS "APICallLog" (
    id VARCHAR(200) PRIMARY KEY,
    "configId" VARCHAR(200) NOT NULL,
    "userId" VARCHAR(200) NOT NULL,
    endpoint VARCHAR(200) NOT NULL,
    method VARCHAR(200) NOT NULL,
    "requestBody" JSONB,
    "responseBody" JSONB,
    "statusCode" INTEGER,
    duration INTEGER,
    success BOOLEAN NOT NULL DEFAULT false,
    error TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("configId") REFERENCES "ExternalAPIConfig"(id) ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_apicalllog_configid ON "APICallLog"("configId");
CREATE INDEX IF NOT EXISTS idx_apicalllog_userid ON "APICallLog"("userId");
CREATE INDEX IF NOT EXISTS idx_apicalllog_createdat ON "APICallLog"("createdAt");
