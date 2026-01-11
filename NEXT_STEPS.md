# Next Steps for HunterOS Development

## ✅ Completed (Steps 1 & 2)

### Step 1: Next.js Boilerplate ✅
- ✅ Next.js 14+ with App Router
- ✅ TypeScript configured
- ✅ Tailwind CSS configured
- ✅ Project structure created

### Step 2: Shadcn UI Setup ✅
- ✅ Shadcn UI initialized
- ✅ Base components installed:
  - Button
  - Input
  - Label
  - Sheet (for Quick-Add slide-over)
  - Badge (with custom "desperate" variant)
  - Card
  - Separator
- ✅ Tailwind theme configured with custom colors (#CFFF04, #09090B, #FFFFFF)
- ✅ Custom glow-pulse animation for desperate priority jobs

## 🎨 Design System Status

The brutalist minimalist design system is configured:

- **70% White Background**: `#FFFFFF` 
- **20% Dark Structure**: `#09090B` (borders, text)
- **10% Electric Lime Green**: `#CFFF04` (primary actions, desperate badges)
- **Typography**: Inter font loaded and configured
- **Custom Animation**: `glow-pulse` for desperate priority jobs

## 📋 Recommended Next Steps

### Step 3: Supabase Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create the jobs table with the following schema:

```sql
-- Create enum types
CREATE TYPE job_status AS ENUM (
  'discovered',
  'applied',
  'screening',
  'technical',
  'final_round',
  'offer',
  'rejected'
);

CREATE TYPE job_priority AS ENUM (
  'low',
  'medium',
  'high',
  'desperate'
);

-- Create jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  status job_status NOT NULL DEFAULT 'discovered',
  priority job_priority NOT NULL DEFAULT 'medium',
  application_link TEXT,
  salary_range TEXT,
  notes TEXT,
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_priority ON jobs(priority);
CREATE INDEX idx_jobs_last_activity ON jobs(last_activity_at DESC);
```

3. Set up environment variables (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Create Supabase client utility file (`lib/supabase.ts`)

### Step 4: Type Definitions
Create TypeScript types matching the database schema (`types/job.ts`)

### Step 5: Core Features Implementation

#### A. Kanban Board View
- Implement drag-and-drop using `@hello-pangea/dnd` or `dnd-kit`
- Create columns for each job status
- Card design with thin black borders (#09090B)
- Desperate priority cards with glowing lime green border

#### B. Quick-Add Slide-over
- Use the Sheet component already installed
- Form with essential fields (company, title, link, priority)
- Submit handler to create job in Supabase

#### C. Job Detail Page
- Dynamic route: `/app/jobs/[id]/page.tsx`
- Full job information display
- Edit capabilities
- Notes section (rich text if possible)

### Step 6: State Management
- Set up Zustand store for UI state (e.g., sidebar open/closed, filters)
- Consider React Query or SWR for server state management

### Step 7: Additional Components (As Needed)
Add more Shadcn components when required:
```bash
npx shadcn-ui@latest add textarea    # For notes
npx shadcn-ui@latest add select      # For status/priority dropdowns
npx shadcn-ui@latest add dialog      # For delete confirmations
npx shadcn-ui@latest add dropdown-menu  # For job actions menu
```

## 🚀 Getting Started Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📁 Project Structure Overview

```
hunteros/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home/Kanban board
│   ├── jobs/
│   │   └── [id]/
│   │       └── page.tsx    # Job detail page (to be created)
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Shadcn components
│   ├── kanban/             # Kanban board components (to be created)
│   ├── job-card.tsx        # Job card component (to be created)
│   └── quick-add-sheet.tsx # Quick-add form (to be created)
├── lib/
│   ├── utils.ts            # Utility functions
│   └── supabase.ts         # Supabase client (to be created)
├── types/
│   └── job.ts              # TypeScript types (to be created)
└── stores/
    └── ui-store.ts         # Zustand store (to be created)
```

## 🎯 Key Design Principles to Maintain

1. **Brutalist Minimalism**: Lots of white space, sharp 1px black borders
2. **Color Discipline**: Use Electric Lime Green (#CFFF04) ONLY for:
   - Primary action buttons
   - Active tab indicators
   - Desperate priority badges/borders
   - Subtle header gradient (future)
3. **Typography**: Inter font throughout, clean and readable
4. **Animations**: Smooth transitions with Framer Motion, pulsing glow for desperate jobs

## 💡 Tips

- Use Tailwind's arbitrary values when needed: `border-[#09090B]`
- The `cn()` utility in `lib/utils.ts` helps merge Tailwind classes
- Shadcn components are already styled with your design system colors
- Test the glow-pulse animation on desperate badges early to ensure it looks good

Good luck building HunterOS! 🚀

