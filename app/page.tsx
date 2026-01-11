import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/kanban-board";
import { AddJobSheet } from "@/components/add-job-sheet";
import { Toaster } from "sonner";
import type { Job } from "@/types/job";
import Image from "next/image";

/**
 * Main Dashboard Page
 * Fetches jobs from Supabase server-side and passes them to the Kanban board
 */
export default async function Home() {
  let jobs: Job[] = [];
  
  try {
    const supabase = await createClient();
    
    // Fetch all jobs, sorted by last_activity_at descending
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("last_activity_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
      jobs = [];
    } else {
      jobs = (data || []) as Job[];
    }
  } catch (error) {
    console.error("Error creating Supabase client or fetching jobs:", error);
    // If Supabase is not configured or query fails, return empty array
    jobs = [];
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Volt Logo"
              width={20}
              height={20}
              className="h-5 w-5"
              priority
            />
            <h1 className="text-xl font-bold tracking-tighter text-foreground">
              Volt.
            </h1>
          </div>
          {/* Right: Add New Job Button */}
          <div>
            <AddJobSheet />
          </div>
        </div>
      </header>

      {/* Main Content - Kanban Board */}
      <main className="container mx-auto px-6 py-8">
        <KanbanBoard initialJobs={jobs} />
      </main>

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
