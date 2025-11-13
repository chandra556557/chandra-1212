-- Remove Self-Healing and AI Healing Features
-- This migration removes all healing-related tables and columns

BEGIN;

-- Drop SelfHealingLocator table
DROP TABLE IF EXISTS "SelfHealingLocator" CASCADE;

-- Drop LocatorStrategy table
DROP TABLE IF EXISTS "LocatorStrategy" CASCADE;

-- Remove healing-related columns from Script table
ALTER TABLE "Script" 
  DROP COLUMN IF EXISTS "selfHealingEnabled" CASCADE;

-- Remove healing-related columns from TestStep table  
ALTER TABLE "TestStep"
  DROP COLUMN IF EXISTS "originalLocator" CASCADE,
  DROP COLUMN IF EXISTS "healedLocator" CASCADE,
  DROP COLUMN IF EXISTS "wasHealed" CASCADE;

COMMIT;

-- Verification queries (run these to verify removal)
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('SelfHealingLocator', 'LocatorStrategy');
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'Script' AND column_name = 'selfHealingEnabled';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'TestStep' AND column_name IN ('originalLocator', 'healedLocator', 'wasHealed');
