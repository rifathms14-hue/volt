"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExternalLink, Calendar, MapPin, Briefcase, Trash2, Pencil, RefreshCw } from "lucide-react";
import type { Job } from "@/types/job";
import { cn } from "@/lib/utils";
import { deleteJobAction } from "@/actions/delete-job";
import { recalculateMatchScoreAction } from "@/actions/recalculate-match-score";
import { MatchScoreProgress } from "@/components/match-score-badge";
import { EditJobSheet } from "@/components/edit-job-sheet";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface JobDetailSheetProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Job Detail Sheet Component
 * Displays detailed information about a job in a side panel
 */
export function JobDetailSheet({
  job,
  open,
  onOpenChange,
}: JobDetailSheetProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  if (!job) return null;

  const isDesperate = job.priority === "desperate";

  /**
   * Handle edit job
   */
  const handleEdit = () => {
    // Close the detail sheet and open the edit sheet
    onOpenChange(false);
    setEditSheetOpen(true);
  };

  /**
   * Handle edit sheet close
   */
  const handleEditSheetClose = (open: boolean) => {
    setEditSheetOpen(open);
    // EditJobSheet component handles refreshing after successful update
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  /**
   * Handle re-calculate match score
   */
  const handleRecalculateScore = async () => {
    if (!job) return;

    setIsRecalculating(true);
    try {
      const result = await recalculateMatchScoreAction(job.id);

      if (result.success && result.score !== undefined) {
        toast.success("Match score calculated", {
          description: `New score: ${result.score}/10`,
        });
        router.refresh(); // Refresh to show updated score
      } else {
        toast.error("Failed to calculate match score", {
          description: result.error || "Please try again",
        });
      }
    } catch (error) {
      console.error("Error recalculating match score:", error);
      toast.error("Failed to calculate match score", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  /**
   * Handle delete job
   */
  const handleDeleteConfirm = async () => {
    if (!job) return;

    setIsDeleting(true);
    setDeleteDialogOpen(false);

    try {
      const result = await deleteJobAction(job.id);

      if (result.success) {
        toast.success("Job deleted successfully");
        onOpenChange(false);
        router.refresh(); // Refresh the page to update the kanban board
      } else {
        toast.error("Failed to delete job", {
          description: result.error || "Please try again",
        });
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-6">
          <SheetHeader>
            <div className="flex-1">
              <SheetTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                {job.company_name}
                {isDesperate && (
                  <span className="text-[#CFFF04]" title="Desperate Priority">
                    ⚡
                  </span>
                )}
              </SheetTitle>
              <p className="text-muted-foreground mt-1">{job.job_title}</p>
              {isDesperate && (
                <div className="mt-2">
                  <Badge variant="desperate">
                    DESPERATE
                  </Badge>
                </div>
              )}
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
          {/* Match Score */}
          {job.match_score !== null && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-foreground">
                  Match Score
                </h4>
                {job.resume_file_path && job.application_link && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRecalculateScore}
                    disabled={isRecalculating}
                    className="h-7 text-xs"
                  >
                    <RefreshCw
                      className={cn(
                        "h-3 w-3 mr-1",
                        isRecalculating && "animate-spin"
                      )}
                    />
                    {isRecalculating ? "Calculating..." : "Re-calculate"}
                  </Button>
                )}
              </div>
              <MatchScoreProgress score={job.match_score} />
            </div>
          )}

          {/* Status and Priority */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="outline" className="text-xs">
                {formatStatus(job.status)}
              </Badge>
            </div>
            {job.priority !== "desperate" && (
              <Badge
                variant={
                  job.priority === "high"
                    ? "high"
                    : job.priority === "medium"
                    ? "medium"
                    : "low"
                }
                className="text-xs"
              >
                {job.priority.toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Application Link */}
          {job.application_link && (
            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(job.application_link!, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Application
              </Button>
            </div>
          )}

          {/* Salary Range */}
          {job.salary_range && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">
                Salary Range
              </h4>
              <p className="text-sm text-muted-foreground">{job.salary_range}</p>
            </div>
          )}

          {/* Platform */}
          {job.platform && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">
                Platform
              </h4>
              <p className="text-sm text-muted-foreground">{job.platform}</p>
            </div>
          )}

          {/* City/Location */}
          {job.city && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">Location</h4>
                <p className="text-sm text-muted-foreground">{job.city}</p>
              </div>
            </div>
          )}

          {/* Date Applied */}
          {job.date_applied && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Date Applied
                </h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(job.date_applied)}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {job.notes && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Notes
              </h4>
              <div
                className={cn(
                  "p-3 rounded-md border bg-card text-sm text-foreground whitespace-pre-wrap",
                  isDesperate && "border-[#CFFF04]/30"
                )}
              >
                {job.notes}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Created:</span>
              <span>{formatDate(job.created_at)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Last Activity:</span>
              <span>{formatDate(job.last_activity_at)}</span>
            </div>
          </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="border-t p-6 bg-background">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex-1 bg-transparent border-foreground text-foreground hover:bg-[#fafafa] hover:text-foreground hover:border-foreground"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="flex-1 bg-transparent border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </SheetContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{job.company_name} - {job.job_title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-[#fafafa]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Job Sheet */}
      <EditJobSheet
        job={job}
        open={editSheetOpen}
        onOpenChange={handleEditSheetClose}
      />
    </Sheet>
  );
}
