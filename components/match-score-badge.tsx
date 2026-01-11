"use client";

import { Badge } from "@/components/ui/badge";
import { getScoreCategory, formatMatchScore, getScoreColorClass } from "@/lib/match-score-helpers";
import type { MatchScoreCategory } from "@/types/job";
import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
  score: number | null;
  showLabel?: boolean;
  className?: string;
}

/**
 * Match Score Badge Component
 * Displays AI-generated match score with color coding
 */
export function MatchScoreBadge({
  score,
  showLabel = true,
  className,
}: MatchScoreBadgeProps) {
  if (score === null) {
    return (
      <Badge variant="outline" className={cn("text-xs", className)}>
        No Score
      </Badge>
    );
  }

  const category: MatchScoreCategory = getScoreCategory(score);
  const colorClass = getScoreColorClass(category);
  const formattedScore = formatMatchScore(score);
  const categoryLabel =
    category === "low"
      ? "Low"
      : category === "mid"
      ? "Mid"
      : "High";

  return (
    <Badge
      className={cn(
        "text-xs font-semibold border",
        colorClass,
        className
      )}
      title={`Match Score: ${formattedScore} (${categoryLabel})`}
    >
      {formattedScore}
      {showLabel && (
        <span className="ml-1 opacity-75">({categoryLabel})</span>
      )}
    </Badge>
  );
}

/**
 * Match Score with Progress Indicator
 * Shows score with a visual progress bar
 */
interface MatchScoreProgressProps {
  score: number | null;
  className?: string;
}

export function MatchScoreProgress({
  score,
  className,
}: MatchScoreProgressProps) {
  if (score === null) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <div className="text-xs text-muted-foreground">Match Score: N/A</div>
        <div className="w-full h-2 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  const category: MatchScoreCategory = getScoreCategory(score);
  const colorClass = getScoreColorClass(category);
  const percentage = (score / 10) * 100;

  // Get background color for progress bar
  const progressColor =
    category === "low"
      ? "bg-red-500"
      : category === "mid"
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Match Score</span>
        <span className="text-xs font-semibold">{score}/10</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", progressColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
