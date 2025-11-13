-- Migration: Add reason column to SelfHealingLocator table
-- Description: Adds a reason field to track why a locator failed

-- Add reason column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'SelfHealingLocator' 
        AND column_name = 'reason'
    ) THEN
        ALTER TABLE "SelfHealingLocator" 
        ADD COLUMN reason TEXT;
        
        RAISE NOTICE 'Column "reason" added to SelfHealingLocator table';
    ELSE
        RAISE NOTICE 'Column "reason" already exists in SelfHealingLocator table';
    END IF;
END $$;

-- Update existing records with default reasons based on locator patterns
UPDATE "SelfHealingLocator"
SET reason = CASE
    WHEN "brokenLocator" ~ '\d{6,}' THEN 'Contains long numeric ID (likely dynamic)'
    WHEN "brokenLocator" ~ '^\.(?:css|sc|jss)-\w+' THEN 'CSS-in-JS class (changes on build)'
    WHEN "brokenLocator" ~* 'timestamp|uid|uuid|random' THEN 'Contains dynamic identifier'
    WHEN "brokenLocator" ~ '\[\d+\]' THEN 'Uses array index (fragile)'
    ELSE 'Locator stability issue detected'
END
WHERE reason IS NULL;

-- Verify the migration
SELECT 
    COUNT(*) as total_records,
    COUNT(reason) as records_with_reason
FROM "SelfHealingLocator";
