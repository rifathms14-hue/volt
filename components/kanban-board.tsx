"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { JobCard } from "./job-card";
import { JobDetailSheet } from "./job-detail-sheet";
import { AddJobSheet } from "./add-job-sheet";
import { cn } from "@/lib/utils";
import type { Job, JobStatus } from "@/types/job";
import { createClient } from "@/lib/supabase/client";
import { Ghost, Plus } from "lucide-react";

interface KanbanBoardProps {
  initialJobs: Job[];
}

/**
 * Kanban Board Column Configuration
 * Maps job statuses to display columns
 */
const COLUMNS: {
  id: JobStatus;
  title: string;
  statuses: JobStatus[];
}[] = [
  {
    id: "discovered",
    title: "Discovered",
    statuses: ["discovered"],
  },
  {
    id: "applied",
    title: "Applied",
    statuses: ["applied"],
  },
  {
    id: "screening",
    title: "Interviewing",
    statuses: ["screening", "technical", "final_round"],
  },
  {
    id: "offer",
    title: "Offer",
    statuses: ["offer"],
  },
  {
    id: "rejected",
    title: "Rejected",
    statuses: ["rejected"],
  },
];

/**
 * Kanban Board Component
 * Displays jobs in a drag-and-drop board with optimistic updates
 */
export function KanbanBoard({ initialJobs }: KanbanBoardProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [addJobSheetOpen, setAddJobSheetOpen] = useState(false);
  const [addJobDefaultStatus, setAddJobDefaultStatus] = useState<JobStatus>("applied");

  // Sync with initialJobs if they change (server-side updates)
  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  /**
   * Handle job card click - open detail sheet
   */
  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsDetailSheetOpen(true);
  };

  /**
   * Handle add job button click - open add job sheet with default status
   */
  const handleAddJobClick = (status: JobStatus) => {
    setAddJobDefaultStatus(status);
    setAddJobSheetOpen(true);
  };

  /**
   * Get jobs for a specific column
   * Groups related statuses (e.g., screening, technical, final_round → Interviewing)
   */
  const getJobsForColumn = (columnId: JobStatus): Job[] => {
    const column = COLUMNS.find((col) => col.id === columnId);
    if (!column) return [];

    return jobs.filter((job) => column.statuses.includes(job.status));
  };

  /**
   * Handle drag end - update job status optimistically
   */
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area, do nothing
    if (!destination) return;

    // If dropped in the same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the job being moved
    const job = jobs.find((j) => j.id === draggableId);
    if (!job) return;

    // Determine the new status based on the destination column
    const destinationColumn = COLUMNS.find(
      (col) => col.id === destination.droppableId as JobStatus
    );
    if (!destinationColumn) return;

    // Use the primary status for the column (first in the array)
    const newStatus = destinationColumn.statuses[0];

    // Store original jobs for potential revert
    const originalJobs = [...jobs];

    // Optimistic update: Update UI immediately
    const updatedJobs = jobs.map((j) =>
      j.id === draggableId
        ? { ...j, status: newStatus, last_activity_at: new Date().toISOString() }
        : j
    );
    setJobs(updatedJobs);

    // Update Supabase in the background
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus, last_activity_at: new Date().toISOString() })
        .eq("id", draggableId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      // Revert on error - restore original jobs array
      setJobs(originalJobs);
    }
  };

  return (
    <div className="w-full">
      {/* Board Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Job Pipeline
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Drag cards between columns to update job status
        </p>
      </div>

      {/* Kanban Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {COLUMNS.map((column) => {
            const columnJobs = getJobsForColumn(column.id);

            return (
              <div key={column.id} className="flex flex-col">
                {/* Column Header */}
                <div className="sticky top-16 z-40 mb-3 px-2 pb-2 border-b border-primary/20 bg-background">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    {column.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {columnJobs.length} {columnJobs.length === 1 ? "job" : "jobs"}
                  </span>
                </div>

                {/* Droppable Column */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                        "flex-1 min-h-[200px] p-3 rounded-2xl transition-colors",
                        // Default: Subtle dashed outline (darker/more visible)
                        "border border-dashed border-slate-300 bg-background",
                        // When dragging over: Solid border with slight highlight
                        snapshot.isDraggingOver && [
                          "border-solid border-[#CFFF04]",
                          "bg-secondary/50",
                        ]
                      )}
                    >
                      {columnJobs.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-center gap-2">
                          <Ghost className="h-6 w-6 text-muted-foreground/40" />
                          <p className="text-xs text-muted-foreground">
                            No jobs in this column
                          </p>
                        </div>
                      )}

                      {columnJobs.map((job, index) => (
                        <Draggable key={job.id} draggableId={job.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <JobCard
                                job={job}
                                isDragging={snapshot.isDragging}
                                onClick={() => handleJobClick(job)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {/* Add New Job Button */}
                      <button
                        type="button"
                        onClick={() => handleAddJobClick(column.statuses[0])}
                        className={cn(
                          "w-full mt-3 h-9 rounded-xl transition-colors",
                          "bg-transparent border-0 text-foreground",
                          "hover:bg-[#f9f9f9]",
                          "flex items-center justify-center gap-2 text-sm font-medium"
                        )}
                      >
                        <Plus className="h-4 w-4" />
                        Add New Job
                      </button>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Job Detail Sheet */}
      <JobDetailSheet
        job={selectedJob}
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
      />

      {/* Add Job Sheet */}
      <AddJobSheet
        defaultStatus={addJobDefaultStatus}
        open={addJobSheetOpen}
        onOpenChange={setAddJobSheetOpen}
      />
    </div>
  );
}
