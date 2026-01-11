-- Add date_applied column to jobs table
-- Migration to add the date_applied field for tracking when applications were submitted

ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS date_applied TIMESTAMPTZ;

-- Add index for efficient queries by date applied
CREATE INDEX IF NOT EXISTS idx_jobs_date_applied ON jobs(date_applied DESC);

-- Add comment
COMMENT ON COLUMN jobs.date_applied IS 'Date when the application was submitted';
