-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Script" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'typescript',
    "code" TEXT NOT NULL,
    "projectId" TEXT,
    "userId" TEXT NOT NULL,
    "browserType" TEXT NOT NULL DEFAULT 'chromium',
    "viewport" JSONB,
    "testIdAttribute" TEXT NOT NULL DEFAULT 'data-testid',
    "selfHealingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Script_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestRun" (
    "id" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "duration" INTEGER,
    "errorMsg" TEXT,
    "traceUrl" TEXT,
    "screenshotUrls" JSONB,
    "videoUrl" TEXT,
    "environment" TEXT,
    "browser" TEXT NOT NULL DEFAULT 'chromium',
    "viewport" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestStep" (
    "id" TEXT NOT NULL,
    "testRunId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "selector" TEXT,
    "value" TEXT,
    "status" TEXT NOT NULL,
    "duration" INTEGER,
    "errorMsg" TEXT,
    "originalLocator" TEXT,
    "healedLocator" TEXT,
    "wasHealed" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelfHealingLocator" (
    "id" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,
    "brokenLocator" TEXT NOT NULL,
    "brokenType" TEXT NOT NULL,
    "validLocator" TEXT NOT NULL,
    "validType" TEXT NOT NULL,
    "elementTag" TEXT,
    "elementText" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedAt" TIMESTAMP(3),
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelfHealingLocator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocatorStrategy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "strategy" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocatorStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestDataFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT,
    "scriptId" TEXT,
    "userId" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "columnNames" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestDataFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestDataRow" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestDataRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtensionScript" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "scriptType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtensionScript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variable" (
    "id" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Variable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Breakpoint" (
    "id" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "condition" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Breakpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "Script_userId_idx" ON "Script"("userId");

-- CreateIndex
CREATE INDEX "Script_projectId_idx" ON "Script"("projectId");

-- CreateIndex
CREATE INDEX "Script_createdAt_idx" ON "Script"("createdAt");

-- CreateIndex
CREATE INDEX "TestRun_scriptId_idx" ON "TestRun"("scriptId");

-- CreateIndex
CREATE INDEX "TestRun_userId_idx" ON "TestRun"("userId");

-- CreateIndex
CREATE INDEX "TestRun_status_idx" ON "TestRun"("status");

-- CreateIndex
CREATE INDEX "TestRun_startedAt_idx" ON "TestRun"("startedAt");

-- CreateIndex
CREATE INDEX "TestStep_testRunId_idx" ON "TestStep"("testRunId");

-- CreateIndex
CREATE INDEX "TestStep_stepNumber_idx" ON "TestStep"("stepNumber");

-- CreateIndex
CREATE INDEX "SelfHealingLocator_scriptId_idx" ON "SelfHealingLocator"("scriptId");

-- CreateIndex
CREATE INDEX "SelfHealingLocator_status_idx" ON "SelfHealingLocator"("status");

-- CreateIndex
CREATE INDEX "SelfHealingLocator_brokenLocator_idx" ON "SelfHealingLocator"("brokenLocator");

-- CreateIndex
CREATE UNIQUE INDEX "SelfHealingLocator_scriptId_brokenLocator_validLocator_key" ON "SelfHealingLocator"("scriptId", "brokenLocator", "validLocator");

-- CreateIndex
CREATE INDEX "LocatorStrategy_userId_priority_idx" ON "LocatorStrategy"("userId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "LocatorStrategy_userId_strategy_key" ON "LocatorStrategy"("userId", "strategy");

-- CreateIndex
CREATE INDEX "TestDataFile_scriptId_idx" ON "TestDataFile"("scriptId");

-- CreateIndex
CREATE INDEX "TestDataFile_userId_idx" ON "TestDataFile"("userId");

-- CreateIndex
CREATE INDEX "TestDataRow_fileId_idx" ON "TestDataRow"("fileId");

-- CreateIndex
CREATE INDEX "TestDataRow_rowNumber_idx" ON "TestDataRow"("rowNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TestDataRow_fileId_rowNumber_key" ON "TestDataRow"("fileId", "rowNumber");

-- CreateIndex
CREATE INDEX "ExtensionScript_userId_idx" ON "ExtensionScript"("userId");

-- CreateIndex
CREATE INDEX "ExtensionScript_scriptType_idx" ON "ExtensionScript"("scriptType");

-- CreateIndex
CREATE INDEX "Variable_scriptId_idx" ON "Variable"("scriptId");

-- CreateIndex
CREATE UNIQUE INDEX "Variable_scriptId_name_key" ON "Variable"("scriptId", "name");

-- CreateIndex
CREATE INDEX "Breakpoint_scriptId_idx" ON "Breakpoint"("scriptId");

-- CreateIndex
CREATE UNIQUE INDEX "Breakpoint_scriptId_lineNumber_key" ON "Breakpoint"("scriptId", "lineNumber");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Script" ADD CONSTRAINT "Script_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Script" ADD CONSTRAINT "Script_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestRun" ADD CONSTRAINT "TestRun_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestRun" ADD CONSTRAINT "TestRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestStep" ADD CONSTRAINT "TestStep_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelfHealingLocator" ADD CONSTRAINT "SelfHealingLocator_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocatorStrategy" ADD CONSTRAINT "LocatorStrategy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestDataFile" ADD CONSTRAINT "TestDataFile_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestDataFile" ADD CONSTRAINT "TestDataFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestDataRow" ADD CONSTRAINT "TestDataRow_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "TestDataFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtensionScript" ADD CONSTRAINT "ExtensionScript_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variable" ADD CONSTRAINT "Variable_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Breakpoint" ADD CONSTRAINT "Breakpoint_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE CASCADE ON UPDATE CASCADE;
