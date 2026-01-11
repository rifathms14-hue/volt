# HunterOS Setup Guide

## Initial Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js 14+ with TypeScript
- Tailwind CSS
- Shadcn UI components
- Framer Motion
- Zustand
- Supabase client
- All Radix UI primitives

### 2. Verify Installation

After installation, you should have:
- ✅ Next.js configured with App Router
- ✅ TypeScript configured
- ✅ Tailwind CSS with custom design system colors
- ✅ Shadcn UI components (Button, Input, Label, Sheet, Badge, Card, Separator)
- ✅ Inter font loaded via Next.js font optimization

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Design System Verification

### Colors (70/20/10 Rule)
- **70% Background**: `#FFFFFF` (White) - `bg-white` or `bg-background`
- **20% Structure**: `#09090B` (Dark) - `text-foreground`, `border-border`
- **10% Accent**: `#CFFF04` (Electric Lime Green) - `bg-primary`, `text-primary`

### Usage Examples

```tsx
// Primary button (Electric Lime Green)
<Button variant="default">Add Job</Button>

// Desperate priority badge (with glow animation)
<Badge variant="desperate">DESPERATE</Badge>

// Card with thin black border
<Card className="border border-[#09090B]">
  <CardContent>...</CardContent>
</Card>
```

### Custom Animations

The `glow-pulse` animation is available for desperate priority jobs:
- Tailwind class: `animate-glow-pulse`
- Automatically applied to `Badge` with `variant="desperate"`

## Next Steps

1. **Set up Supabase** (when ready):
   - Create a Supabase project
   - Configure environment variables (`.env.local`)
   - Run database migrations for the jobs table

2. **Implement Core Features**:
   - Kanban board with drag-and-drop
   - Quick-add slide-over form
   - Job detail pages

3. **Add More Components** (as needed):
   ```bash
   npx shadcn-ui@latest add [component-name]
   ```

## Project Structure

```
hunteros/
├── app/
│   ├── layout.tsx       # Root layout with Inter font
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles with Tailwind
├── components/
│   └── ui/              # Shadcn UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── separator.tsx
│       └── sheet.tsx
├── lib/
│   └── utils.ts         # Utility functions (cn helper)
├── tailwind.config.ts   # Tailwind config with custom colors
├── components.json      # Shadcn UI configuration
└── package.json         # Dependencies
```

## Customizations Applied

1. **Tailwind Config**:
   - Primary color set to `#CFFF04` (Electric Lime Green)
   - Foreground/text color set to `#09090B` (Dark)
   - Background set to `#FFFFFF` (White)
   - Custom `glow-pulse` animation for desperate priority

2. **Badge Component**:
   - Added custom `desperate` variant with animated glow effect

3. **Typography**:
   - Inter font loaded via Next.js font optimization
   - Font feature settings enabled for better typography

## Troubleshooting

### Issue: Components not rendering correctly
- Ensure Tailwind is processing correctly: `npm run dev`
- Check that `app/globals.css` is imported in `app/layout.tsx`

### Issue: Colors not matching design system
- Verify `tailwind.config.ts` has the correct hex values
- Check that CSS variables in `globals.css` match

### Issue: TypeScript errors
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` path aliases are correct

