# Fix: Jobs Not Being Added to Database

## Problem
Jobs are not being inserted into the database when using the "Add New Job" form.

## Most Likely Cause: RLS (Row Level Security) Policy Issue

The `jobs` table has Row Level Security enabled, but the policy allowing inserts might not be set up correctly.

## Solution: Fix RLS Policy

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**

### Step 2: Run the Fix Script

Copy and paste this SQL into the editor:

```sql
-- Fix RLS Policy for Jobs Table
-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Allow all operations" ON jobs;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON jobs;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON jobs;
DROP POLICY IF EXISTS "Enable read for anonymous users" ON jobs;
DROP POLICY IF EXISTS "Enable update for anonymous users" ON jobs;
DROP POLICY IF EXISTS "Enable delete for anonymous users" ON jobs;

-- Create a comprehensive policy that allows all operations for everyone
CREATE POLICY "Allow all operations"
  ON jobs
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)
5. You should see "Success. No rows returned"

### Step 3: Verify the Policy

Run this query to check if the policy exists:

```sql
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'jobs';
```

You should see a row with:
- `policyname`: "Allow all operations"
- `cmd`: "ALL" or "*"
- `roles`: "{public}" or "{anon}"

### Step 4: Test the Insert

Try inserting a test row:

```sql
INSERT INTO jobs (company_name, job_title, status, priority)
VALUES ('Test Company', 'Test Job', 'discovered', 'medium')
RETURNING *;
```

If this works, you should see the inserted row. If it fails, check the error message.

### Step 5: Test in Your App

1. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Open your app in the browser
3. Click "Add New Job"
4. Fill in the form and submit
5. Check the browser console (F12) for any error messages
6. Check the terminal where your dev server is running for server-side errors

## Alternative: Temporarily Disable RLS (NOT for Production)

⚠️ **Warning**: Only use this for testing/development!

If the policy fix doesn't work, you can temporarily disable RLS:

```sql
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
```

**Remember to re-enable it and fix the policy before deploying to production!**

To re-enable:
```sql
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- Then create the policy again (see Step 2)
```

## Check Server Logs

If the issue persists, check your Next.js server logs. The improved error logging will show:
- RLS policy errors (code 42501)
- Missing table errors (code 42P01)
- Other specific error messages

Look for console.error messages in your terminal when you try to add a job.

## Common Error Codes

- **42501**: Permission denied - RLS policy issue
- **42P01**: Table does not exist - Migration not run
- **23505**: Unique constraint violation - Usually not applicable here
- **23502**: Not null violation - Missing required field

## Still Not Working?

1. **Verify environment variables are loaded:**
   - Restart your dev server after checking `.env.local`
   - Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

2. **Check Supabase project status:**
   - Make sure your Supabase project is active (not paused)
   - Verify you're using the correct project URL

3. **Check network requests:**
   - Open browser DevTools → Network tab
   - Try adding a job
   - Look for requests to `*.supabase.co`
   - Check the response for error messages

4. **Test direct database access:**
   - Try inserting a row directly in Supabase Table Editor
   - If that works but the app doesn't, it's likely an RLS or API key issue

## Quick Fix Script

I've created a fix script at `supabase/fix_rls_policy.sql` that you can run directly in Supabase SQL Editor.
