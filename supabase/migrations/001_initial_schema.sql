-- HunterOS Database Schema
-- Initial migration for jobs table and related enums

-- Create job status enum type
CREATE TYPE job_status AS ENUM (
  'discovered',
  'applied',
  'screening',
  'technical',
  'final_round',
  'offer',
  'rejected'
);

-- Create job priority enum type
CREATE TYPE job_priority AS ENUM (
  'low',
  'medium',
  'high',
  'desperate'
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  status job_status NOT NULL DEFAULT 'discovered',
  priority job_priority NOT NULL DEFAULT 'medium',
  application_link TEXT,
  salary_range TEXT,
  notes TEXT,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_last_activity ON jobs(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Create a function to automatically update last_activity_at on row updates
CREATE OR REPLACE FUNCTION update_last_activity_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_activity_at whenever a job is updated
CREATE TRIGGER trigger_update_last_activity_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity_at();

-- Enable Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (in case migration is run multiple times)
DROP POLICY IF EXISTS "Allow all operations" ON jobs;

-- For now, create a policy that allows all operations (including anonymous access)
-- This is permissive for development/testing purposes
-- TODO: Replace this with proper user-based RLS policies when auth is implemented
CREATE POLICY "Allow all operations"
  ON jobs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add helpful comments
COMMENT ON TABLE jobs IS 'Stores job application tracking information';
COMMENT ON COLUMN jobs.status IS 'Current stage of the job application process';
COMMENT ON COLUMN jobs.priority IS 'Urgency/importance level of the job application';
COMMENT ON COLUMN jobs.last_activity_at IS 'Automatically updated timestamp for sorting by relevancy';
