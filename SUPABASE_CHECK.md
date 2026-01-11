# Supabase Setup Status Check

## ✅ What's Already Configured

1. **Environment Variables** - `.env.local` file exists with:
   - `NEXT_PUBLIC_SUPABASE_URL` ✅
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅

2. **Dependencies** - All required packages installed:
   - `@supabase/supabase-js` ✅
   - `@supabase/ssr` ✅

3. **Code Setup** - Server and client files are configured:
   - `lib/supabase/server.ts` ✅ (improved error handling)
   - `lib/supabase/client.ts` ✅
   - `lib/supabase-queries.ts` ✅

4. **Migration File** - Schema migration ready:
   - `supabase/migrations/001_initial_schema.sql` ✅

## ⚠️ What Needs to Be Verified

### 1. Database Migration Status
**Action Required**: Check if the migration has been run in your Supabase project.

**How to Check:**
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Table Editor**
4. Check if the `jobs` table exists with these columns:
   - `id` (uuid)
   - `created_at` (timestamptz)
   - `company_name` (text)
   - `job_title` (text)
   - `status` (job_status enum)
   - `priority` (job_priority enum)
   - `application_link` (text, nullable)
   - `salary_range` (text, nullable)
   - `notes` (text, nullable)
   - `last_activity_at` (timestamptz)

**If the table doesn't exist**, run the migration:
1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)
5. You should see "Success. No rows returned"

### 2. Row Level Security (RLS) Policies
**Current Issue**: The migration creates a policy named "Allow all operations for authenticated users" but it actually allows ALL operations (including anonymous).

**Current Policy Status**: Should work for anonymous access, but verify:
1. Go to **Authentication** → **Policies** in Supabase dashboard
2. Select the `jobs` table
3. Verify a policy exists with `USING (true)` and `WITH CHECK (true)`

**If no policy exists or you get permission errors**, you can run this SQL:

```sql
-- Allow all operations (including anonymous access)
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON jobs;
CREATE POLICY "Allow all operations" ON jobs FOR ALL USING (true) WITH CHECK (true);
```

### 3. Test the Connection

**Option A: Test via Supabase Dashboard**
1. Go to **Table Editor** → `jobs` table
2. Click **Insert row**
3. Fill in:
   - `company_name`: "Test Company"
   - `job_title`: "Test Position"
   - `status`: "discovered"
   - `priority`: "medium"
4. Click **Save**
5. If successful, the connection works!

**Option B: Test via Your App**
1. Make sure your dev server is running: `npm run dev`
2. Check the browser console for any errors
3. The app should load without Supabase errors
4. Try adding a job via the UI (if that component exists)

## 🔧 Troubleshooting Common Issues

### Issue: "relation 'jobs' does not exist"
**Solution**: The migration hasn't been run. Follow step 1 above.

### Issue: "new row violates row-level security policy"
**Solution**: 
1. Check RLS policies (step 2 above)
2. Ensure the policy allows anonymous access
3. You can temporarily disable RLS for testing:
   ```sql
   ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
   ```
   (⚠️ Re-enable it after testing!)

### Issue: "Failed to fetch jobs" in browser console
**Solution**: 
1. Verify environment variables are loaded:
   - Restart your dev server after creating/updating `.env.local`
   - Check that variables start with `NEXT_PUBLIC_`
2. Verify your Supabase URL and key are correct
3. Check browser network tab for the actual error response

### Issue: "Invalid API key"
**Solution**: 
- Make sure you're using the **anon/public** key (not service_role key)
- Go to **Settings** → **API** in Supabase dashboard
- Copy the "anon public" key (not the "service_role" key)

## 📝 Next Steps

Once everything is verified:

1. ✅ Test creating a job via Supabase dashboard
2. ✅ Test fetching jobs in your app
3. ✅ Test creating a job via your app's UI
4. ✅ Implement proper authentication (optional, for production)

## 🔗 Useful Links

- Your Supabase Dashboard: https://supabase.com/dashboard
- Supabase Documentation: https://supabase.com/docs
- Migration File Location: `supabase/migrations/001_initial_schema.sql`
