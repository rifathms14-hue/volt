# HunterOS - Professional Job Tracking Application

A production-grade job tracking application built with Next.js 14, TypeScript, Tailwind CSS, and Shadcn UI. Featuring a brutalist minimalist design with an electric lime green accent.

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL) - *to be configured*

## Design System

### Color Palette (70/20/10)
- **70% Background**: `#FFFFFF` (White)
- **20% Structure & Text**: `#09090B` (Dark Gray/Black)
- **10% Accent**: `#CFFF04` (Electric Lime Green)

### Typography
- **Font**: Inter (loaded via Next.js font optimization)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/              # Next.js App Router pages and layouts
├── components/       # React components
│   └── ui/          # Shadcn UI components
├── lib/             # Utility functions and helpers
└── public/          # Static assets
```

## Installed Shadcn Components

- ✅ Button
- ✅ Input
- ✅ Label
- ✅ Card (with Header, Title, Description, Content, Footer)
- ✅ Badge (with custom "desperate" variant)
- ✅ Separator
- ✅ Sheet (slide-over component)

## Next Steps

1. Set up Supabase database and schema
2. Configure environment variables
3. Implement Kanban board with drag-and-drop
4. Build Quick-Add slide-over form
5. Create job detail pages

## Custom Features

- **Glow Pulse Animation**: Special animation for "desperate" priority jobs (defined in `tailwind.config.ts`)
- **Custom Badge Variant**: "desperate" variant with animated glow effect

