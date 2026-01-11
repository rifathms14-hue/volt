-- Fix RLS Policy for Jobs Table
-- Run this in Supabase SQL Editor if jobs are not being inserted

-- First, drop any existing policies that might conflict
DROP POLICY IF EXISTS "Allow all operations" ON jobs;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON jobs;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON jobs;
DROP POLICY IF EXISTS "Enable read for anonymous users" ON jobs;
DROP POLICY IF EXISTS "Enable update for anonymous users" ON jobs;
DROP POLICY IF EXISTS "Enable delete for anonymous users" ON jobs;

-- Create a single comprehensive policy that allows all operations for everyone
-- This is permissive for development/testing purposes
CREATE POLICY "Allow all operations"
  ON jobs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'jobs';

-- Test insert (optional - uncomment to test)
-- INSERT INTO jobs (company_name, job_title, status, priority)
-- VALUES ('Test Company', 'Test Job', 'discovered', 'medium');
