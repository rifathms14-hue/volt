"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchScoreBadge } from "@/components/match-score-badge";
import type { Job } from "@/types/job";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  isDragging?: boolean;
  onClick?: () => void;
}

/**
 * Job Card Component
 * Displays a single job with special styling for "desperate" priority
 */
export function JobCard({ job, isDragging = false, onClick }: JobCardProps) {
  const isDesperate = job.priority === "desperate";

  // Handle click - prevent if dragging
  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging && onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get priority label
  const getPriorityLabel = () => {
    if (job.priority === "desperate") return "DESPERATE";
    return job.priority.toUpperCase();
  };

  return (
    <Card
      onClick={handleClick}
      className={cn(
        "mb-3 transition-all hover:shadow-md",
        // Default: Minimalist white card with 1px black border
        "border border-border bg-card",
        // Cursor: pointer for clicks, grab for dragging
        onClick && !isDragging ? "cursor-pointer" : "cursor-grab active:cursor-grabbing",
        // Desperate: Electric Lime border with glowing shadow
        isDesperate && [
          "border-[#CFFF04]",
          "shadow-[0_0_15px_rgba(207,255,4,0.4)]",
          "hover:shadow-[0_0_20px_rgba(207,255,4,0.6)]",
        ],
        // Dragging state
        isDragging && "opacity-50 rotate-2 scale-105"
      )}
    >
      <CardContent className="p-4 space-y-2">
        {/* 1. Priority and Match Score */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={
              isDesperate
                ? "desperate"
                : job.priority === "high"
                ? "high"
                : job.priority === "medium"
                ? "medium"
                : "low"
            }
            className="text-xs"
          >
            {getPriorityLabel()}
          </Badge>
          {job.match_score !== null && (
            <MatchScoreBadge score={job.match_score} showLabel={false} />
          )}
        </div>

        {/* 2. Company name */}
        <h3 className="font-semibold text-sm text-foreground truncate">
          {job.company_name}
        </h3>

        {/* 3. Job Role */}
        <p className="text-xs font-semibold text-muted-foreground truncate uppercase tracking-[0.02em]">
          {job.job_title}
        </p>

        {/* 4. Salary Range */}
        {job.salary_range && (
          <p className="text-xs text-muted-foreground">
            {job.salary_range}
          </p>
        )}

        {/* 5. Applied On */}
        {job.date_applied && (
          <p className="text-xs text-muted-foreground">
            Applied On: {formatDate(job.date_applied)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
