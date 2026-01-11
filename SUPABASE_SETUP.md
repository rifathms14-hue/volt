# Supabase Setup Guide

This guide will help you set up Supabase for HunterOS.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: `hunteros` (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the region closest to you
4. Wait for the project to be provisioned (takes ~2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (found under "Project URL")
   - **anon public** key (found under "Project API keys" → "anon public")

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project (same directory as `package.json`)

2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://gavvyqnvgvltcrptbzpz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdnZ5cW52Z3ZsdGNycHRienB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNjgwMTIsImV4cCI6MjA4MzY0NDAxMn0.uLpAIBSET2GFwsXf2IsOhC-nQ0S6Y9_LY4fIzUyYJOY
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**✅ Verify Setup:**
To check if your `.env.local` file is properly configured, run:
```bash
# On Windows (PowerShell)
if (Test-Path .env.local) { Get-Content .env.local | Select-Object -First 2 }

# On macOS/Linux
cat .env.local | head -2
```

You should see both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your actual values.

⚠️ **Important**: 
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Never share your anon key publicly (though it's safe to use in client-side code)
- The `NEXT_PUBLIC_` prefix makes these variables available in the browser

## Step 4: Run Database Migration

You have two options to set up the database schema:

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)
7. Verify success - you should see "Success. No rows returned"

### Option B: Using Supabase CLI (Advanced)

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Step 5: Verify the Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see a `jobs` table with the following columns:
   - `id` (uuid, primary key)
   - `created_at` (timestamptz)
   - `company_name` (text)
   - `job_title` (text)
   - `status` (job_status enum)
   - `priority` (job_priority enum)
   - `application_link` (text, nullable)
   - `salary_range` (text, nullable)
   - `notes` (text, nullable)
   - `last_activity_at` (timestamptz)

3. Verify the types exist:
   - Go to **Database** → **Types**
   - You should see `job_status` and `job_priority` enum types

## Step 6: Test the Connection

1. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```

2. The app should start without errors (you may see a warning about missing env vars if not configured yet)

3. Try creating a test job using the Supabase dashboard:
   - Go to **Table Editor** → `jobs` table
   - Click **Insert row**
   - Fill in:
     - `company_name`: "Test Company"
     - `job_title`: "Test Position"
     - `status`: "discovered" (select from dropdown)
     - `priority`: "medium" (select from dropdown)
   - Click **Save**
   - The row should be created successfully

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Make sure `.env.local` exists in the project root
- Verify the variable names start with `NEXT_PUBLIC_`
- Restart your dev server after adding/updating `.env.local`

### Issue: "Failed to fetch jobs" error
- Check that your `NEXT_PUBLIC_SUPABASE_URL` is correct (should start with `https://`)
- Verify your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the "anon public" key (not the service_role key)
- Check that Row Level Security (RLS) policies are set up correctly (the migration creates a permissive policy)

### Issue: Database migration fails
- Check the error message in the SQL Editor
- Make sure you're running the migration in the correct database
- If types already exist, you may need to modify the migration to use `CREATE TYPE IF NOT EXISTS`

### Issue: Can't insert rows (RLS policy error)
- Go to **Authentication** → **Policies** in Supabase
- Verify the policy "Allow all operations for authenticated users" exists on the `jobs` table
- If not, you can manually create it or re-run the migration

## Security Notes

⚠️ **Important Security Considerations:**

1. **Row Level Security (RLS)**: Currently, the migration creates a permissive policy that allows all operations. For production:
   - Implement proper user authentication
   - Replace the permissive policy with user-specific policies
   - Consider using Supabase Auth

2. **API Keys**: 
   - The `anon` key is safe to use in client-side code
   - Never expose the `service_role` key in client-side code
   - Consider using environment variables for different environments (dev/staging/prod)

3. **Database Backups**:
   - Enable automatic backups in Supabase dashboard
   - Regularly export your database schema and data

## Next Steps

Once Supabase is set up and working:

1. ✅ Test creating a job via Supabase dashboard
2. ✅ Implement the Kanban board view with data fetching
3. ✅ Build the Quick-Add slide-over form
4. ✅ Create job detail pages

For more information, see the [Supabase Documentation](https://supabase.com/docs).
