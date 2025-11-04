-- Add description column to rewards table
ALTER TABLE rewards
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- Update existing rewards to have empty description
UPDATE rewards
SET description = ''
WHERE description IS NULL;
