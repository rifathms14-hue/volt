import type { MatchScoreCategory } from "@/types/job";

/**
 * Match score thresholds
 */
export const MATCH_SCORE_THRESHOLDS = {
  LOW_MAX: 3,
  MID_MAX: 6,
  HIGH_MAX: 10,
} as const;

/**
 * Get score category from numeric score
 * @param score - Match score (1-10)
 * @returns Score category
 */
export function getScoreCategory(score: number): MatchScoreCategory {
  if (score >= 1 && score <= MATCH_SCORE_THRESHOLDS.LOW_MAX) return "low";
  if (
    score > MATCH_SCORE_THRESHOLDS.LOW_MAX &&
    score <= MATCH_SCORE_THRESHOLDS.MID_MAX
  )
    return "mid";
  if (
    score > MATCH_SCORE_THRESHOLDS.MID_MAX &&
    score <= MATCH_SCORE_THRESHOLDS.HIGH_MAX
  )
    return "high";
  return "low"; // Default fallback
}

/**
 * Format match score for display
 * @param score - Match score (1-10)
 * @returns Formatted score string
 */
export function formatMatchScore(score: number | null): string {
  if (score === null) return "N/A";
  return `${score}/10`;
}

/**
 * Get color class for match score category
 * @param category - Score category
 * @returns Tailwind CSS color classes
 */
export function getScoreColorClass(category: MatchScoreCategory): string {
  switch (category) {
    case "low":
      return "bg-red-100 text-red-800 border-red-200";
    case "mid":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "high":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
