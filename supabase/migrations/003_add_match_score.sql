-- Add match score and resume file path columns to jobs table
-- Migration: 003_add_match_score.sql

-- Add match_score column (1-10 integer, nullable)
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS match_score INTEGER CHECK (match_score >= 1 AND match_score <= 10);

-- Add resume_file_path column to store Supabase Storage path
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS resume_file_path TEXT;

-- Add index on match_score for efficient sorting/filtering
CREATE INDEX IF NOT EXISTS idx_jobs_match_score ON jobs(match_score DESC);

-- Add helpful comments
COMMENT ON COLUMN jobs.match_score IS 'AI-generated relevancy score (1-10) based on resume and job description match';
COMMENT ON COLUMN jobs.resume_file_path IS 'Path to resume file in Supabase Storage (e.g., resumes/{job_id}/resume.pdf)';
