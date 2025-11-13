-- Migration: Create Self-Healing Tables
-- Description: Creates SelfHealingLocator and LocatorStrategy tables

-- Create SelfHealingLocator table
CREATE TABLE IF NOT EXISTS "SelfHealingLocator" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "scriptId" TEXT NOT NULL,
    "brokenLocator" TEXT NOT NULL,
    "brokenType" TEXT NOT NULL,
    "validLocator" TEXT NOT NULL,
    "validType" TEXT NOT NULL,
    "elementTag" TEXT,
    "elementText" TEXT,
    confidence FLOAT DEFAULT 0.75,
    status TEXT DEFAULT 'pending',
    reason TEXT,
    "approvedAt" TIMESTAMP,
    "timesUsed" INTEGER DEFAULT 0,
    "lastUsedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT now(),
    "updatedAt" TIMESTAMP DEFAULT now()
);

-- Create indexes for SelfHealingLocator
CREATE UNIQUE INDEX IF NOT EXISTS idx_self_healing_unique 
    ON "SelfHealingLocator"("scriptId", "brokenLocator", "validLocator");
CREATE INDEX IF NOT EXISTS idx_self_healing_script ON "SelfHealingLocator"("scriptId");
CREATE INDEX IF NOT EXISTS idx_self_healing_status ON "SelfHealingLocator"(status);
CREATE INDEX IF NOT EXISTS idx_self_healing_broken ON "SelfHealingLocator"("brokenLocator");

-- Create LocatorStrategy table
CREATE TABLE IF NOT EXISTS "LocatorStrategy" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    priority INTEGER NOT NULL,
    strategy TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT now(),
    "updatedAt" TIMESTAMP DEFAULT now()
);

-- Create indexes for LocatorStrategy
CREATE UNIQUE INDEX IF NOT EXISTS idx_locator_strategy_unique 
    ON "LocatorStrategy"("userId", strategy);
CREATE INDEX IF NOT EXISTS idx_locator_strategy_user_priority 
    ON "LocatorStrategy"("userId", priority);

-- Verify tables created
DO $$
BEGIN
    RAISE NOTICE '✅ Tables created successfully';
    RAISE NOTICE 'SelfHealingLocator: % rows', (SELECT COUNT(*) FROM "SelfHealingLocator");
    RAISE NOTICE 'LocatorStrategy: % rows', (SELECT COUNT(*) FROM "LocatorStrategy");
END $$;
